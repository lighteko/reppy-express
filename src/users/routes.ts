import { Router } from "express";
import { UserEquipmentsController, UserExercisesController } from "@src/users/controller/controller";
import { authenticate } from "@src/middlewares";


export default function userRoutes() {
    const router = Router();

    const userEquipmentsController = new UserEquipmentsController();
    const userExercisesController = new UserExercisesController();

    // Public Routes

    // Protected Routes
    router.use(authenticate);
    router.patch("/equipments", userEquipmentsController.patch);
    router.get("/equipments", userEquipmentsController.get);
    router.get("/exercises", userExercisesController.get);

    return router;
}
