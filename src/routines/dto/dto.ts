import { z } from "zod";
import { ActiveDaysSchema } from "@src/onboarding/dto/dto";

export const UpdateProgramSchema = z.object({
    programId: z.uuid(),
    userId: z.uuid(),
    programName: z.string().optional(),
    startDate: z.string().datetime().optional(),
    goalDate: z.string().datetime().optional(),
    goal: z.string().optional(),
});

export const UpdateScheduleSchema = z.object({
    userId: z.uuid(),
    activeDays: z.array(ActiveDaysSchema).min(1),
});

export const RoutinePlanMapSchema = z.object({
    planId: z.uuid(),
    execOrder: z.number().int(),
});

export const CreateRoutineSchema = z.object({
    userId: z.uuid(),
    scheduleId: z.uuid(),
    routineName: z.string(),
    plans: z.array(RoutinePlanMapSchema).min(1),
});

export const UpdateRoutineSchema = z.object({
    routineId: z.uuid(),
    userId: z.uuid(),
    routineName: z.string().optional(),
    plans: z.array(RoutinePlanMapSchema).optional(),
});

export type UpdateProgramDTO = z.infer<typeof UpdateProgramSchema>;
export type UpdateScheduleDTO = z.infer<typeof UpdateScheduleSchema>;
export type RoutinePlanMapDTO = z.infer<typeof RoutinePlanMapSchema>;
export type CreateRoutineDTO = z.infer<typeof CreateRoutineSchema>;
export type UpdateRoutineDTO = z.infer<typeof UpdateRoutineSchema>;
