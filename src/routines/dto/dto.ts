import {
    ArrayMinSize,
    IsArray,
    IsDateString,
    IsNumber,
    IsOptional,
    IsString,
    IsUUID,
    ValidateNested
} from "class-validator";
import { Type } from "class-transformer";
import { ActiveDaysDTO } from "@src/onboarding/dto/dto";

export class UpdatePlanDTO {
    @IsUUID()
    planId!: string;

    @IsUUID()
    userId!: string;

    @IsDateString()
    @IsOptional()
    startDate?: string;

    @IsDateString()
    @IsOptional()
    goalDate?: string;

    @IsString()
    @IsOptional()
    goal?: string;
}

export class UpdateScheduleDTO {
    @IsUUID()
    userId!: string;

    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => ActiveDaysDTO)
    activeDays!: ActiveDaysDTO[];
}

export class RoutineDTO {
    @IsUUID()
    exerciseSetId!: string;

    @IsUUID()
    scheduleId!: string;

    @IsNumber()
    duration!: number;

    @IsNumber()
    setBreak!: number;

    @IsNumber()
    executionOrder!: number;
}

export class RefreshRoutinesDTO {
    @IsUUID()
    userId!: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => RoutineDTO)
    routines!: RoutineDTO[];
}
