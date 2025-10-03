import { z } from "zod";
import { ActiveDaysSchema } from "@src/onboarding/dto/dto";

export const UpdatePlanSchema = z.object({
    planId: z.uuid(),
    userId: z.uuid(),
    startDate: z.string().datetime().optional(),
    goalDate: z.string().datetime().optional(),
    goal: z.string().optional(),
});

export const UpdateScheduleSchema = z.object({
    userId: z.uuid(),
    activeDays: z.array(ActiveDaysSchema).min(1),
});

export const RoutineSchema = z.object({
    exerciseSetId: z.uuid(),
    scheduleId: z.uuid(),
    duration: z.number(),
    setBreak: z.number(),
    executionOrder: z.number(),
});

export const RefreshRoutinesSchema = z.object({
    userId: z.uuid(),
    routines: z.array(RoutineSchema),
});

export type UpdatePlanDTO = z.infer<typeof UpdatePlanSchema>;
export type UpdateScheduleDTO = z.infer<typeof UpdateScheduleSchema>;
export type RoutineDTO = z.infer<typeof RoutineSchema>;
export type RefreshRoutinesDTO = z.infer<typeof RefreshRoutinesSchema>;
