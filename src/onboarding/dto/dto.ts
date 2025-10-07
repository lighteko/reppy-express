import { z } from "zod";
import { zodDouble } from "@lib/utils/validators";

export const SexSchema = z.enum(["MALE", "FEMALE", "N/A"]);

export const CreateUserBioSchema = z.object({
    userId: z.uuid(),
    sex: SexSchema,
    height: zodDouble,
    bodyWeight: zodDouble,
    birthdate: z.iso.datetime(),
});

export const UnitSystemSchema = z.enum(["CM_KG", "IN_LB"]);

export const CreateUserPreferencesSchema = z.object({
    userId: z.uuid(),
    unitSystem: UnitSystemSchema,
    notifReminder: z.boolean(),
    locale: z.string().regex(/^[a-z]{2}-[A-Z]{2}$/),
});

export const CreateUserEquipmentsSchema = z.object({
    equipmentIds: z.array(z.uuid()).min(1),
    userId: z.uuid(),
});

export const WeekDaysSchema = z.enum(["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]);

export const ActiveDaysSchema = z.object({
    weekday: WeekDaysSchema,
});

export const CreateProgramSchema = z.object({
    userId: z.uuid(),
    programName: z.string(),
    startDate: z.iso.datetime(),
    goalDate: z.iso.datetime(),
    goal: z.string(),
    activeDays: z.array(ActiveDaysSchema),
});

export type Sex = z.infer<typeof SexSchema>;
export type UnitSystem = z.infer<typeof UnitSystemSchema>;
export type CreateUserBioDTO = z.infer<typeof CreateUserBioSchema>;
export type CreateUserPreferencesDTO = z.infer<typeof CreateUserPreferencesSchema>;
export type CreateUserEquipmentsDTO = z.infer<typeof CreateUserEquipmentsSchema>;
export type WeekDays = z.infer<typeof WeekDaysSchema>;
export type ActiveDaysDTO = z.infer<typeof ActiveDaysSchema>;
export type CreateProgramDTO = z.infer<typeof CreateProgramSchema>;
