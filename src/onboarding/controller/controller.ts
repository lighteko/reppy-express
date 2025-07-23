import { OnboardingService } from "@src/onboarding/service/service";
import { Request, Response } from "express";
import { abort, send } from "@src/output";
import {
    CreatePlanDTO,
    CreateUserBioDTO,
    CreateUserEquipmentsDTO,
    CreateUserPreferencesDTO
} from "@src/onboarding/dto/dto";
import { validateDTO } from "@lib/validate/validate-dto";
import { ValidationError } from "@lib/errors";

abstract class BaseController {
    protected service = new OnboardingService();
}

export class BioController extends BaseController {
    post = async (req: Request, res: Response) => {
        try {
            const dto = await validateDTO(CreateUserBioDTO, req.body);
            await this.service.createUserBio(dto);
            send(res, 201, { message: "User bio created successfully" });
        } catch (e: unknown) {
            if (e instanceof ValidationError) {
                abort(res, 400, String(e));
            } else {
                abort(res, 500, String(e));
            }
        }
    };
}

export class PreferencesController extends BaseController {
    post = async (req: Request, res: Response) => {
        try {
            const dto = await validateDTO(CreateUserPreferencesDTO, req.body);
            await this.service.createUserPreferences(dto);
            send(res, 201, { message: "User preferences created successfully" });
        } catch (e: unknown) {
            if (e instanceof ValidationError) {
                abort(res, 400, String(e));
            } else {
                abort(res, 500, String(e));
            }
        }
    };
}

export class PlanController extends BaseController {
    post = async (req: Request, res: Response) => {
        try {
            const dto = await validateDTO(CreatePlanDTO, req.body);
            await this.service.createPlan(dto);
            send(res, 201, { message: "Plan created successfully" });
        } catch (e: unknown) {
            if (e instanceof ValidationError) {
                abort(res, 400, String(e));
            } else {
                abort(res, 500, String(e));
            }
        }
    };
}

export class UserEquipmentsController extends BaseController {
    post = async (req: Request, res: Response) => {
        try {
            const dto = await validateDTO(CreateUserEquipmentsDTO, req.body);
            await this.service.createUserEquipments(dto);
            send(res, 201, { message: "User equipments mapped successfully" });
        } catch (e: unknown) {
            if (e instanceof ValidationError) {
                abort(res, 400, String(e));
            } else {
                abort(res, 500, String(e));
            }
        }
    };
}
