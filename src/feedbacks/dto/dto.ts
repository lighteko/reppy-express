import { IsEnum, IsString, IsUUID } from "class-validator";

export enum SentimentType {
    POSITIVE = "POSITIVE",
    NEGATIVE = "NEGATIVE",
    NEUTRAL = "NEUTRAL"
}

export class CreateFeedbackDTO {
    @IsUUID()
    userId!: string;

    @IsUUID()
    mapId!: string;

    @IsEnum(SentimentType)
    sentiment!: SentimentType;

    @IsString()
    feedbackText!: string;
}
