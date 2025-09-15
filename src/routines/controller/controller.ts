import { RoutineService } from "@src/routines/service/service";
import { Request, Response } from "express";
import { abort, send } from "@src/output";
import { ValidationError } from "@lib/errors";
import { validateInput } from "@lib/validate";
import { RefreshRoutinesDTO, UpdatePlanDTO, UpdateScheduleDTO } from "@src/routines/dto/dto";

abstract class BaseController {
    protected service = new RoutineService();
}

export class RoutineController extends BaseController {
    post = async (req: Request, res: Response) => {
        try {
            const dto = await validateInput(RefreshRoutinesDTO, req.body);
            await this.service.refreshRoutines(dto);
            send(res, 201, { message: "Routine reset successfully" });
        } catch (e: unknown) {
            if (e instanceof ValidationError) {
                abort(res, 400, String(e));
            } else {
                abort(res, 500, String(e));
            }
        }
    }
}

export class PlanController extends BaseController {
    patch = async (req: Request, res: Response) => {
        try {
            const dto = await validateInput(UpdatePlanDTO, req.body);
            await this.service.updatePlan(dto);
            send(res, 201, { message: "Plan updated successfully" });
        } catch (e: unknown) {
            if (e instanceof ValidationError) {
                abort(res, 400, String(e));
            } else {
                abort(res, 500, String(e));
            }
        }
    }
}

export class ScheduleController extends BaseController {
    post = async (req: Request, res: Response) => {
        try {
            const dto = await validateInput(UpdateScheduleDTO, req.body);
            await this.service.updateSchedule(dto);
            send(res, 201, { message: "Schedule reset successfully" });
        } catch (e: unknown) {
            if (e instanceof ValidationError) {
                abort(res, 400, String(e));
            } else {
                abort(res, 500, String(e));
            }
        }
    }
}
