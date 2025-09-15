import { Router } from "express";
import { ExerciseController, EquipmentController, LoginController } from "@src/admin/controller/controller";
import { adminMiddleware } from "@src/middlewares";


export default function adminRoutes() {
    const router = Router();

    const exerciseController = new ExerciseController();
    const equipmentController = new EquipmentController();
    const loginController = new LoginController();

    // Admin Routes
    router.post("/exercises", adminMiddleware, exerciseController.post);
    router.post("/equipments", adminMiddleware, equipmentController.post);
    router.get("/exercises", adminMiddleware, exerciseController.get);
    router.get("/equipments", adminMiddleware, equipmentController.get);
    router.get("/login", loginController.get);

    return router;
}
