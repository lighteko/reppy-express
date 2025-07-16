import {
    IsEmail,
    IsEnum,
    IsOptional,
    IsString,
    MinLength,
    IsUUID,
    IsInt,
    IsDateString,
    MaxLength
} from "class-validator";
import { IsDouble } from "@lib/validators/isdouble";

export class TokenPayloadDTO {
    @IsUUID()
    userId!: string;

    @IsEmail()
    email!: string;

    @IsInt()
    @IsOptional()
    iat?: number;

    @IsInt()
    @IsOptional()
    exp?: number;
}

enum OAuthProvider {
    GOOGLE = "google",
    APPLE = "apple",
}

class BaseSignUpDTO {
    @IsString()
    username!: string;

    @IsEmail()
    email!: string;
}

export class SignUpWithPasswordDTO extends BaseSignUpDTO {
    @IsString()
    @MinLength(8)
    password!: string;
}

export class SignUpWithOAuthDTO extends BaseSignUpDTO {
    @IsEnum(OAuthProvider)
    provider!: OAuthProvider;

    @IsString()
    sub!: string;
}

export class EmailVerificationDTO {
    @IsUUID()
    userId!: string;

    @IsString()
    username!: string;

    @IsEmail()
    email!: string;
}

export class LoginResponseDTO {
    @IsUUID()
    userId!: string;

    @IsString()
    username!: string;

    @IsEmail()
    email!: string;
}

export class PersonalInfoDTO {
    @IsUUID()
    userId!: string;

    @IsDouble()
    height!: number;

    @IsDouble()
    bodyWeight!: number;

    @IsDateString()
    birthDate!: string;

    @IsString()
    @MaxLength(1)
    sex!: string;
}

export class FullUserProfileDTO extends PersonalInfoDTO {
    @IsString()
    username!: string;

    @IsEmail()
    email!: string;

    @IsInt()
    age!: number;
}
