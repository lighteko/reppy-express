import { AuthService } from "@src/auth/service/service";
import { Request, Response } from "express";
import { SignUpWithOAuthSchema, SignUpWithPasswordSchema } from "@src/auth/dto/dto";
import { abort, send } from "@src/output";
import { DuplicateError, ValidationError } from "@lib/errors";
import { validateInput } from "@lib/validate";

export class GeneralAuthController {
    private service: AuthService;

    constructor() {
        this.service = new AuthService();
    }

    post = async (req: Request, res: Response) => {
        try {
            const dto = validateInput(SignUpWithPasswordSchema, req.body);
            await this.service.signUpWithPassword(dto);
            send(res, 200, { message: "User created successfully." });
        } catch (e: any) {
            if (e instanceof DuplicateError) {
                abort(res, 409, e.message);
            } else if (e instanceof ValidationError) {
                abort(res, 400, String(e));
            } else if (e instanceof AggregateError) {
                console.error(e.errors);
                abort(res, 500, String(e));
            } else {
                abort(res, 500, String(e));
            }
        }
    };
}

export class OAuthBasedAuthController {
    private service: AuthService;

    constructor() {
        this.service = new AuthService();
    }

    post = async (req: Request, res: Response) => {
        try {
            const dto = validateInput(SignUpWithOAuthSchema, req.body);
            await this.service.signUpWithOAuth(dto);
            send(res, 200, { message: "User created successfully." });
        } catch (e: any) {
            if (e instanceof DuplicateError) {
                abort(res, 409, e.message);
            } else if (e instanceof ValidationError) {
                abort(res, 400, String(e));
            } else {
                abort(res, 500, String(e));
            }
        }
    }
}
