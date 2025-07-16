import { ChatsService } from "@src/chats/service/service";
import { Request, Response } from "express";
import { plainToInstance } from "class-transformer";
import { ChatResponseDTO, CreateChatDTO } from "@src/chats/dto/dto";
import { abort, send } from "@src/output";

export class ChatsController {
    private service: ChatsService;

    constructor() {
        this.service = new ChatsService();
    }

    post = async (req: Request, res: Response) => {
        try {
            const instance = plainToInstance(CreateChatDTO, req.body);
            await this.service.createChat(instance);
            send(res, 201, { message: "Chat created successfully." });
        } catch (e: any) {
            abort(res, 500, String(e));
        }
    };

    get = async (req: Request, res: Response) => {
        try {
            const msgId = req.params.id;
            if (msgId === null) {
                abort(res, 400, "Missing required parameter 'msgId'");
            }
            const chat = await this.service.getChatById(msgId);
            if (chat === null) {
                abort(res, 404, "Chat not found.");
            }
            send(res, 200, chat!, ChatResponseDTO);
        } catch (e: any) {
            abort(res, 500, String(e));
        }
    };

    delete = async (req: Request, res: Response) => {
        try {
            const msgId = req.params.id;
            if (msgId === null) {
                abort(res, 400, "Missing required parameter 'msgId'");
            }
            await this.service.deleteChat(msgId);
            send(res, 200, { message: "Chat deleted successfully." });
        } catch (e: any) {
            abort(res, 500, String(e));
        }
    };
}
