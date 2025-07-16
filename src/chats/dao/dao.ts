import DB, { Row } from "@lib/infra/postgres";
import SQL from "sql-template-strings";
import { v4 as uuid4 } from "uuid";
import { CreateChatDTO } from "@src/chats/dto/dto";

export class ChatsDAO {
    private db: DB;

    constructor() {
        this.db = DB.getInstance();
    }

    async createChat(inputData: CreateChatDTO): Promise<void> {
        const msgId = uuid4();
        const query = SQL`
            INSERT INTO REPY_CHAT_MESSAGE_L
                (MSG_ID, USER_ID, SENDER_TYPE, MESSAGE)
            VALUES (${msgId},
                    ${inputData.userId},
                    ${inputData.senderType},
                    ${inputData.message});
        `;

        const cursor = this.db.cursor();
        await cursor.execute(query);
    }

    async getChatById(msgId: string): Promise<Row> {
        const query = SQL`
            SELECT
                MSG_ID as msgId,
                USER_ID as userId,
                SENDER_TYPE as senderType,
                MESSAGE as message,
                CREATED_AT as createdAt
            FROM REPY_CHAT_MESSAGE_L
            WHERE MSG_ID = ${msgId};
        `;

        const cursor = this.db.cursor();
        return await cursor.fetchOne(query);
    }

    async deleteChat(msgId: string): Promise<void> {
        const query = SQL`
            DELETE
            FROM REPY_CHAT_MESSAGE_L
            WHERE MSG_ID = ${msgId};
        `;

        const cursor = this.db.cursor();
        await cursor.execute(query);
    }
}
