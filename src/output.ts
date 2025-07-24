import { Response } from "express";

export function send(
    res: Response,
    code: number,
    data: object
) {
    return res.status(code).json({ data });
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
