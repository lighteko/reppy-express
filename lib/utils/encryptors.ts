import bcrypt from "bcrypt";
import crypto from "crypto";
import { AuthenticationError } from "@lib/errors";

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
