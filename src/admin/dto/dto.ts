import { IsEnum, IsNumber, IsOptional, IsString, IsUUID } from "class-validator";
import { IsDouble, IsLocaleString } from "@lib/validators/validators";

export enum EquipmentGroup {
    FREE_WEIGHT = "FREE_WEIGHT",
    MACHINE = "MACHINE",
    BODY_WEIGHT = "BODY_WEIGHT",
    AUXILIARY = "AUXILIARY"
}

export enum ExerciseType {
    CARDIO = "CARDIO",
    WEIGHT = "WEIGHT",
    STRETCH = "STRETCH"
}

export enum StrategyType {
    CONST = "CONST",
    ASCENDING = "ASCENDING",
    DESCENDING = "DESCENDING",
    DOUBLE_PYRAMID = "DOUBLE_PYRAMID",
    TIMED = "TIMED"
}

export class CreateEquipmentDTO {
    @IsEnum(EquipmentGroup)
    equipmentGroup!: EquipmentGroup;

    @IsString()
    equipmentName!: string;

    @IsString()
    description!: string;

    @IsLocaleString()
    locale!: string;
}

export class CreateExerciseDTO {
    @IsUUID()
    equipmentId!: string;

    @IsString()
    exerciseName!: string;

    @IsEnum(ExerciseType)
    exerciseType!: ExerciseType;

    @IsString()
    targetMuscles!: string;

    @IsString()
    instruction!: string;

    @IsNumber()
    difficulty_lvl!: number;

    @IsLocaleString()
    locale!: string;
}
