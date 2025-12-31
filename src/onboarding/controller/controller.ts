import { OnboardingService } from "@src/onboarding/service/service";
import { Request, Response } from "express";
import { abort, send } from "@src/output";
import {
    OnboardUserSchema,
} from "@src/onboarding/dto/dto";
import { validateInput } from "@lib/validate";
import { ValidationError } from "@lib/errors";

abstract class BaseController {
    protected service = new OnboardingService();
}

export class OnboardingController extends BaseController {
    post = async (req: Request, res: Response) => {
        try {
            const dto = validateInput(OnboardUserSchema, req.body);
            await this.service.onboardUser(dto);
            send(res, 200, { message: "User onboarded successfully." });
        } catch (e: unknown) {
            if (e instanceof ValidationError) {
                abort(res, 400, String(e));
            } else {
                abort(res, 500, String(e));
            }
        }
    }
}
