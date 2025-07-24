import { ChatsDAO } from "@src/chats/dao/dao";
import { CreateChatDTO, GetChatsWithCursorDTO } from "@src/chats/dto/dto";
import { Row } from "@lib/infra/postgres";

export class ChatsService {
    private dao: ChatsDAO;

    constructor() {
        this.dao = new ChatsDAO();
    }

    async createChat(inputData: CreateChatDTO): Promise<void> {
        await this.dao.createChat(inputData);
    }

    async getChatById(msgId: string): Promise<Row> {
        return await this.dao.getChatById(msgId);
    }

    async getChatsWithCursor(inputData: GetChatsWithCursorDTO): Promise<Row[]> {
        return await this.dao.getChatsWithCursor(inputData);
    }

    async get50Chats(userId: string): Promise<Row[]> {
        return await this.dao.get50Chats(userId);
    }

    async deleteChat(msgId: string): Promise<void> {
        await this.dao.deleteChat(msgId);
    }
}
