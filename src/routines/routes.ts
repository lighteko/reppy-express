import { Router } from "express";
import { PlanController, RoutineController, ScheduleController } from "@src/routines/controller/controller";


export default function routinesRoutes() {
    const router = Router();

    const routineController = new RoutineController();
    const planController = new PlanController();
    const scheduleController = new ScheduleController();

    // Public Routes

    // Protected Routes
    router.post("/", routineController.post);
    router.patch("/plans", planController.patch);
    router.post("/schedules", scheduleController.post);

    return router;
}
