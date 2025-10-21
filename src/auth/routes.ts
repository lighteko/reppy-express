import { Router } from "express";
import {
    OAuthSignUpController,
    GeneralSignUpController,
    GeneralLoginController
} from "@src/auth/controller/controller";

export default function authRoutes() {
    const router = Router();

    const oAuthSignUpController = new OAuthSignUpController();
    const generalSignUpController = new GeneralSignUpController();
    const generalLoginController = new GeneralLoginController();

    // Public Routes
    router.post("/signup", generalSignUpController.post);
    router.post("/signup/oauth", oAuthSignUpController.post);
    router.post("/login", generalLoginController.post)

    // Protected Routes

    return router;
}
