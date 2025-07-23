import { FeedbackDAO } from "@src/feedbacks/dao/dao";
import { CreateFeedbackDTO } from "@src/feedbacks/dto/dto";

export class FeedbackService {
    dao: FeedbackDAO;

    constructor() {
        this.dao = new FeedbackDAO();
    }

    async createFeedback(inputData: CreateFeedbackDTO): Promise<void> {
        await this.dao.createFeedback(inputData);
    }
}
