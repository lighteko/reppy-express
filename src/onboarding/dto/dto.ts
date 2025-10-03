import { z } from "zod";
import { zodDouble, zod24Hour } from "@lib/utils/validators";

export const SexSchema = z.enum(["MALE", "FEMALE", "N/A"]);

export const CreateUserBioSchema = z.object({
    userId: z.uuid(),
    sex: SexSchema,
    height: zodDouble,
    bodyWeight: zodDouble,
    birthdate: z.string().datetime(),
});

export const CreateUserPreferencesSchema = z.object({
    userId: z.uuid(),
    unitSystem: z.string().regex(/^[cm][in]-[kg][lb]$/),
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
    startTime: zod24Hour,
    maxDuration: z.number().min(1),
});

export const CreatePlanSchema = z.object({
    userId: z.uuid(),
    startDate: z.string().datetime(),
    goalDate: z.string().datetime(),
    goal: z.string(),
    activeDays: z.array(ActiveDaysSchema),
});

export type Sex = z.infer<typeof SexSchema>;
export type CreateUserBioDTO = z.infer<typeof CreateUserBioSchema>;
export type CreateUserPreferencesDTO = z.infer<typeof CreateUserPreferencesSchema>;
export type CreateUserEquipmentsDTO = z.infer<typeof CreateUserEquipmentsSchema>;
export type WeekDays = z.infer<typeof WeekDaysSchema>;
export type ActiveDaysDTO = z.infer<typeof ActiveDaysSchema>;
export type CreatePlanDTO = z.infer<typeof CreatePlanSchema>;
