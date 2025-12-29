import { Router } from "express";
import { ExercisePlanController, ExerciseSetController, SetRecordController } from "@src/exercises/controller/controller";
import { authenticate } from "@src/middlewares";


export default function exerciseRoutes() {
    const router = Router();

    const exercisePlanController = new ExercisePlanController();
    const exerciseSetController = new ExerciseSetController();
    const setRecordController = new SetRecordController();

    // Public Routes

    // Protected Routes
    router.use(authenticate);
    router.post("/plans", exercisePlanController.post);
    router.post("/sets", exerciseSetController.post);
    router.post("/records", setRecordController.post);

    return router;
}
