import { IsEnum, IsNumber, IsOptional, IsString, IsUUID, Matches } from "class-validator";
import { IsDouble } from "@lib/validators/validators";

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

    @Matches(/^[a-z]{2}-[a-z]{2}$/)
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

    @Matches(/^[a-z]{2}-[a-z]{2}$/)
    locale!: string;
}

export class CreateSetStrategyDTO {
    @IsUUID()
    userId!: string;

    @IsString()
    strategyName!: string;

    @IsEnum(StrategyType)
    strategyType!: StrategyType;

    @IsDouble()
    @IsOptional()
    baseWeight?: number;

    @IsDouble()
    @IsOptional()
    weightFactor?: number;

    @IsNumber()
    @IsOptional()
    baseReps?: number;

    @IsDouble()
    @IsOptional()
    repsFactor?: number;

    @IsNumber()
    @IsOptional()
    baseRest?: number;

    @IsDouble()
    @IsOptional()
    restFactor?: number;

    @IsNumber()
    @IsOptional()
    duration?: number;

    @IsString()
    description!: string;
}

export class CreateExerciseRecordDTO {
    @IsUUID()
    userId!: string;

    @IsUUID()
    mapId!: string;

    @IsEnum(ExerciseType)
    exerciseType!: ExerciseType;

    @IsNumber()
    @IsOptional()
    completedSets?: number;

    @IsDouble()
    @IsOptional()
    maxWeight?: number;

    @IsNumber()
    @IsOptional()
    maxDuration?: number;
}
