import { AuthService } from "@src/auth/service/service";
import { Request, Response } from "express";
import { plainToInstance } from "class-transformer";
import { SignUpWithOAuthDTO, SignUpWithPasswordDTO } from "@src/auth/dto/dto";
import { abort, send } from "@src/output";
import { DuplicateError } from "@lib/errors";

export class GeneralAuthController {
    private service: AuthService;

    constructor() {
        this.service = new AuthService();
    }

    post = async (req: Request, res: Response) => {
        try {
            const instance = plainToInstance(SignUpWithPasswordDTO, req.body);
            await this.service.signUpWithPassword(instance);
            send(res, 200, { message: "User created successfully." });
        } catch (e: any) {
            if (e instanceof DuplicateError) {
                abort(res, 409, e.message);
            }
            if (e instanceof AggregateError) {
                console.error(e.errors);
            }
            abort(res, 500, String(e));
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
            const instance = plainToInstance(SignUpWithOAuthDTO, req.body);
            await this.service.signUpWithOAuth(req.body);
            send(res, 200, { message: "User created successfully." });
        } catch (e: any) {
            if (e instanceof DuplicateError) {
                abort(res, 409, e.message);
            }
            abort(res, 500, String(e));
        }
    }
}
