import { AuthService } from "@src/auth/service/service";
import { Request, Response } from "express";
import { LoginPayloadSchema, SignUpWithOAuthSchema, SignUpWithPasswordSchema } from "@src/auth/dto/dto";
import { abort, clearRefreshToken, send, sendTokens } from "@src/output";
import { AuthenticationError, DuplicateError, ValidationError } from "@lib/errors";
import { validateInput } from "@lib/validate";
import { encryptToken, parseBasicToken } from "@lib/utils/encryptors";

abstract class BaseController {
    protected service = new AuthService();
}

export class GeneralSignUpController extends BaseController {
    post = async (req: Request, res: Response) => {
        try {
            const dto = validateInput(SignUpWithPasswordSchema, req.body);
            await this.service.signUpWithPassword(dto);
            send(res, 200, { message: "User created successfully." });
        } catch (e: any) {
            if (e instanceof DuplicateError) {
                abort(res, 409, e.toString());
            } else if (e instanceof ValidationError) {
                abort(res, 400, e.toString());
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
                abort(res, 409, e.toString());
            } else if (e instanceof ValidationError) {
                abort(res, 400, e.toString());
            } else {
                abort(res, 500, String(e));
            }
        }
    };
}

export class GeneralLoginController extends BaseController {
    post = async (req: Request, res: Response) => {
        try {
            const basicToken = req.get("Authorization");
            if (!basicToken) {
                abort(res, 401, "Unauthorized");
                return;
            }
            if (basicToken.split(" ")[0] !== "Basic") {
                abort(res, 400, "Invalid Basic Token");
                return;
            }
            const payload = validateInput(LoginPayloadSchema, parseBasicToken(basicToken.split(" ")[1]));
            const loginResponse = await this.service.login(payload);
            sendTokens(res,
                {
                    accessToken: loginResponse.accessToken,
                    refreshToken: loginResponse.refreshToken
                },
                { user: loginResponse.user });
        } catch (e: unknown) {
            if (e instanceof ValidationError) {
                abort(res, 400, e.toString());
            } else if (e instanceof AuthenticationError) {
                abort(res, 401, e.toString());
            } else {
                abort(res, 500, String(e));
            }
        }
    };
}

export class GeneralLogoutController extends BaseController {
    post = async (req: Request, res: Response) => {
        try {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken || refreshToken.split(" ")[0] !== "Bearer") {
                abort(res, 401, "Refresh token is required");
                return;
            }
            const tokenHash = encryptToken(refreshToken.split(" ")[1]);
            await this.service.logout(tokenHash);
            clearRefreshToken(res);
        } catch (e: unknown) {
            if (e instanceof ValidationError) {
                abort(res, 400, e.toString());
            } else {
                abort(res, 500, String(e));
            }
        }
    };
}
