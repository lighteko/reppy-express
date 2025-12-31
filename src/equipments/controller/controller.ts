import { EquipmentService } from "@src/equipments/service/service";
import { ValidationError } from "@lib/errors";
import { abort, send } from "@src/output";
import { Request, Response } from "express";
import { validateInput } from "@lib/validate";
import { GetEquipmentPresetsSchema, GetFilteredEquipmentsSchema } from "@src/equipments/dto/dto";

abstract class BaseController {
    protected service = new EquipmentService();
}

export class EquipmentsController extends BaseController {
    get = async (req: Request, res: Response) => {
        try {
            const locale = req.query.locale as string;
            const typesToExclude = req.query.exclude ?? [] as string[];
            const dto = validateInput(GetFilteredEquipmentsSchema, { locale, typesToExclude });
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
            const locale = req.query.locale as string;
            const dto = validateInput(GetEquipmentPresetsSchema, { locale });
            const data = await this.service.getEquipmentPresets(dto);
            send(res, 200, data);
        } catch (e: unknown) {
            if (e instanceof ValidationError) {
                abort(res, 400, e.toString());
            } else {
                abort(res, 500, String(e));
            }
        }
    }
}
