import { RoutineService } from "@src/routines/service/service";
import { Request, Response } from "express";
import { abort, send } from "@src/output";
import { ValidationError } from "@lib/errors";
import { validateInput } from "@lib/validate";
import {
    CreateRoutineSchema,
    UpdateProgramSchema,
    CreateBatchRoutinesSchema
} from "@src/routines/dto/dto";

abstract class BaseController {
    protected service = new RoutineService();
}

export class RoutineController extends BaseController {
    post = async (req: Request, res: Response) => {
        try {
            const dto = validateInput(CreateRoutineSchema, req.body);
            const routineId = await this.service.createRoutine(dto);
            send(res, 201, { message: "Routine created successfully", routineId });
        } catch (e: unknown) {
            if (e instanceof ValidationError) {
                abort(res, 400, String(e));
            } else {
                abort(res, 500, String(e));
            }
        }
    };
}

export class BatchRoutineController extends BaseController {
    post = async (req: Request, res: Response) => {
        try {
            const dto = validateInput(CreateBatchRoutinesSchema, req.body);
            await this.service.createBatchRoutines(dto);
            send(res, 201, { message: "Routines created successfully" });
        } catch (e: unknown) {
            if (e instanceof ValidationError) {
                abort(res, 400, String(e));
            } else {
                abort(res, 500, String(e));
            }
        }
    };
}

export class ProgramController extends BaseController {
    patch = async (req: Request, res: Response) => {
        try {
            const dto = validateInput(UpdateProgramSchema, req.body);
            await this.service.updateProgram(dto);
            send(res, 200, { message: "Program updated successfully" });
        } catch (e: unknown) {
            if (e instanceof ValidationError) {
                abort(res, 400, String(e));
            } else {
                abort(res, 500, String(e));
            }
        }
    };
}
