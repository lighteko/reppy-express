import { Router } from "express";
import { FeedbackController} from "@src/feedbacks/controller/controller";


export default function feedbackRoutes() {
    const router = Router();

    const feedbackController = new FeedbackController();
    // Public Routes

    // Protected Routes
    router.post("/", feedbackController.post);

    return router;
}
