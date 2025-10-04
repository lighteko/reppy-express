import { Router } from "express";
import { ProgramController, RoutineController, ScheduleController } from "@src/routines/controller/controller";


export default function routinesRoutes() {
    const router = Router();

    const routineController = new RoutineController();
    const programController = new ProgramController();
    const scheduleController = new ScheduleController();

    // Public Routes

    // Protected Routes
    router.post("/", routineController.post);
    router.patch("/", routineController.patch);
    router.patch("/programs", programController.patch);
    router.post("/schedules", scheduleController.post);

    return router;
}
