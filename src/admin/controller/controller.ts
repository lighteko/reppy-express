import { AdminService } from "@src/admin/service/service";
import { Request, Response } from "express";
import { abort, send } from "@src/output";
import { ValidationError } from "class-validator";
import { validateInput, validateOutput } from "@lib/validate";
import {
    CreateEquipmentSchema,
    CreateExerciseSchema,
    EquipmentsResponseSchema, ExercisesResponseSchema,
    GetEquipmentsSchema,
    GetExercisesSchema
} from "@src/admin/dto/dto";
import { InternalServerError } from "@lib/errors";
import initLogger from "@src/logger";

abstract class BaseController {
    protected service = new AdminService();
    protected logger = initLogger("debug");
}

export class EquipmentController extends BaseController {
    post = async (req: Request, res: Response) => {
        try {
            const dto = validateInput(CreateEquipmentSchema, req.body);
            await this.service.createEquipment(dto);
            send(res, 201, { message: "Equipment created successfully" });
        } catch (e: unknown) {
            if (e instanceof ValidationError) {
                abort(res, 400, String(e));
            } else {
                abort(res, 500, String(e));
            }
        }
    };

    get = async (req: Request, res: Response) => {
        try {
            if (!req.query.locale) abort(res, 400, "Locale not provided");
            const locale = req.query.locale as string;
            const dto = validateInput(GetEquipmentsSchema, { locale });
            const payload = await this.service.getEquipments(dto);
            validateOutput(EquipmentsResponseSchema, payload);
            send(res, 200, payload);
        } catch (e: unknown) {
            if (e instanceof InternalServerError) {
                this.logger.error(e);
                abort(res, 500, "Internal Error Occurred");
            } else if (e instanceof ValidationError) {
                abort(res, 400, String(e));
            }
        }
    };

    put = async (req: Request, res: Response) => {
        try {

        } catch (e: unknown) {
            abort(res, 500, String(e));
        }
    }
}

export class ExerciseController extends BaseController {
    post = async (req: Request, res: Response) => {
        try {
            const dto = validateInput(CreateExerciseSchema, req.body);
            await this.service.createExercise(dto);
            send(res, 201, { message: "Exercise created successfully" });
        } catch (e: unknown) {
            if (e instanceof ValidationError) {
                abort(res, 400, String(e));
            } else {
                abort(res, 500, String(e));
            }
        }
    };

    get = async (req: Request, res: Response) => {
        try {
            if (!req.query.locale) abort(res, 400, "Locale not provided");
            const locale = req.query.locale as string;
            const dto = validateInput(GetExercisesSchema, { locale });
            const payload = await this.service.getExercises(dto);
            validateInput(ExercisesResponseSchema, payload);
            send(res, 200, payload);
        } catch (e: unknown) {
            if (e instanceof ValidationError) {
                abort(res, 400, String(e));
            } else {
                abort(res, 500, String(e));
            }
        }
    }
}

export class LoginController extends BaseController {
    get = async (req: Request, res: Response) => {
        try {
            if (!req.headers.admin) abort(res, 401, "Unauthorized");
            if (this.service.adminLogin(req.headers.admin as string)) abort(res, 401, "Unauthorized");
            else send(res, 200, { message: "Logged in successfully" });
        } catch (e: unknown) {
            abort(res, 500, String(e));
        }
    }
}
