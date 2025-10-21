import { AuthService } from "@src/auth/service/service";
import { Request, Response } from "express";
import { LoginPayloadSchema, SignUpWithOAuthSchema, SignUpWithPasswordSchema } from "@src/auth/dto/dto";
import { abort, send, sendTokens } from "@src/output";
import { DuplicateError, ValidationError } from "@lib/errors";
import { validateInput } from "@lib/validate";
import Tokens from "@lib/infra/tokens";

abstract class BaseController {
    protected service = new AuthService();
    protected tokens = Tokens.getInstance();
}

export class GeneralSignUpController extends BaseController {
    post = async (req: Request, res: Response) => {
        try {
            const dto = validateInput(SignUpWithPasswordSchema, req.body);
            await this.service.signUpWithPassword(dto);
            send(res, 200, { message: "User created successfully." });
        } catch (e: any) {
            if (e instanceof DuplicateError) {
                abort(res, 409, e.message);
            } else if (e instanceof ValidationError) {
                abort(res, 400, e.message);
            } else if (e instanceof AggregateError) {
                console.error(e.errors);
                abort(res, 500, String(e));
            } else {
                abort(res, 500, String(e));
            }
        }
    };
}

export class OAuthSignUpController extends BaseController {
    post = async (req: Request, res: Response) => {
        try {
            const dto = validateInput(SignUpWithOAuthSchema, req.body);
            await this.service.signUpWithOAuth(dto);
            send(res, 200, { message: "User created successfully." });
        } catch (e: any) {
            if (e instanceof DuplicateError) {
                abort(res, 409, e.message);
            } else if (e instanceof ValidationError) {
                abort(res, 400, e.message);
            } else {
                abort(res, 500, String(e));
            }
        }
    }
}

export class GeneralLoginController extends BaseController {
    post = async (req: Request, res: Response) => {
        try {
            const basicToken = req.headers.authorization;
            if (!basicToken) {
                abort(res, 401, "Unauthorized");
                return;
            }
            const payload = validateInput(LoginPayloadSchema, this.tokens.parseBasicToken(basicToken));
            const loginResponse = await this.service.login(payload);
            sendTokens(res, loginResponse);
        } catch (e: unknown) {
            if (e instanceof ValidationError) {
                abort(res, 400, e.message);
            } else {
                abort(res, 500, String(e));
            }
        }
    }
}
