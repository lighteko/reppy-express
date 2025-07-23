import {
    ArrayMinSize,
    IsArray,
    IsBoolean,
    IsDateString,
    IsEnum, IsNumber,
    IsString,
    IsUUID,
    Matches, Min,
    ValidateNested
} from "class-validator";
import { Is24Hour, IsDouble } from "@lib/validators/validators";
import { Type } from "class-transformer";

export enum Sex {
    MALE = "MALE",
    FEMALE = "FEMALE",
    N_A = "N/A"
}

export class CreateUserBioDTO {
    @IsUUID()
    userId!: string;

    @IsEnum(Sex)
    sex!: Sex;

    @IsDouble()
    height!: number;

    @IsDouble()
    bodyWeight!: number;

    @IsDateString()
    birthdate!: string;
}

export class CreateUserPreferencesDTO {
    @IsUUID()
    userId!: string;

    @Matches(/^[cm][in]-[kg][lb]$/)
    unitSystem!: string;

    @IsBoolean()
    notifReminder!: boolean;

    @Matches(/^[a-z]{2}-[A-Z]{2}$/)
    locale!: string;
}

export class CreateUserEquipmentsDTO {
    @IsArray()
    @ArrayMinSize(1)
    @IsUUID("4", { each: true })
    equipmentIds!: string[];

    @IsUUID()
    userId!: string;
}

export enum WeekDays {
    SUN = "SUN",
    MON = "MON",
    TUE = "TUE",
    WED = "WED",
    THU = "THU",
    FRI = "FRI",
    SAT = "SAT"
}

export class ActiveDaysDTO {
    @IsEnum(WeekDays)
    weekday!: WeekDays;

    @Is24Hour()
    startTime!: string;

    @IsNumber()
    @Min(1)
    maxDuration!: number;
}

export class CreatePlanDTO {
    @IsUUID()
    userId!: string;

    @IsDateString()
    startDate!: string;

    @IsDateString()
    goalDate!: string;

    @IsString()
    goal!: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ActiveDaysDTO)
    activeDays!: ActiveDaysDTO[];
}
