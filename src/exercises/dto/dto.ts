import { z } from "zod";

// Schema for creating an exercise plan
export const CreateExercisePlanSchema = z.object({
    exerciseId: z.uuid(),
    memo: z.string().optional(),
    description: z.string(),
});

// Schema for creating an exercise set within a plan
export const CreateExerciseSetSchema = z.object({
    exerciseId: z.uuid(),
    planId: z.uuid(),
    setTypeId: z.uuid(),
    setOrder: z.number().int(),
    reps: z.number().int().optional(),
    weight: z.number().int().optional(),
    restTime: z.number().int(),
    duration: z.number().int().optional(),
});

// Schema for recording actual set performance
export const CreateSetRecordSchema = z.object({
    setId: z.uuid(),
    actualReps: z.number().int().optional(),
    actualWeight: z.number().int().optional(),
    actualRestTime: z.number().int(),
    actualDuration: z.number().int().optional(),
    wasCompleted: z.boolean(),
});

// Response schemas
export const ExercisePlanResponseSchema = z.object({
    planId: z.uuid(),
    exerciseId: z.uuid(),
    memo: z.string().optional(),
    description: z.string(),
    createdAt: z.string(),
});

export const ExerciseSetResponseSchema = z.object({
    setId: z.uuid(),
    exerciseId: z.uuid(),
    planId: z.uuid(),
    setTypeId: z.uuid(),
    setOrder: z.number().int(),
    reps: z.number().int().optional(),
    weight: z.number().int().optional(),
    restTime: z.number().int(),
    duration: z.number().int().optional(),
    createdAt: z.string(),
});

export type CreateExercisePlanDTO = z.infer<typeof CreateExercisePlanSchema>;
export type CreateExerciseSetDTO = z.infer<typeof CreateExerciseSetSchema>;
export type CreateSetRecordDTO = z.infer<typeof CreateSetRecordSchema>;
export type ExercisePlanResponseDTO = z.infer<typeof ExercisePlanResponseSchema>;
export type ExerciseSetResponseDTO = z.infer<typeof ExerciseSetResponseSchema>;
