import bcrypt from "bcrypt";
import crypto from "crypto";
import { AuthenticationError, ValidationError } from "@lib/errors";
import jwt from "jsonwebtoken";

export async function validatePassword(password: string, encrypted: string): Promise<void> {
    if (!await bcrypt.compare(password, encrypted)) {
        throw new AuthenticationError("Invalid Password");
    }
}

export async function encryptPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 12);
}

export function encryptToken(token: string): Buffer {
    const PEPPER = process.env.TOKEN_PEPPER!;
    return crypto.createHmac("sha256", PEPPER).update(token).digest();
}

export function parseBasicToken(basicToken: string): {
    email: string;
    password: string;
} {
    const decoded = Buffer.from(basicToken, "base64").toString("utf-8");
    const delimiterPos = decoded.indexOf(":");
    if (delimiterPos === -1) {
        throw new ValidationError("Invalid credential format");
    }
    const email = decoded.substring(0, delimiterPos);
    const password = decoded.substring(delimiterPos + 1);
    if (!email || !password) {
        throw new AuthenticationError("Invalid credentials");
    }
    return { email, password };
}

export function tokenExpiresAt(token: string): Date {
    const decoded = jwt.decode(token) as {exp: number};
    return new Date(decoded.exp * 1000);
}
