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
    static OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";

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
            OPENAI_API_KEY: this.OPENAI_API_KEY,
        });

        console.log("App configuration initialized.");
    }
}
