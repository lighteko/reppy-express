import dotenv from "dotenv";
import { Express } from "express";

dotenv.config();

export class BaseConfig {
    static LOGGING_PATH = "../logs";
    static SUPABASE_URL = process.env.SUPABASE_URL || "";
    static SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
    static OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";

    constructor(app: Express) {
        BaseConfig.initApp(app);
    }

    static initApp(app: Express): void {
        app.set("config", {
            SUPABASE_URL: this.SUPABASE_URL,
            SUPABASE_SERVICE_ROLE_KEY: this.SUPABASE_SERVICE_ROLE_KEY,
            OPENAI_API_KEY: this.OPENAI_API_KEY,
        });

        console.log("App configuration initialized.");
    }
}
