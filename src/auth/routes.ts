import { Router } from "express";
import { OAuthBasedAuthController, GeneralAuthController } from "@src/auth/controller/controller";

export default function authRoutes() {
    const router = Router();

    const oAuthBasedAuthController = new OAuthBasedAuthController();
    const generalAuthController = new GeneralAuthController();

    // Public Routes
    router.post("/general/signup", generalAuthController.post);
    router.post("/oauth/signup", oAuthBasedAuthController.post);

    // Protected Routes

    return router;
}

