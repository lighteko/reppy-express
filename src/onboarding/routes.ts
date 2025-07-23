import { Router } from "express";
import {
    BioController,
    PreferencesController,
    PlanController,
    UserEquipmentsController
} from "@src/onboarding/controller/controller";

export default function onboardingRoutes() {
    const router = Router();

    const bioController = new BioController();
    const preferencesController = new PreferencesController();
    const planController = new PlanController();
    const userEquipmentsController = new UserEquipmentsController();

    // Public Routes

    // Protected Routes
    router.post("/bio", bioController.post);
    router.post("/preferences", preferencesController.post);
    router.post("/plans", planController.post);
    router.post("/equipments", userEquipmentsController.post);

    return router;
}
