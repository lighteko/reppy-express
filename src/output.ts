import { validate } from "class-validator";
import { ClassConstructor, plainToClass } from "class-transformer";
import { Response } from "express";

export function send(
    res: Response,
    code: number,
    data: object,
    dto: ClassConstructor<unknown> | null = null
) {
    if (!dto) return res.status(code).json({ data });

    try {
        const classInstance = plainToClass(dto, data);
        validate(classInstance as object).then(errors => {
            if (errors.length) throw new Error("Validation failed");
            res.status(code).json({ data });
        });
    } catch (e: any) {
        abort(res, 500, String(e));
    }
}

export function sendTokens(
    res: Response,
    tokens: { accessToken: string; refreshToken: string },
    payload: any = {}
) {
    return res.status(200).json({
        data: {
            ...payload,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        },
    });
}

export function clearTokens(
    res: Response,
    message = "Logout succeeded"
) {
    return res.status(200).json({
        data: { message }
    });
}

export function abort(
    res: Response,
    code: number,
    description: string
) {
    return res.status(code).json({
        data: { message: description }
    });
}
