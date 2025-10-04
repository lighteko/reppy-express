import DB, { Row } from "@lib/infra/postgres";
import SQL from "sql-template-strings";
import { v4 as uuid4 } from "uuid";
import { CreateChatDTO, GetChatsWithCursorDTO } from "@src/chats/dto/dto";

export class ChatsDAO {
    private db: DB;

    constructor() {
        this.db = DB.getInstance();
    }

    async createChat(inputData: CreateChatDTO): Promise<void> {
        const messageId = uuid4();
        const query = SQL`
            INSERT INTO repy_chat_message_l
                (message_id, user_id, sender_type, content)
            VALUES (${messageId},
                    ${inputData.userId},
                    ${inputData.senderType},
                    ${inputData.content});
        `;

        const cursor = this.db.cursor();
        await cursor.execute(query);
    }

    async getChatById(messageId: string): Promise<Row> {
        const query = SQL`
            SELECT
                message_id as "messageId",
                user_id as "userId",
                sender_type as "senderType",
                content as "content",
                created_at as "createdAt"
            FROM repy_chat_message_l
            WHERE message_id = ${messageId};
        `;

        const cursor = this.db.cursor();
        return await cursor.fetchOne(query);
    }

    async getChatsWithCursor(inputData: GetChatsWithCursorDTO): Promise<Row[]> {
        const query = SQL`
            SELECT
                message_id as "messageId",
                user_id as "userId",
                sender_type as "senderType",
                content as "content",
                created_at as "createdAt"
            FROM repy_chat_message_l
            WHERE user_id = ${inputData.userId}
            AND created_at < ${inputData.createdAt}
            ORDER BY created_at DESC
            LIMIT 50;
        `;

        const cursor = this.db.cursor();
        return await cursor.fetchAll(query);
    }

    async get50Chats(userId: string): Promise<Row[]> {
        const query = SQL`
            SELECT
                message_id as "messageId",
                user_id as "userId",
                sender_type as "senderType",
                content as "content",
                created_at as "createdAt"
            FROM repy_chat_message_l
            WHERE user_id = ${userId}
            ORDER BY created_at DESC
            LIMIT 50;
        `;

        const cursor = this.db.cursor();
        return await cursor.fetchAll(query);
    }

    async deleteChat(messageId: string): Promise<void> {
        const query = SQL`
            DELETE
            FROM repy_chat_message_l
            WHERE message_id = ${messageId};
        `;

        const cursor = this.db.cursor();
        await cursor.execute(query);
    }
}
