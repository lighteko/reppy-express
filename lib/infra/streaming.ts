import { Express } from "express";
import initLogger from "@src/logger";

import * as common from "oci-common";
import * as streaming from "oci-streaming"; // 패키지 확인 필요

type AuthMode = "instance_principal" | "config_file";

export interface StreamingConfig {
    OCI_AUTH_MODE: AuthMode;
    OCI_REGION: string;

    // Streaming endpoint (예: https://cell-1.streaming.<region>.oci.oraclecloud.com)
    OCI_STREAMING_ENDPOINT: string;

    // Local auth
    OCI_CONFIG_FILE_PATH?: string;
    OCI_CONFIG_PROFILE?: string;

    // Retry
    OCI_STREAM_MAX_RETRIES?: number;
    OCI_STREAM_RETRY_BASE_MS?: number;
}

export interface StreamRef {
    streamId: string;
    name?: string;          // log only
    // consumer group을 쓰면 여기에 groupName 같은 것 추가
}

export interface ConsumeOpts extends StreamRef {
    partition?: string;     // or number, depends on SDK
    limit?: number;         // default 100
    timeoutMs?: number;     // default 20000
    cursor?: string;        // start cursor; 없으면 latest/trim horizon 선택
    cursorType?: "LATEST" | "TRIM_HORIZON" | "AT_CURSOR";
}

class Streaming {
    private static instance: Streaming | null = null;
    private static initialized = false;

    private static config: StreamingConfig = {
        OCI_AUTH_MODE: "instance_principal",
        OCI_REGION: "",
        OCI_STREAMING_ENDPOINT: "",
        OCI_STREAM_MAX_RETRIES: 3,
        OCI_STREAM_RETRY_BASE_MS: 200,
    };

    private static client: streaming.StreamClient | null = null;
    private static logger = initLogger("info");

    public static async initApp(app: Express) {
        const cfg = app.get("config") as Partial<StreamingConfig>;
        await Streaming.init(cfg);
    }

    public static async init(cfg: Partial<StreamingConfig>) {
        Streaming.config = {
            ...Streaming.config,
            ...cfg,
            OCI_STREAM_MAX_RETRIES: cfg.OCI_STREAM_MAX_RETRIES ?? Streaming.config.OCI_STREAM_MAX_RETRIES ?? 3,
            OCI_STREAM_RETRY_BASE_MS: cfg.OCI_STREAM_RETRY_BASE_MS ?? Streaming.config.OCI_STREAM_RETRY_BASE_MS ?? 200,
        };

        Streaming.logger = initLogger("info");

        if (!Streaming.config.OCI_STREAMING_ENDPOINT) {
            throw new Error("OCI_STREAMING_ENDPOINT is required.");
        }
        if (!Streaming.config.OCI_REGION) {
            throw new Error("OCI_REGION is required.");
        }

        if (!Streaming.client) {
            const provider = await Streaming.buildAuthProvider(Streaming.config);
            const client = new streaming.StreamClient({ authenticationDetailsProvider: provider });
            client.endpoint = Streaming.config.OCI_STREAMING_ENDPOINT;
            Streaming.client = client;
        }

        Streaming.initialized = true;
        Streaming.logger.info("OCIStreaming initialized");
    }

    public static getInstance(): Streaming {
        if (!Streaming.initialized) {
            throw new Error("OCIStreaming not initialized. Call init() first.");
        }
        if (!Streaming.instance) Streaming.instance = new Streaming();
        return Streaming.instance;
    }

    private constructor() {}

    private static async buildAuthProvider(cfg: StreamingConfig): Promise<common.AuthenticationDetailsProvider> {
        if (cfg.OCI_AUTH_MODE === "instance_principal") {
            return await new common.InstancePrincipalsAuthenticationDetailsProviderBuilder().build();
        }
        const filePath = cfg.OCI_CONFIG_FILE_PATH ?? process.env.OCI_CONFIG_FILE_PATH ?? "~/.oci/config";
        const profile = cfg.OCI_CONFIG_PROFILE ?? process.env.OCI_CONFIG_PROFILE ?? "DEFAULT";
        return new common.ConfigFileAuthenticationDetailsProvider(filePath, profile);
    }

    private getClient(): streaming.StreamClient {
        if (!Streaming.client) throw new Error("OCI Streaming client not initialized.");
        return Streaming.client;
    }

    private async withRetries<T>(fn: () => Promise<T>, label: string): Promise<T> {
        const maxRetries = Streaming.config.OCI_STREAM_MAX_RETRIES ?? 3;
        const baseMs = Streaming.config.OCI_STREAM_RETRY_BASE_MS ?? 200;

        let lastErr: any;
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return await fn();
            } catch (err: any) {
                lastErr = err;
                const isLast = attempt === maxRetries;
                Streaming.logger.error(`[OCIStreaming] ${label} failed (attempt ${attempt + 1}/${maxRetries + 1}): ${String(err?.message ?? err)}`);
                if (isLast) break;
                await new Promise((r) => setTimeout(r, baseMs * Math.pow(2, attempt)));
            }
        }
        throw lastErr;
    }

    private metaLabel(meta: StreamRef) {
        return `streamId=${meta.streamId}${meta.name ? ` name=${meta.name}` : ""}`;
    }

    // ---- cursor helpers ----
    public async createCursor(meta: ConsumeOpts) {
        const client = this.getClient();
        const cursorType = meta.cursor ? "AT_CURSOR" : (meta.cursorType ?? "LATEST");

        // SDK에 따라 createCursorDetails 구조가 다름. 여기만 한번 맞추면 됨.
        return this.withRetries(async () => {
            const resp: any = await client.createCursor({
                streamId: meta.streamId,
                createCursorDetails: {
                    type: cursorType,
                    cursor: meta.cursor,
                    partition: meta.partition,
                },
            } as any);

            const cursor = resp?.cursor?.value ?? resp?.value ?? resp?.data?.value;
            return cursor as string;
        }, `createCursor(${this.metaLabel(meta)})`);
    }

    public async getRecords(meta: StreamRef & { cursor: string; limit?: number; timeoutMs?: number }) {
        const client = this.getClient();
        const limit = meta.limit ?? 100;

        return this.withRetries(async () => {
            const resp: any = await client.getMessages({
                streamId: meta.streamId,
                cursor: meta.cursor,
                limit,
            } as any);

            // SDK에 따라 messages/nextCursor 위치 다름
            const messages = resp?.messages ?? resp?.getMessages?.messages ?? resp?.data?.messages ?? [];
            const nextCursor = resp?.opcNextCursor ?? resp?.nextCursor ?? resp?.data?.opcNextCursor;

            return { messages, nextCursor } as { messages: any[]; nextCursor?: string };
        }, `getMessages(${this.metaLabel(meta)})`);
    }

    // ---- high-level: consume loop helper ----
    public async consume(
        opts: ConsumeOpts,
        onMessages: (msgs: any[], ctx: { nextCursor?: string; commit: () => Promise<void> }) => Promise<void>
    ) {
        let cursor = opts.cursor ?? await this.createCursor(opts);
        let nextCursor: string | undefined;

        while (true) {
            const { messages, nextCursor: nc } = await this.getRecords({ ...opts, cursor, limit: opts.limit });
            nextCursor = nc;

            if (!messages.length) {
                // timeout/backoff는 호출자가 해도 되고 wrapper가 해도 됨
                await new Promise((r) => setTimeout(r, 100));
                cursor = nextCursor ?? cursor;
                continue;
            }

            await onMessages(messages, {
                nextCursor,
                commit: async () => {
                    // commit은 “다음 커서로 이동” (저장소에 persist 하면 더 좋음)
                    if (nextCursor) cursor = nextCursor;
                },
            });

            if (nextCursor) cursor = nextCursor;
        }
    }
}

export default Streaming;
