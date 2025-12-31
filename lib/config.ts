import dotenv from "dotenv";
import { Express } from "express";
import * as process from "node:process";

dotenv.config();

export class BaseConfig {
    static LOGGING_PATH = "../logs";
    static PG_HOST = process.env.PG_HOST || "";
    static PG_PORT = process.env.PG_PORT || "";
    static PG_USER = process.env.PG_USER || "";
    static PG_PASSWORD = process.env.PG_PASSWORD || "";
    static PG_DB = process.env.PG_DB || "";
    static PG_POOL_SIZE = process.env.PG_POOL_SIZE || "";
    static PG_SCHEMA = process.env.PG_SCHEMA || "";
    static ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";
    static JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "";
    static JWT_ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || "";
    static EMAIL_TOKEN_SECRET = process.env.EMAIL_TOKEN_SECRET || "";
    static OCI_AUTH_MODE = process.env.OCI_AUTH_MODE || "";
    static OCI_REGION = process.env.OCI_REGION || "";
    static OCI_QUEUE_MESSAGES_ENDPOINT = process.env.OCI_QUEUE_MESSAGES_ENDPOINT || "";
    static OCI_QUEUE_HIGH_ID = process.env.OCI_QUEUE_HIGH_ID || "";
    static OCI_QUEUE_BATCH_ID = process.env.OCI_QUEUE_BATCH_ID || "";
    static OCI_QUEUE_MAX_RETRIES = process.env.OCI_QUEUE_MAX_RETRIES || "";
    static OCI_QUEUE_RETRY_BASE_MS = process.env.OCI_QUEUE_RETRY_BASE_MS || "";
    static OCI_OBJECT_STORAGE_NAMESPACE = process.env.OCI_OBJECT_STORAGE_NAMESPACE || "";
    static OCI_OBJECT_STORAGE_BUCKET = process.env.OCI_OBJECT_STORAGE_BUCKET || "";
    static OCI_OS_MAX_RETRIES = process.env.OCI_OS_MAX_RETRIES || "";
    static OCI_OS_RETRY_BASE_MS = process.env.OCI_OS_RETRY_BASE_MS || "";

    constructor(app: Express) {
        BaseConfig.initApp(app);
    }

    static initApp(app: Express): void {
        app.set("config", {
            PG_HOST: this.PG_HOST,
            PG_PORT: this.PG_PORT,
            PG_USER: this.PG_USER,
            PG_PASSWORD: this.PG_PASSWORD,
            PG_DB: this.PG_DB,
            PG_POOL_SIZE: this.PG_POOL_SIZE,
            PG_SCHEMA: this.PG_SCHEMA,
            ADMIN_PASSWORD: this.ADMIN_PASSWORD,
            JWT_ACCESS_SECRET: this.JWT_ACCESS_SECRET,
            JWT_ACCESS_EXPIRY: this.JWT_ACCESS_EXPIRY,
            EMAIL_TOKEN_SECRET: this.EMAIL_TOKEN_SECRET,
            OCI_AUTH_MODE: this.OCI_AUTH_MODE,
            OCI_REGION: this.OCI_REGION,
            OCI_QUEUE_MESSAGES_ENDPOINT: this.OCI_QUEUE_MESSAGES_ENDPOINT,
            OCI_QUEUE_HIGH_ID: this.OCI_QUEUE_HIGH_ID,
            OCI_QUEUE_BATCH_ID: this.OCI_QUEUE_BATCH_ID,
            OCI_QUEUE_MAX_RETRIES: this.OCI_QUEUE_MAX_RETRIES,
            OCI_QUEUE_RETRY_BASE_MS: this.OCI_QUEUE_RETRY_BASE_MS,
            OCI_OBJECT_STORAGE_NAMESPACE: this.OCI_OBJECT_STORAGE_NAMESPACE,
            OCI_OBJECT_STORAGE_BUCKET: this.OCI_OBJECT_STORAGE_BUCKET,
            OCI_OS_MAX_RETRIES: this.OCI_OS_MAX_RETRIES,
            OCI_OS_RETRY_BASE_MS: this.OCI_OS_RETRY_BASE_MS,
        });

        console.log("App configuration initialized.");
    }
}
