import { Router } from "express";
import {
    OAuthSignUpController,
    GeneralSignUpController,
    GeneralLoginController,
    GeneralLogoutController
} from "@src/auth/controller/controller";

export default function authRouter(): Router {
    const router = Router();

    const oAuthSignUpController = new OAuthSignUpController();
    const generalSignUpController = new GeneralSignUpController();
    const generalLoginController = new GeneralLoginController();
    const generalLogoutController = new GeneralLogoutController();

    // Public Routes
    router.post("/signup", generalSignUpController.post);
    router.post("/signup/oauth", oAuthSignUpController.post);
    router.post("/login", generalLoginController.post);
    router.post("/logout", generalLogoutController.post);

    // Protected Routes

    return router;
}
