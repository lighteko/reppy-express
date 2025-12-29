import { Router } from "express";
import { FeedbackController} from "@src/feedbacks/controller/controller";
import { authenticate } from "@src/middlewares";


export default function feedbackRoutes() {
    const router = Router();

    const feedbackController = new FeedbackController();
    // Public Routes

    // Protected Routes
    router.use(authenticate);
    router.post("/", feedbackController.post);

    return router;
}
