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
    static JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "";
    static JWT_ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || "";
    static JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || "";
    static EMAIL_TOKEN_SECRET = process.env.EMAIL_TOKEN_SECRET || "";

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
            JWT_REFRESH_SECRET: this.JWT_REFRESH_SECRET,
            JWT_ACCESS_EXPIRY: this.JWT_ACCESS_EXPIRY,
            JWT_REFRESH_EXPIRY: this.JWT_REFRESH_EXPIRY,
            EMAIL_TOKEN_SECRET: this.EMAIL_TOKEN_SECRET,
        });

        console.log("App configuration initialized.");
    }
}
