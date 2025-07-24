import { ChatsService } from "@src/chats/service/service";
import { Request, Response } from "express";
import { ChatResponseDTO, CreateChatDTO, GetChatsWithCursorDTO, MultipleChatResponseDTO } from "@src/chats/dto/dto";
import { abort, send } from "@src/output";
import { ValidationError } from "@lib/errors";
import { validateDTO } from "@lib/validate/validate-dto";

abstract class BaseController {
    protected service = new ChatsService();
}

export class ChatsController extends BaseController {
    post = async (req: Request, res: Response) => {
        try {
            const dto = await validateDTO(CreateChatDTO, req.body);
            await this.service.createChat(dto);
            send(res, 201, { message: "Chat created successfully." });
        } catch (e: unknown) {
            if (e instanceof ValidationError) {
                abort(res, 400, String(e));
            } else {
                abort(res, 500, String(e));
            }
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
            await validateDTO(ChatResponseDTO, chat);
            send(res, 200, { chat });
        } catch (e: unknown) {
            if (e instanceof ValidationError) {
                abort(res, 400, String(e));
            } else {
                abort(res, 500, String(e));
            }
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
            if (e instanceof ValidationError) {
                abort(res, 400, String(e));
            } else {
                abort(res, 500, String(e));
            }
        }
    };
}

export class ChatsWithCursorController extends BaseController {
    get = async (req: Request, res: Response) => {
        try {
            const inputData = {
                userId: req.params.id,
                createdAt: req.query.createdAt,
            };
            if (inputData.createdAt !== null) {
                const dto = await validateDTO(GetChatsWithCursorDTO, inputData);
                const chats = await this.service.getChatsWithCursor(dto);
                await validateDTO(MultipleChatResponseDTO, chats);
                send(res, 200, { chats });
            } else {
                if (!inputData.userId) abort(res, 400, "Missing required parameter 'userId'");
                const chats = await this.service.get50Chats(inputData.userId);
                await validateDTO(MultipleChatResponseDTO, chats);
                send(res, 200, { chats });
            }
        } catch (e: unknown) {
            if (e instanceof ValidationError) {
                abort(res, 400, String(e));
            } else {
                abort(res, 500, String(e));
            }
        }
    };
}
