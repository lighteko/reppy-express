import { ExerciseService } from "@src/exercises/service/service";
import {Request, Response} from "express";
import { abort, send } from "@src/output";
import { ValidationError } from "@lib/errors";
import { validateDTO } from "@lib/validate/validate-dto";
import { CreateExerciseRecordDTO, CreateSetStrategyDTO } from "@src/exercises/dto/dto";

abstract class BaseController {
    protected service = new ExerciseService();
}

export class SetStrategyController extends BaseController {
    post = async (req: Request, res: Response): Promise<void> => {
        try {
            const dto = await validateDTO(CreateSetStrategyDTO, req.body);
            await this.service.createSetStrategy(dto);
            send(res, 201, { message: "Set strategy created successfully" });
        } catch (e: unknown) {
            if (e instanceof ValidationError) {
                abort(res, 400, String(e));
            } else {
                abort(res, 500, String(e));
            }
        }
    }
}

export class ExerciseRecordController extends BaseController {
    post = async (req: Request, res: Response): Promise<void> => {
        try {
            const dto = await validateDTO(CreateExerciseRecordDTO, req.body);
            await this.service.createExerciseRecord(dto);
            send(res, 201, { message: "Exercise record created successfully" });
        } catch (e: unknown) {
            if (e instanceof ValidationError) {
                abort(res, 400, String(e));
            } else {
                abort(res, 500, String(e));
            }
        }
    }
}
