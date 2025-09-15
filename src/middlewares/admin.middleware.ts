import { Request, Response, NextFunction } from "express";
import { abort } from "@src/output";

export const adminMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (req.headers.admin !== process.env.ADMIN_PASSWORD) {
        abort(res, 401, "Unauthorized");
    }
    next();
};
