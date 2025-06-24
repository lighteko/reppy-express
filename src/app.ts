import express, { Request, Response, NextFunction } from "express";
import { BaseConfig } from "@lib/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import initLogger from "@src/logger";


function createApp() {
    const app = express();

    new BaseConfig(app);
    app.set("trust proxy", true);
    app.use(express.json());
    app.use(cookieParser());
    app.use(
        cors({
            origin: process.env.CORS_ORIGIN || true,
            credentials: true,
        })
    );
    const logger = initLogger("debug");

    app.use((req: Request, _res: Response, next: NextFunction) => {
        logger.debug(`Request Path: ${req.path}`);
        logger.debug(`Request Method: ${req.method}`);
        logger.debug(`Request Headers: ${JSON.stringify(req.headers, null, 2)}`);
        logger.debug(`Request Data: ${JSON.stringify(req.body, null, 2)}`);
        next();
    });

    app.use((_req: Request, res: Response, next: NextFunction) => {
        const originalSend = res.send;
        res.send = (body: any) => {
            logger.debug(`Response Status Code: ${res.statusCode}`);
            logger.debug(
                `Response Headers: ${JSON.stringify(res.getHeaders(), null, 2)}`
            );
            try {
                const parsedBody = JSON.parse(body);
                logger.debug(`Response Data: ${JSON.stringify(parsedBody, null, 2)}`);
            } catch {
                logger.debug(`Response Data: ${body}`);
            }
            return originalSend.call(res, body);
        };
        next();
    });

    app.get("/health", (_req: Request, res: Response) => {
        res.status(200).send({
            health: "healthy",
        });
    });

    // Public routes

    // Protected routes


    return app;
}

export default createApp;
