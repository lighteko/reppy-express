import { CookieOptions, Response } from "express";

export function send(
    res: Response,
    code: number,
    data: object
) {
    return res.status(code).json(data);
}

export function sendTokens(
    res: Response,
    tokens: { accessToken: string; refreshToken: string },
    data: any = {},
    isSessionOnly = false
) {
    const isProd = process.env.NODE_ENV === "production";

    const cookieOptions: CookieOptions = {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        maxAge: !isSessionOnly ? 7 * 24 * 60 * 60 * 1000 : undefined,
    };

    res.cookie("refreshToken", `Bearer ${tokens.refreshToken}`, cookieOptions);

    const responseData = {
        ...data,
        accessToken: tokens.accessToken,
    };

    res.status(200).json(responseData);
}

export function clearRefreshToken(res: Response, message: string = "Log out succeeded") {
    const isProd = process.env.NODE_ENV === "production";

    // Only clear the refresh token cookie since access token is no longer stored as a cookie
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        path: "/",
    });

    res.status(200).send({ message });
}

export function abort(
    res: Response,
    code: number,
    description: string,
) {
    console.error(description);
    return res.status(code).json({ message: code === 500 ? "Internal Server Error" : description });
}
