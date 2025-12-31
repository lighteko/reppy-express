import { z } from "zod";
import { zodDouble, zodLocale } from "@lib/utils/validators";

export const SexSchema = z.enum(["MALE", "FEMALE", "N/A"]);

export const UnitSystemSchema = z.enum(["CM_KG", "IN_LB"]);

export const OnboardUserSchema = z.object({
    userId: z.uuid(),
    experience: z.enum(["BEGINNER", "INTERMEDIATE", "PROFESSIONAL"]),
    workoutCapacity: z.number(),
    unitSystem: UnitSystemSchema,
    presetId: z.uuid(),
    locale: zodLocale,
    sex: SexSchema,
    height: zodDouble,
    bodyWeight: zodDouble,
    birthdate: z.iso.datetime(),
    goal: z.string(),
    startDate: z.iso.datetime(),
    goalDate: z.iso.datetime(),
});

export type OnboardUserDTO = z.infer<typeof OnboardUserSchema>;
