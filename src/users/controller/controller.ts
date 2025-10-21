import { Request, Response } from "express";
import { abort, send } from "@src/output";
import { ValidationError } from "@lib/errors";
import { UserService } from "@src/users/service/service";
import {
    GetUserEquipmentCodesSchema,
    GetUserExerciseCodesSchema,
    UpdateUserEquipmentsSchema
} from "@src/users/dto/dto";
import { validateInput } from "@lib/validate";


abstract class BaseController {
    protected service = new UserService();
}

export class UserEquipmentsController extends BaseController {
    get = async (req: Request, res: Response) => {
        try {
            const dto = validateInput(GetUserEquipmentCodesSchema, (req as any).userId);
            await this.service.getUserEquipmentCodes(dto);
        } catch (e: unknown) {
            if (e instanceof ValidationError) {
                abort(res, 400, String(e));
            } else {
                abort(res, 500, String(e));
            }
        }
    };

    patch = async (req: Request, res: Response) => {
        try {
            const dto = validateInput(UpdateUserEquipmentsSchema, req.body);
            await this.service.updateUserEquipments(dto);
            send(res, 200, { message: "Equipments bounded to the user successfully." });
        } catch (e: unknown) {
            if (e instanceof ValidationError) {
                abort(res, 400, String(e));
            } else {
                abort(res, 500, String(e));
            }
        }
    };
}

export class UserExercisesController extends BaseController {
    get = async (req: Request, res: Response) => {
        try {
            const dto = validateInput(GetUserExerciseCodesSchema, (req as any).userId);
            const codes = await this.service.getUserExerciseCodes(dto);
            send(res, 200, { codes });
        } catch (e: unknown) {
            if (e instanceof ValidationError) {
                abort(res, 400, String(e));
            } else {
                abort(res, 500, String(e));
            }
        }
    };
}
