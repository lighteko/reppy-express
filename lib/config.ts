import dotenv from "dotenv";
import { Express } from "express";

dotenv.config();

export class BaseConfig {
    static LOGGING_PATH = "../logs";

    constructor(app: Express) {
        BaseConfig.initApp(app);
    }

    static initApp(app: Express): void {
        app.set("config", {

        });

        console.log("App configuration initialized.");
    }
}
