import { z } from "zod";

export const UpdateProgramSchema = z.object({
    programId: z.uuid(),
    userId: z.uuid(),
    programName: z.string().optional(),
    startDate: z.iso.datetime().optional(),
    goalDate: z.iso.datetime().optional(),
    goal: z.string().optional(),
});

const SetSchema = z.object({
    setTypeId: z.uuid(),
    setOrder: z.int(),
    reps: z.int().optional(),
    weight: z.float32().optional(),
    restTime: z.int(),
    duration: z.int().optional(),
});

const PlanSchema = z.object({
    exerciseId: z.uuid(),
    description: z.string(),
    memo: z.string().optional(),
    execOrder: z.int(),
    sets: z.array(SetSchema).min(1),
});

const RoutineSchema = z.object({
    routineName: z.string(),
    routineOrder: z.int(),
    plans: z.array(PlanSchema).min(1),
});

export const CreateBatchRoutinesSchema = z.object({
    programId: z.uuid(),
    userId: z.uuid(),
    routines: z.array(RoutineSchema).min(1),
});

export const CreateRoutineSchema = z.object({
    programId: z.uuid(),
    userId: z.uuid(),
    routineName: z.string(),
    routineOrder: z.int(),
    plans: z.array(PlanSchema).min(1),
});

export type CreateBatchRoutinesDTO = z.infer<typeof CreateBatchRoutinesSchema>;
export type CreateRoutineDTO = z.infer<typeof CreateRoutineSchema>;
export type UpdateProgramDTO = z.infer<typeof UpdateProgramSchema>;
