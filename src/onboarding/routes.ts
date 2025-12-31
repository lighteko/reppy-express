import { Router } from "express";
import {
    OnboardingController,
} from "@src/onboarding/controller/controller";

export default function onboardingRoutes() {
    const router = Router();

    const onboardingController = new OnboardingController();


    // Public Routes

    // Protected Routes
    router.post("/", onboardingController.post);

    return router;
}
