import { Request, Response, NextFunction } from "express";
import { abort } from "@src/output";
import Tokens from "@lib/infra/tokens";

export const authenticate = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.get("authorization") as string;
    let token: string | undefined;

    console.log(authHeader);
    if (authHeader) {
        const tokenParts = authHeader.split(" ");
        if (tokenParts.length === 2 && tokenParts[0] === "Bearer") {
            token = tokenParts[1];
        }
    }

    if (!token) {
        abort(res, 401, "Authentication required");
        return;
    }

    try {
        const tokens = Tokens.getInstance();
        const decoded = tokens.verifyAccessToken(token);

        (req as any).user = {
            userId: decoded.userId,
            email: decoded.email,
        };

        next();
    } catch (error) {
        console.error(error);
        abort(res, 401, "Invalid or expired token");
    }
};
