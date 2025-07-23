import { Router } from "express";
import { ExerciseController } from "@src/admin/controller/controller";


export default function exerciseRoutes() {
    const router = Router();

    const exerciseController = new ExerciseController();

    // Public Routes

    // Protected Routes
    router.post("/strategies", exerciseController.post);
    router.post("/records", exerciseController.post);

    return router;
}
