import { Router } from "express";
import {
    BatchRoutineController,
    ProgramController,
    RoutineController,
} from "@src/routines/controller/controller";


export default function routinesRoutes() {
    const router = Router();

    const routineController = new RoutineController();
    const programController = new ProgramController();
    const batchRoutineController = new BatchRoutineController();

    // Public Routes

    // Protected Routes
    router.post("/", routineController.post);
    router.post("/batch", batchRoutineController.post);
    router.patch("/programs", programController.patch);

    return router;
}
