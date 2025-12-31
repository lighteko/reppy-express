import { Router } from "express";
import {
    UserEquipmentsController,
    UserExercisesController,
    UserOnboardingController
} from "@src/users/controller/controller";


export default function userRoutes() {
    const router = Router();

    const userEquipmentsController = new UserEquipmentsController();
    const userExercisesController = new UserExercisesController();
    const userOnboardingController = new UserOnboardingController();
    // Public Routes

    // Protected Router
    router.get("/status", userOnboardingController.get);
    router.patch("/equipments", userEquipmentsController.patch);
    router.get("/equipments", userEquipmentsController.get);
    router.get("/exercises", userExercisesController.get);

    return router;
}
