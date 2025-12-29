import { Express } from "express";
import initLogger from "@src/logger";

import * as common from "oci-common";
import * as queue from "oci-queue";

type AuthMode = "instance_principal" | "config_file";

export interface OCIQueuesConfig {
    // Auth
    OCI_AUTH_MODE: AuthMode;
    OCI_REGION: string;

    // IMPORTANT: queue "messages endpoint"
    // (Queue OCID랑 별개. 큐 상세에서 messagesEndpoint 확인해서 넣어야 함)
    OCI_QUEUE_MESSAGES_ENDPOINT: string;

    // Two queues
    OCI_QUEUE_HIGH_ID: string;
    OCI_QUEUE_BATCH_ID: string;

    // Optional: use channel inside each queue (not required)
    OCI_QUEUE_HIGH_CHANNEL?: string;
    OCI_QUEUE_BATCH_CHANNEL?: string;

    // Local auth (only when OCI_AUTH_MODE=config_file)
    OCI_CONFIG_FILE_PATH?: string; // default "~/.oci/config"
    OCI_CONFIG_PROFILE?: string;   // default "DEFAULT"

    // Retry
    OCI_QUEUE_MAX_RETRIES?: number;    // default 3
    OCI_QUEUE_RETRY_BASE_MS?: number;  // default 200
}

export type PutMessageInput =
    | string
    | { content: string };

export interface EnqueueOpts {
    // If you want to override channel per call
    channel?: string;
}

export interface DequeueOpts {
    limit?: number;               // default 10
    timeoutInSeconds?: number;    // default 20
    visibilityInSeconds?: number; // default 30
    channel?: string;
}

export interface DeleteOpts {
    channel?: string;
}

class OCIQueues {
    private static instance: OCIQueues | null = null;
    private static initialized = false;

    private static config: OCIQueuesConfig = {
        OCI_AUTH_MODE: "instance_principal",
        OCI_REGION: "",
        OCI_QUEUE_MESSAGES_ENDPOINT: "",

        OCI_QUEUE_HIGH_ID: "",
        OCI_QUEUE_BATCH_ID: "",

        OCI_QUEUE_MAX_RETRIES: 3,
        OCI_QUEUE_RETRY_BASE_MS: 200,
    };

    private static client: queue.QueueClient | null = null;
    private static logger = initLogger("info");

    public static async initApp(app: Express): Promise<void> {
        const cfg = app.get("config") as Partial<OCIQueuesConfig>;
        await OCIQueues.init(cfg);
    }

    public static async init(cfg: Partial<OCIQueuesConfig>): Promise<void> {
        OCIQueues.config = {
            ...OCIQueues.config,
            ...cfg,
            OCI_QUEUE_MAX_RETRIES: cfg.OCI_QUEUE_MAX_RETRIES ?? OCIQueues.config.OCI_QUEUE_MAX_RETRIES ?? 3,
            OCI_QUEUE_RETRY_BASE_MS: cfg.OCI_QUEUE_RETRY_BASE_MS ?? OCIQueues.config.OCI_QUEUE_RETRY_BASE_MS ?? 200,
        };

        OCIQueues.logger = initLogger("info");

        if (!OCIQueues.config.OCI_QUEUE_MESSAGES_ENDPOINT) {
            throw new Error("OCI_QUEUE_MESSAGES_ENDPOINT is required (Queue Messages endpoint).");
        }
        if (!OCIQueues.config.OCI_QUEUE_HIGH_ID) {
            throw new Error("OCI_QUEUE_HIGH_ID is required.");
        }
        if (!OCIQueues.config.OCI_QUEUE_BATCH_ID) {
            throw new Error("OCI_QUEUE_BATCH_ID is required.");
        }
        if (!OCIQueues.config.OCI_REGION) {
            throw new Error("OCI_REGION is required.");
        }

        if (!OCIQueues.client) {
            const provider = await OCIQueues.buildAuthProvider(OCIQueues.config);
            const client = new queue.QueueClient({ authenticationDetailsProvider: provider });

            // Messages endpoint must be set explicitly
            client.endpoint = OCIQueues.config.OCI_QUEUE_MESSAGES_ENDPOINT;

            OCIQueues.client = client;
        }

        OCIQueues.initialized = true;
        OCIQueues.logger.info("OCIQueues initialized");
    }

    public static getInstance(): OCIQueues {
        if (!OCIQueues.initialized) {
            throw new Error("OCIQueues not initialized. Call OCIQueues.initApp() or OCIQueues.init() first.");
        }
        if (!OCIQueues.instance) OCIQueues.instance = new OCIQueues();
        return OCIQueues.instance;
    }

    private constructor() {}

    private static async buildAuthProvider(cfg: OCIQueuesConfig): Promise<common.AuthenticationDetailsProvider> {
        if (cfg.OCI_AUTH_MODE === "instance_principal") {
            return await new common.InstancePrincipalsAuthenticationDetailsProviderBuilder().build();
        }
        const filePath = cfg.OCI_CONFIG_FILE_PATH ?? process.env.OCI_CONFIG_FILE ?? "~/.oci/config";
        const profile = cfg.OCI_CONFIG_PROFILE ?? process.env.OCI_CONFIG_PROFILE ?? "DEFAULT";
        return new common.ConfigFileAuthenticationDetailsProvider(filePath, profile);
    }

    private getClient(): queue.QueueClient {
        if (!OCIQueues.client) throw new Error("OCI Queue client not initialized.");
        return OCIQueues.client;
    }

    private stringifyErr(err: any): string {
        if (!err) return "Unknown error";
        if (typeof err === "string") return err;
        if (err instanceof Error) return `${err.name}: ${err.message}`;
        try { return JSON.stringify(err); } catch { return String(err); }
    }

    private async withRetries<T>(fn: () => Promise<T>, label: string): Promise<T> {
        const maxRetries = OCIQueues.config.OCI_QUEUE_MAX_RETRIES ?? 3;
        const baseMs = OCIQueues.config.OCI_QUEUE_RETRY_BASE_MS ?? 200;

        let lastErr: any;
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return await fn();
            } catch (err: any) {
                lastErr = err;
                const isLast = attempt === maxRetries;

                OCIQueues.logger.error(
                    `[OCIQueues] ${label} failed (attempt ${attempt + 1}/${maxRetries + 1}): ${this.stringifyErr(err)}`
                );

                if (isLast) break;
                const backoff = baseMs * Math.pow(2, attempt);
                await new Promise((r) => setTimeout(r, backoff));
            }
        }
        throw lastErr;
    }

    // ---------------------------
    // Public API: enqueue
    // ---------------------------
    public async enqueueHigh(messages: PutMessageInput[] | PutMessageInput, opts: EnqueueOpts = {}) {
        return this.enqueueToQueue(OCIQueues.config.OCI_QUEUE_HIGH_ID, messages, {
            channel: opts.channel ?? OCIQueues.config.OCI_QUEUE_HIGH_CHANNEL,
            queueName: "high",
        });
    }

    public async enqueueBatch(messages: PutMessageInput[] | PutMessageInput, opts: EnqueueOpts = {}) {
        return this.enqueueToQueue(OCIQueues.config.OCI_QUEUE_BATCH_ID, messages, {
            channel: opts.channel ?? OCIQueues.config.OCI_QUEUE_BATCH_CHANNEL,
            queueName: "batch",
        });
    }

    private async enqueueToQueue(
        queueId: string,
        messages: PutMessageInput[] | PutMessageInput,
        meta: { channel?: string; queueName: "high" | "batch" }
    ) {
        const arr = Array.isArray(messages) ? messages : [messages];
        const putMessagesDetails: any = {
            messages: arr.map((m) => (typeof m === "string" ? { content: m } : { content: m.content })),
        };
        if (meta.channel) putMessagesDetails.channel = meta.channel;

        const client = this.getClient();

        return this.withRetries(
            async () => {
                const resp = await client.putMessages({ queueId, putMessagesDetails } as any);
                OCIQueues.logger.info(
                    `[OCIQueues] enqueue ok target=${meta.queueName} queueId=${queueId} count=${arr.length}${meta.channel ? ` channel=${meta.channel}` : ""}`
                );
                return resp;
            },
            `putMessages(target=${meta.queueName})`
        );
    }

    // ---------------------------
    // Optional: consumer helpers (for debugging only)
    // Production consume should be Connector Hub -> Functions.
    // ---------------------------
    public async dequeueHigh(opts: DequeueOpts = {}) {
        return this.dequeueFromQueue(OCIQueues.config.OCI_QUEUE_HIGH_ID, opts, "high");
    }

    public async dequeueBatch(opts: DequeueOpts = {}) {
        return this.dequeueFromQueue(OCIQueues.config.OCI_QUEUE_BATCH_ID, opts, "batch");
    }

    private async dequeueFromQueue(queueId: string, opts: DequeueOpts, queueName: "high" | "batch") {
        const client = this.getClient();

        const limit = opts.limit ?? 10;
        const timeoutInSeconds = opts.timeoutInSeconds ?? 20;
        const visibilityInSeconds = opts.visibilityInSeconds ?? 30;
        const channel = opts.channel;

        return this.withRetries(
            async () => {
                const resp = await client.getMessages({
                    queueId,
                    limit,
                    timeoutInSeconds,
                    visibilityInSeconds,
                    ...(channel ? { channel } : {}),
                } as any);

                OCIQueues.logger.info(
                    `[OCIQueues] dequeue ok target=${queueName} queueId=${queueId} limit=${limit}${channel ? ` channel=${channel}` : ""}`
                );
                return resp;
            },
            `getMessages(target=${queueName})`
        );
    }

    public async deleteHigh(receipts: string[] | string, opts: DeleteOpts = {}) {
        return this.deleteFromQueue(OCIQueues.config.OCI_QUEUE_HIGH_ID, receipts, opts, "high");
    }

    public async deleteBatch(receipts: string[] | string, opts: DeleteOpts = {}) {
        return this.deleteFromQueue(OCIQueues.config.OCI_QUEUE_BATCH_ID, receipts, opts, "batch");
    }

    private async deleteFromQueue(
        queueId: string,
        receipts: string[] | string,
        opts: DeleteOpts,
        queueName: "high" | "batch"
    ) {
        const arr = Array.isArray(receipts) ? receipts : [receipts];
        const channel = opts.channel;

        const deleteMessagesDetails: any = {
            entries: arr.map((r) => ({ receipt: r })),
        };
        if (channel) deleteMessagesDetails.channel = channel;

        const client = this.getClient();

        return this.withRetries(
            async () => {
                const resp = await client.deleteMessages({ queueId, deleteMessagesDetails } as any);
                OCIQueues.logger.info(
                    `[OCIQueues] delete ok target=${queueName} queueId=${queueId} count=${arr.length}${channel ? ` channel=${channel}` : ""}`
                );
                return resp;
            },
            `deleteMessages(target=${queueName})`
        );
    }
}

export default OCIQueues;
