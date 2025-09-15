import express, { Request, Response, NextFunction } from "express";
import { BaseConfig } from "@lib/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import initLogger from "@src/logger";
import DB from "@lib/infra/postgres";
import authRoutes from "@src/auth/routes";
import onboardingRoutes from "@src/onboarding/routes";
import routinesRoutes from "@src/routines/routes";
import feedbackRoutes from "@src/feedbacks/routes";
import adminRoutes from "@src/admin/routes";
import exerciseRoutes from "@src/exercises/routes";
import chatRoutes from "@src/chats/routes";

function createApp() {
    const app = express();

    new BaseConfig(app);
    DB.initApp(app);

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

    app.get("/", (_req: Request, res: Response) => {
        res.redirect("/health");
    });

    app.get("/health", (_req: Request, res: Response) => {
        res.status(200).send({
            health: "healthy",
        });
    });

    // Public routes
    app.use("/auth", authRoutes());

    // Protected routes
    app.use("/onboarding", onboardingRoutes());
    app.use("/routines", routinesRoutes());
    app.use("/feedbacks", feedbackRoutes());
    app.use("/exercises", exerciseRoutes());
    app.use("/chats", chatRoutes());

    // Admin routes
    app.use("/admin", adminRoutes());

    return app;
}

export default createApp;
