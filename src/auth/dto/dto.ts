import { z } from "zod";
import { zodDouble } from "@lib/utils/validators";

export const TokenPayloadSchema = z.object({
    userId: z.uuid(),
    email: z.email(),
    iat: z.int().optional(),
    exp: z.int().optional(),
});

export const OAuthProviderSchema = z.enum(["google", "apple"]);

const BaseSignUpSchema = z.object({
    username: z.string(),
    email: z.email(),
});

export const SignUpWithPasswordSchema = BaseSignUpSchema.extend({
    password: z.string().min(8),
});

export const SignUpWithOAuthSchema = BaseSignUpSchema.extend({
    provider: OAuthProviderSchema,
    sub: z.string(),
});

export const EmailVerificationSchema = z.object({
    userId: z.uuid(),
    username: z.string(),
    email: z.email(),
});

export const LoginResponseSchema = z.object({
    userId: z.uuid(),
    username: z.string(),
    email: z.email(),
});

export const FullUserProfileSchema = z.object({
    userId: z.uuid(),
    username: z.string(),
    email: z.email(),
    sex: z.enum(["MALE", "FEMALE", "N/A"]).optional(),
    height: zodDouble.optional(),
    bodyWeight: zodDouble.optional(),
    birthdate: z.string().optional(),
    age: z.number().int().optional(),
});

export type TokenPayloadDTO = z.infer<typeof TokenPayloadSchema>;
export type OAuthProvider = z.infer<typeof OAuthProviderSchema>;
export type SignUpWithPasswordDTO = z.infer<typeof SignUpWithPasswordSchema>;
export type SignUpWithOAuthDTO = z.infer<typeof SignUpWithOAuthSchema>;
export type EmailVerificationDTO = z.infer<typeof EmailVerificationSchema>;
export type LoginResponseDTO = z.infer<typeof LoginResponseSchema>;
export type FullUserProfileDTO = z.infer<typeof FullUserProfileSchema>;
