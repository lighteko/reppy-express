import { Router } from "express";
import { ExerciseController, EquipmentController } from "@src/admin/controller/controller";


export default function adminRoutes() {
    const router = Router();

    const exerciseController = new ExerciseController();
    const equipmentController = new EquipmentController();

    // Admin Routes
    router.post("/exercises", exerciseController.post);
    router.post("/exercises/equipments", equipmentController.post);

    return router;
}
