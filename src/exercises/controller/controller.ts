import { ExerciseService } from "@src/exercises/service/service";
import { Request, Response } from "express";
import { abort, send } from "@src/output";
import { ValidationError } from "@lib/errors";
import { validateInput } from "@lib/validate";
import { CreateExerciseRecordSchema, CreateSetStrategySchema } from "@src/exercises/dto/dto";

abstract class BaseController {
    protected service = new ExerciseService();
}

export class SetStrategyController extends BaseController {
    post = async (req: Request, res: Response): Promise<void> => {
        try {
            const dto = validateInput(CreateSetStrategySchema, req.body);
            await this.service.createSetStrategy(dto);
            send(res, 201, { message: "Set strategy created successfully" });
        } catch (e: unknown) {
            if (e instanceof ValidationError) {
                abort(res, 400, String(e));
            } else {
                abort(res, 500, String(e));
            }
        }
    };
}

export class ExerciseRecordController extends BaseController {
    post = async (req: Request, res: Response): Promise<void> => {
        try {
            const dto = validateInput(CreateExerciseRecordSchema, req.body);
            await this.service.createExerciseRecord(dto);
            send(res, 201, { message: "Exercise record created successfully" });
        } catch (e: unknown) {
            if (e instanceof ValidationError) {
                abort(res, 400, String(e));
            } else {
                abort(res, 500, String(e));
            }
        }
    };
}
