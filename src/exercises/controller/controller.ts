import { ExerciseService } from "@src/exercises/service/service";
import { Request, Response } from "express";
import { abort, send } from "@src/output";
import { ValidationError } from "@lib/errors";
import { validateInput } from "@lib/validate";
import { CreateExercisePlanSchema, CreateExerciseSetSchema, CreateSetRecordSchema } from "@src/exercises/dto/dto";

abstract class BaseController {
    protected service = new ExerciseService();
}

export class ExercisePlanController extends BaseController {
    post = async (req: Request, res: Response): Promise<void> => {
        try {
            const dto = validateInput(CreateExercisePlanSchema, req.body);
            const planId = await this.service.createExercisePlan(dto);
            send(res, 201, { message: "Exercise plan created successfully", planId });
        } catch (e: unknown) {
            if (e instanceof ValidationError) {
                abort(res, 400, String(e));
            } else {
                abort(res, 500, String(e));
            }
        }
    };
}

export class ExerciseSetController extends BaseController {
    post = async (req: Request, res: Response): Promise<void> => {
        try {
            const dto = validateInput(CreateExerciseSetSchema, req.body);
            const setId = await this.service.createExerciseSet(dto);
            send(res, 201, { message: "Exercise set created successfully", setId });
        } catch (e: unknown) {
            if (e instanceof ValidationError) {
                abort(res, 400, String(e));
            } else {
                abort(res, 500, String(e));
            }
        }
    };
}

export class SetRecordController extends BaseController {
    post = async (req: Request, res: Response): Promise<void> => {
        try {
            const dto = validateInput(CreateSetRecordSchema, req.body);
            const recordId = await this.service.createSetRecord(dto);
            send(res, 201, { message: "Set record created successfully", recordId });
        } catch (e: unknown) {
            if (e instanceof ValidationError) {
                abort(res, 400, String(e));
            } else {
                abort(res, 500, String(e));
            }
        }
    };
}
