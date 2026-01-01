import { Express } from "express";
import initLogger from "@src/logger";

import * as common from "oci-common";
import * as queue from "oci-queue";

type AuthMode = "instance_principal" | "config_file";

export interface QueuesConfig {
    // Auth
    OCI_AUTH_MODE: AuthMode;
    OCI_REGION: string;

    // IMPORTANT: queue "messages endpoint"
    OCI_QUEUE_MESSAGES_ENDPOINT: string;

    // Local auth (only when OCI_AUTH_MODE=config_file)
    OCI_CONFIG_FILE_PATH?: string; // default "~/.oci/config"
    OCI_CONFIG_PROFILE?: string;   // default "DEFAULT"

    // Retry
    OCI_QUEUE_MAX_RETRIES?: number;   // default 3
    OCI_QUEUE_RETRY_BASE_MS?: number; // default 200
}

export type PutMessageInput = string | { content: string };

export interface QueueRef {
    queueId: string;        // required
    channel?: string;       // optional
    name?: string;          // optional, for logs only (e.g. "high", "batch", "result")
}

export interface PutOpts extends QueueRef {}

export interface GetOpts extends QueueRef {
    limit?: number;               // default 10
    timeoutInSeconds?: number;    // default 20
    visibilityInSeconds?: number; // default 30
}

export interface DeleteOpts extends QueueRef {}

class Queues {
    private static instance: Queues | null = null;
    private static initialized = false;

    private static config: QueuesConfig = {
        OCI_AUTH_MODE: "instance_principal",
        OCI_REGION: "",
        OCI_QUEUE_MESSAGES_ENDPOINT: "",
        OCI_QUEUE_MAX_RETRIES: 3,
        OCI_QUEUE_RETRY_BASE_MS: 200,
    };

    private static client: queue.QueueClient | null = null;
    private static logger = initLogger("info");

    public static async initApp(app: Express): Promise<void> {
        const cfg = app.get("config") as Partial<QueuesConfig>;
        await Queues.init(cfg);
    }

    public static async init(cfg: Partial<QueuesConfig>): Promise<void> {
        Queues.config = {
            ...Queues.config,
            ...cfg,
            OCI_QUEUE_MAX_RETRIES: cfg.OCI_QUEUE_MAX_RETRIES ?? Queues.config.OCI_QUEUE_MAX_RETRIES ?? 3,
            OCI_QUEUE_RETRY_BASE_MS: cfg.OCI_QUEUE_RETRY_BASE_MS ?? Queues.config.OCI_QUEUE_RETRY_BASE_MS ?? 200,
        };

        Queues.logger = initLogger("info");

        if (!Queues.config.OCI_QUEUE_MESSAGES_ENDPOINT) {
            throw new Error("OCI_QUEUE_MESSAGES_ENDPOINT is required (Queue Messages endpoint).");
        }
        if (!Queues.config.OCI_REGION) {
            throw new Error("OCI_REGION is required.");
        }

        if (!Queues.client) {
            const provider = await Queues.buildAuthProvider(Queues.config);
            const client = new queue.QueueClient({ authenticationDetailsProvider: provider });

            // Messages endpoint must be set explicitly
            client.endpoint = Queues.config.OCI_QUEUE_MESSAGES_ENDPOINT;

            Queues.client = client;
        }

        Queues.initialized = true;
        Queues.logger.info("OCIQueues initialized");
    }

    public static getInstance(): Queues {
        if (!Queues.initialized) {
            throw new Error("OCIQueues not initialized. Call OCIQueues.initApp() or OCIQueues.init() first.");
        }
        if (!Queues.instance) Queues.instance = new Queues();
        return Queues.instance;
    }

    private constructor() {}

    private static async buildAuthProvider(cfg: QueuesConfig): Promise<common.AuthenticationDetailsProvider> {
        if (cfg.OCI_AUTH_MODE === "instance_principal") {
            return await new common.InstancePrincipalsAuthenticationDetailsProviderBuilder().build();
        }
        const filePath = cfg.OCI_CONFIG_FILE_PATH ?? process.env.OCI_CONFIG_FILE_PATH ?? "~/.oci/config";
        const profile = cfg.OCI_CONFIG_PROFILE ?? process.env.OCI_CONFIG_PROFILE ?? "DEFAULT";
        return new common.ConfigFileAuthenticationDetailsProvider(filePath, profile);
    }

    private getClient(): queue.QueueClient {
        if (!Queues.client) throw new Error("OCI Queue client not initialized.");
        return Queues.client;
    }

    private stringifyErr(err: any): string {
        if (!err) return "Unknown error";
        if (typeof err === "string") return err;
        if (err instanceof Error) return `${err.name}: ${err.message}`;
        try { return JSON.stringify(err); } catch { return String(err); }
    }

    private async withRetries<T>(fn: () => Promise<T>, label: string): Promise<T> {
        const maxRetries = Queues.config.OCI_QUEUE_MAX_RETRIES ?? 3;
        const baseMs = Queues.config.OCI_QUEUE_RETRY_BASE_MS ?? 200;

        let lastErr: any;
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return await fn();
            } catch (err: any) {
                lastErr = err;
                const isLast = attempt === maxRetries;

                Queues.logger.error(
                    `[OCIQueues] ${label} failed (attempt ${attempt + 1}/${maxRetries + 1}): ${this.stringifyErr(err)}`
                );

                if (isLast) break;
                const backoff = baseMs * Math.pow(2, attempt);
                await new Promise((r) => setTimeout(r, backoff));
            }
        }
        throw lastErr;
    }

    private metaLabel(meta: QueueRef) {
        const namePart = meta.name ? ` name=${meta.name}` : "";
        const chanPart = meta.channel ? ` channel=${meta.channel}` : "";
        return `queueId=${meta.queueId}${namePart}${chanPart}`;
    }

    // ---------------------------
    // Public API: put/get/delete (pure wrapper)
    // ---------------------------

    public async putMessages(messages: PutMessageInput[] | PutMessageInput, meta: PutOpts) {
        if (!meta?.queueId) throw new Error("putMessages: meta.queueId is required");
        const arr = Array.isArray(messages) ? messages : [messages];

        const putMessagesDetails: any = {
            messages: arr.map((m) => (typeof m === "string" ? { content: m } : { content: m.content })),
            ...(meta.channel ? { channel: meta.channel } : {}),
        };

        const client = this.getClient();

        return this.withRetries(
            async () => {
                const resp = await client.putMessages({ queueId: meta.queueId, putMessagesDetails } as any);
                Queues.logger.info(`[OCIQueues] putMessages ok ${this.metaLabel(meta)} count=${arr.length}`);
                return resp;
            },
            `putMessages(${this.metaLabel(meta)})`
        );
    }

    public async getMessages(meta: GetOpts) {
        if (!meta?.queueId) throw new Error("getMessages: meta.queueId is required");

        const limit = meta.limit ?? 10;
        const timeoutInSeconds = meta.timeoutInSeconds ?? 20;
        const visibilityInSeconds = meta.visibilityInSeconds ?? 30;

        const client = this.getClient();

        return this.withRetries(
            async () => {
                const resp = await client.getMessages({
                    queueId: meta.queueId,
                    limit,
                    timeoutInSeconds,
                    visibilityInSeconds,
                    ...(meta.channel ? { channel: meta.channel } : {}),
                } as any);

                Queues.logger.info(
                    `[OCIQueues] getMessages ok ${this.metaLabel(meta)} limit=${limit} timeout=${timeoutInSeconds}s visibility=${visibilityInSeconds}s`
                );
                return resp;
            },
            `getMessages(${this.metaLabel(meta)})`
        );
    }

    public async deleteMessages(receipts: string[] | string, meta: DeleteOpts) {
        if (!meta?.queueId) throw new Error("deleteMessages: meta.queueId is required");

        const arr = Array.isArray(receipts) ? receipts : [receipts];

        const deleteMessagesDetails: any = {
            entries: arr.map((r) => ({ receipt: r })),
            ...(meta.channel ? { channel: meta.channel } : {}),
        };

        const client = this.getClient();

        return this.withRetries(
            async () => {
                const resp = await client.deleteMessages({ queueId: meta.queueId, deleteMessagesDetails } as any);
                Queues.logger.info(`[OCIQueues] deleteMessages ok ${this.metaLabel(meta)} count=${arr.length}`);
                return resp;
            },
            `deleteMessages(${this.metaLabel(meta)})`
        );
    }

    // ---------------------------
    // Optional sugar: create meta from env map
    // (keeps wrapper clean; your app can build this elsewhere)
    // ---------------------------
    public static queueRef(queueId: string, channel?: string, name?: string): QueueRef {
        return { queueId, channel, name };
    }
}

export default Queues;
