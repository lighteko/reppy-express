import { AdminService } from "@src/admin/service/service";
import { Request, Response } from "express";
import { abort, send } from "@src/output";
import { ValidationError } from "class-validator";
import { validateDTO } from "@lib/validate/validate-dto";
import { CreateEquipmentDTO, CreateExerciseDTO } from "@src/admin/dto/dto";

abstract class BaseController {
    protected service = new AdminService();
}

export class EquipmentController extends BaseController {
    post = async (req: Request, res: Response) => {
        try {
            const dto = await validateDTO(CreateEquipmentDTO, req.body);
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
}

export class ExerciseController extends BaseController {
    post = async (req: Request, res: Response) => {
        try {
            const dto = await validateDTO(CreateExerciseDTO, req.body);
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
}
