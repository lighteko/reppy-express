import { IsEnum, IsNotEmpty, IsString } from "class-validator";

export enum SenderType {
    USER = "USER",
    AI = "AI"
}

export class CreateChatDTO {
    @IsNotEmpty()
    @IsString()
    userId!: string;

    @IsNotEmpty()
    @IsString()
    @IsEnum(SenderType)
    senderType!: SenderType;

    @IsNotEmpty()
    @IsString()
    message!: string;
}

export class ChatResponseDTO {
    @IsNotEmpty()
    @IsString()
    msgId!: string;

    @IsNotEmpty()
    @IsString()
    userId!: string;

    @IsNotEmpty()
    @IsString()
    @IsEnum(SenderType)
    senderType!: SenderType;

    @IsNotEmpty()
    @IsString()
    message!: string;

    @IsNotEmpty()
    @IsString()
    createdAt!: string;
}
