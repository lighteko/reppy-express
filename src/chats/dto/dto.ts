import { IsArray, IsDateString, IsEnum, IsString, IsUUID, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export enum SenderType {
    USER = "USER",
    AI = "AI"
}

export class CreateChatDTO {
    @IsUUID()
    userId!: string;

    @IsString()
    @IsEnum(SenderType)
    senderType!: SenderType;

    @IsString()
    message!: string;
}

export class GetChatsWithCursorDTO {
    @IsUUID()
    userId!: string;

    @IsDateString()
    createdAt!: string;
}

export class ChatResponseDTO {
    @IsUUID()
    msgId!: string;

    @IsUUID()
    userId!: string;

    @IsString()
    @IsEnum(SenderType)
    senderType!: SenderType;

    @IsString()
    message!: string;

    @IsDateString()
    createdAt!: string;
}

export class MultipleChatResponseDTO {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ChatResponseDTO)
    chats!: ChatResponseDTO[];
}
