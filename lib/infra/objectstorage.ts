import { Express } from "express";
import initLogger from "@src/logger";

import * as common from "oci-common";
import * as objectstorage from "oci-objectstorage";

import * as path from "path";
import { createReadStream } from "fs";
import { Readable } from "stream";

type AuthMode = "instance_principal" | "config_file";

export interface ObjectStorageConfig {
    // Auth
    OCI_AUTH_MODE: AuthMode;
    OCI_REGION: string;

    // Object Storage
    OCI_OBJECT_STORAGE_NAMESPACE: string;
    OCI_OBJECT_STORAGE_BUCKET: string;

    // Local auth (only when OCI_AUTH_MODE=config_file)
    OCI_CONFIG_FILE_PATH?: string; // default "~/.oci/config"
    OCI_CONFIG_PROFILE?: string; // default "DEFAULT"

    // Retry
    OCI_OS_MAX_RETRIES?: number; // default 3
    OCI_OS_RETRY_BASE_MS?: number; // default 200
}

class ObjectStorage {
    private static instance: ObjectStorage | null = null;
    private static initialized = false;

    private static config: ObjectStorageConfig = {
        OCI_AUTH_MODE: "instance_principal",
        OCI_REGION: "",

        OCI_OBJECT_STORAGE_NAMESPACE: "",
        OCI_OBJECT_STORAGE_BUCKET: "",

        OCI_OS_MAX_RETRIES: 3,
        OCI_OS_RETRY_BASE_MS: 200,
    };

    private static client: objectstorage.ObjectStorageClient | null = null;
    private static logger = initLogger("info");

    namespace: string;
    bucket: string;

    public static async initApp(app: Express): Promise<void> {
        const cfg = app.get("config") as Partial<ObjectStorageConfig>;
        await ObjectStorage.init(cfg);
    }

    public static async init(cfg: Partial<ObjectStorageConfig>): Promise<void> {
        ObjectStorage.config = {
            ...ObjectStorage.config,
            ...cfg,
            OCI_OS_MAX_RETRIES: cfg.OCI_OS_MAX_RETRIES ?? ObjectStorage.config.OCI_OS_MAX_RETRIES ?? 3,
            OCI_OS_RETRY_BASE_MS: cfg.OCI_OS_RETRY_BASE_MS ?? ObjectStorage.config.OCI_OS_RETRY_BASE_MS ?? 200,
        };

        ObjectStorage.logger = initLogger("info");

        // required
        if (!ObjectStorage.config.OCI_REGION) {
            throw new Error("OCI_REGION is required.");
        }
        if (!ObjectStorage.config.OCI_OBJECT_STORAGE_NAMESPACE) {
            throw new Error("OCI_OBJECT_STORAGE_NAMESPACE is required.");
        }
        if (!ObjectStorage.config.OCI_OBJECT_STORAGE_BUCKET) {
            throw new Error("OCI_OBJECT_STORAGE_BUCKET is required.");
        }

        if (!ObjectStorage.client) {
            const provider = await ObjectStorage.buildAuthProvider(ObjectStorage.config);
            const client = new objectstorage.ObjectStorageClient({ authenticationDetailsProvider: provider });

            // regionId로 endpoint 자동 설정
            client.regionId = ObjectStorage.config.OCI_REGION;

            ObjectStorage.client = client;
        }

        ObjectStorage.initialized = true;
        ObjectStorage.logger.info("OCIObjectStorage initialized");
    }

    public static getInstance(): ObjectStorage {
        if (!ObjectStorage.initialized) {
            throw new Error("OCIObjectStorage not initialized. Call OCIObjectStorage.initApp() or OCIObjectStorage.init() first.");
        }
        if (!ObjectStorage.instance) ObjectStorage.instance = new ObjectStorage();
        return ObjectStorage.instance;
    }

    private constructor() {
        this.namespace = ObjectStorage.config.OCI_OBJECT_STORAGE_NAMESPACE;
        this.bucket = ObjectStorage.config.OCI_OBJECT_STORAGE_BUCKET;
    }

    private static async buildAuthProvider(cfg: ObjectStorageConfig): Promise<common.AuthenticationDetailsProvider> {
        if (cfg.OCI_AUTH_MODE === "instance_principal") {
            return await new common.InstancePrincipalsAuthenticationDetailsProviderBuilder().build();
        }
        const filePath = cfg.OCI_CONFIG_FILE_PATH ?? process.env.OCI_CONFIG_FILE_PATH ?? "~/.oci/config";
        const profile = cfg.OCI_CONFIG_PROFILE ?? process.env.OCI_CONFIG_PROFILE ?? "DEFAULT";
        return new common.ConfigFileAuthenticationDetailsProvider(filePath, profile);
    }

    private getClient(): objectstorage.ObjectStorageClient {
        if (!ObjectStorage.client) throw new Error("OCI Object Storage client not initialized.");
        return ObjectStorage.client;
    }

    private stringifyErr(err: any): string {
        if (!err) return "Unknown error";
        if (typeof err === "string") return err;
        if (err instanceof Error) return `${err.name}: ${err.message}`;
        try { return JSON.stringify(err); } catch { return String(err); }
    }

    private async withRetries<T>(fn: () => Promise<T>, label: string): Promise<T> {
        const maxRetries = ObjectStorage.config.OCI_OS_MAX_RETRIES ?? 3;
        const baseMs = ObjectStorage.config.OCI_OS_RETRY_BASE_MS ?? 200;

        let lastErr: any;
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return await fn();
            } catch (err: any) {
                lastErr = err;
                const isLast = attempt === maxRetries;

                ObjectStorage.logger.error(
                    `[OCIObjectStorage] ${label} failed (attempt ${attempt + 1}/${maxRetries + 1}): ${this.stringifyErr(err)}`
                );

                if (isLast) break;
                const backoff = baseMs * Math.pow(2, attempt);
                await new Promise((r) => setTimeout(r, backoff));
            }
        }
        throw lastErr;
    }

    /**
     * "리소스 주소" 형태 URL (버킷이 private이면 이 URL로 바로 다운로드는 안 됨)
     * 실제 접근 가능한 링크가 필요하면 PAR(Pre-Authenticated Request) 써야 함.
     */
    private buildObjectUrl(bucket: string, objectName: string, region = ObjectStorage.config.OCI_REGION): string {
        const encodedObject = objectName
            .split("/")
            .map((seg) => encodeURIComponent(seg))
            .join("/");
        return `https://objectstorage.${region}.oraclecloud.com/n/${this.namespace}/b/${bucket}/o/${encodedObject}`;
    }

    // ---------------------------
    // Public API: upload/delete/copy/get
    // ---------------------------

    public async uploadFile(
        fileLocalPath: string,
        objectName?: string,
        bucket: string = this.bucket
    ): Promise<string> {
        const client = this.getClient();
        const key = objectName || path.basename(fileLocalPath);
        const body = createReadStream(fileLocalPath);

        await this.withRetries(
            async () => {
                await client.putObject({
                    namespaceName: this.namespace,
                    bucketName: bucket,
                    objectName: key,
                    putObjectBody: body,
                });
            },
            `putObject(uploadFile) bucket=${bucket} key=${key}`
        );

        ObjectStorage.logger.info(`[OCIObjectStorage] uploadFile ok bucket=${bucket} key=${key}`);
        return this.buildObjectUrl(bucket, key);
    }

    public async uploadFileObject(
        fileBuffer: Buffer,
        objectName: string,
        bucket: string = this.bucket
    ): Promise<string> {
        const client = this.getClient();
        const body = Readable.from(fileBuffer);

        await this.withRetries(
            async () => {
                await client.putObject({
                    namespaceName: this.namespace,
                    bucketName: bucket,
                    objectName,
                    putObjectBody: body,
                    contentLength: fileBuffer.length,
                });
            },
            `putObject(uploadFileObject) bucket=${bucket} key=${objectName}`
        );

        ObjectStorage.logger.info(`[OCIObjectStorage] uploadFileObject ok bucket=${bucket} key=${objectName}`);
        return this.buildObjectUrl(bucket, objectName);
    }

    public async deleteFileObject(objectName: string, bucket: string = this.bucket): Promise<void> {
        const client = this.getClient();

        await this.withRetries(
            async () => {
                await client.deleteObject({
                    namespaceName: this.namespace,
                    bucketName: bucket,
                    objectName,
                });
            },
            `deleteObject bucket=${bucket} key=${objectName}`
        );

        ObjectStorage.logger.info(`[OCIObjectStorage] delete ok bucket=${bucket} key=${objectName}`);
    }

    private async readStreamToBuffer(value: any): Promise<Buffer> {
        // Node Readable (oci sdk node에서 보통 stream으로 옴)
        if (value && typeof value[Symbol.asyncIterator] === "function") {
            const chunks: Buffer[] = [];
            for await (const chunk of value as AsyncIterable<any>) {
                chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
            }
            return Buffer.concat(chunks);
        }

        // WHATWG ReadableStream fallback
        if (value && typeof (value as any).getReader === "function") {
            const reader = (value as any).getReader();
            const chunks: Uint8Array[] = [];
            while (true) {
                const { done, value: v } = await reader.read();
                if (done) break;
                if (v) chunks.push(v);
            }
            const total = chunks.reduce((s, c) => s + c.byteLength, 0);
            const merged = new Uint8Array(total);
            let offset = 0;
            for (const c of chunks) {
                merged.set(c, offset);
                offset += c.byteLength;
            }
            return Buffer.from(merged);
        }

        // last resort
        return Buffer.from(String(value ?? ""), "utf-8");
    }

    public async getObject(objectName: string, bucket: string = this.bucket): Promise<string> {
        const client = this.getClient();

        const res = await this.withRetries(
            async () => {
                return client.getObject({
                    namespaceName: this.namespace,
                    bucketName: bucket,
                    objectName,
                });
            },
            `getObject bucket=${bucket} key=${objectName}`
        );

        if (!res.value) {
            ObjectStorage.logger.warn(`[OCIObjectStorage] getObject empty body bucket=${bucket} key=${objectName}`);
            return "";
        }

        const buf = await this.readStreamToBuffer(res.value);
        const bodyString = buf.toString("utf-8");

        const trimmed = bodyString.trim();
        if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
            try {
                const jsonObj = JSON.parse(trimmed);
                if (jsonObj && typeof jsonObj === "object" && "html" in jsonObj) {
                    const html = (jsonObj as any).html;
                    return typeof html === "string" ? html : JSON.stringify(html);
                }
                return JSON.stringify(jsonObj);
            } catch {
                // ignore and return raw
            }
        }

        return bodyString;
    }
}

export default ObjectStorage;
