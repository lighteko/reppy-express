import { Response } from "express";

export function send(
    res: Response,
    code: number,
    data: object
) {
    return res.status(code).json(data);
}

export function sendTokens(
    res: Response,
    tokens: { accessToken: string },
    data: any = {},
    _isSessionOnly = false
) {
    const responseData = {
        data: {
            ...data,
            accessToken: tokens.accessToken,
        }
    };

    res.status(200).json(responseData);
}

export function abort(
    res: Response,
    code: number,
    description: string,
) {
    console.error(description);
    return res.status(code).json({ message: code === 500 ? "Internal Server Error" : description });
}
