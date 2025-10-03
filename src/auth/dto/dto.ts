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

export const PersonalInfoSchema = z.object({
    userId: z.uuid(),
    height: zodDouble,
    bodyWeight: zodDouble,
    birthDate: z.iso.datetime(),
    sex: z.string().max(1),
});

export const FullUserProfileSchema = PersonalInfoSchema.extend({
    username: z.string(),
    email: z.email(),
    age: z.int(),
});

export type TokenPayloadDTO = z.infer<typeof TokenPayloadSchema>;
export type OAuthProvider = z.infer<typeof OAuthProviderSchema>;
export type SignUpWithPasswordDTO = z.infer<typeof SignUpWithPasswordSchema>;
export type SignUpWithOAuthDTO = z.infer<typeof SignUpWithOAuthSchema>;
export type EmailVerificationDTO = z.infer<typeof EmailVerificationSchema>;
export type LoginResponseDTO = z.infer<typeof LoginResponseSchema>;
export type PersonalInfoDTO = z.infer<typeof PersonalInfoSchema>;
export type FullUserProfileDTO = z.infer<typeof FullUserProfileSchema>;
