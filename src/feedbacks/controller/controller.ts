import { Request, Response } from "express";
import { FeedbackService } from "@src/feedbacks/service/service";
import { abort, send } from "@src/output";
import { ValidationError } from "@lib/errors";
import { validateInput } from "@lib/validate";
import { CreateFeedbackSchema } from "@src/feedbacks/dto/dto";

abstract class BaseController {
    protected service = new FeedbackService();
}

export class FeedbackController extends BaseController {
    post = async (req: Request, res: Response) => {
        try {
            const dto = validateInput(CreateFeedbackSchema, req.body);
            await this.service.createFeedback(dto);
            send(res, 201, { message: "Feedback created successfully" });
        } catch (e: unknown) {
            if (e instanceof ValidationError) {
                abort(res, 400, String(e));
            } else {
                abort(res, 500, String(e));
            }
        }
    };
}
