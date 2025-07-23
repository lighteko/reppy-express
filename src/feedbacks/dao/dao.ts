import DB from "@lib/infra/postgres";
import { CreateFeedbackDTO } from "@src/feedbacks/dto/dto";
import SQL from "sql-template-strings";
import { v4 as uuid4 } from "uuid";

export class FeedbackDAO {
    db: DB;

    constructor() {
        this.db = DB.getInstance();
    }

    async createFeedback(inputData: CreateFeedbackDTO): Promise<void> {
        const feedbackId = uuid4();
        const query = SQL`
            INSERT INTO repy_feedback_l
                (feedback_id, user_id, map_id, sentiment, feedback_text)
            VALUES (${feedbackId},
                    ${inputData.userId},
                    ${inputData.mapId},
                    ${inputData.sentiment},
                    ${inputData.feedbackText});
        `;

        const cursor = this.db.cursor();
        await cursor.execute(query);
    }
}
