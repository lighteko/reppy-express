import { IsEnum, IsNumber, IsOptional, IsString, IsUUID } from "class-validator";
import { IsDouble, RequiredIf, ValidatePair } from "@lib/utils/validators";
import { ExerciseType, StrategyType } from "@src/admin/dto/dto";

export class CreateSetStrategyDTO {
    @IsUUID()
    userId!: string;

    @IsString()
    strategyName!: string;

    @IsEnum(StrategyType)
    strategyType!: StrategyType;

    @IsDouble()
    @IsOptional()
    @ValidatePair("weightFactor")
    baseWeight?: number;

    @IsDouble()
    @IsOptional()
    @ValidatePair("baseWeight")
    weightFactor?: number;

    @IsNumber()
    @IsOptional()
    @ValidatePair("repsFactor")
    baseReps?: number;

    @IsDouble()
    @IsOptional()
    @ValidatePair("baseReps")
    repsFactor?: number;

    @IsNumber()
    @IsOptional()
    @ValidatePair("restFactor")
    baseRest?: number;

    @IsDouble()
    @IsOptional()
    @ValidatePair("baseRest")
    restFactor?: number;

    @IsNumber()
    @IsOptional()
    @RequiredIf("strategyType", "TIMED")
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
