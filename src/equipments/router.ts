import { Router } from "express";
import { EquipmentPresetsController, EquipmentsController } from "@src/equipments/controller/controller";


export default function equipmentsRouter(): Router {
    const router = Router();

    const equipmentsController = new EquipmentsController();
    const equipmentPresetsController = new EquipmentPresetsController();

    // Public Routes
    router.get("/", equipmentsController.get);
    router.get("/presets", equipmentPresetsController.get);

    // Protected Routes

    return router;
}
