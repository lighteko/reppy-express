import { EquipmentService } from "@src/equipments/service/service";
import { ValidationError } from "@lib/errors";
import { abort, send } from "@src/output";
import { Request, Response } from "express";
import { validateInput } from "@lib/validate";
import { GetFilteredEquipmentsSchema } from "@src/equipments/dto/dto";

abstract class BaseController {
    protected service = new EquipmentService();
}

export class EquipmentsController extends BaseController {
    get = async (req: Request, res: Response) => {
        try {
            const locale = req.query.locale as string;
            const types_to_exclude = req.query.exclude ?? [] as string[];
            const dto = validateInput(GetFilteredEquipmentsSchema, { locale, types_to_exclude });
            const data = await this.service.getFilteredEquipments(dto);
            send(res, 200, data);
        } catch (e: unknown) {
            if (e instanceof ValidationError) {
                abort(res, 400, e.toString());
            } else {
                abort(res, 500, String(e));
            }
        }
    };
}

export class EquipmentPresetsController extends BaseController {
    get = async (req: Request, res: Response) => {
        try {

        } catch (e: unknown) {
            if (e instanceof ValidationError) {
                abort(res, 400, e.toString());
            } else {
                abort(res, 500, String(e));
            }
        }
    }
}
