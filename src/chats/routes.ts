import { Router } from "express";
import { ChatsController, ChatsWithCursorController } from "@src/chats/controller/controller";


export default function chatRoutes() {
    const router = Router();

    const chatsController = new ChatsController();
    const chatsWithCursorController = new ChatsWithCursorController();

    // Public Routes

    // Protected Routes
    router.get("/:id", chatsController.get);
    router.post("/", chatsController.post);
    router.delete("/:id", chatsController.delete);
    router.get("/cursor/:id", chatsWithCursorController.get);
    return router;
}
