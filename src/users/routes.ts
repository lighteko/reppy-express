import { Router } from "express";
import { UserEquipmentsController, UserExercisesController } from "@src/users/controller/controller";


export default function userRoutes() {
    const router = Router();

    const userEquipmentsController = new UserEquipmentsController();
    const userExercisesController = new UserExercisesController();

    // Public Routes

    // Protected Routes
    router.patch("/equipments", userEquipmentsController.patch);
    router.get("/equipments", userEquipmentsController.get);
    router.get("/exercises", userExercisesController.get);

    return router;
}
