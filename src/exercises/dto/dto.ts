import { z } from "zod";
import { zodDouble, zodValidatePair } from "@lib/utils/validators";

// Define enums locally since they're not exported from admin module
export const StrategyTypeSchema = z.enum(["TIMED", "REPS", "MIXED"]);
export const ExerciseTypeSchema = z.enum(["CARDIO", "WEIGHT", "STRETCH"]);

const BaseCreateSetStrategySchema = z.object({
    userId: z.uuid(),
    strategyName: z.string(),
    strategyType: StrategyTypeSchema,
    baseWeight: zodDouble.optional(),
    weightFactor: zodDouble.optional(),
    baseReps: z.number().optional(),
    repsFactor: zodDouble.optional(),
    baseRest: z.number().optional(),
    restFactor: zodDouble.optional(),
    duration: z.number().optional(),
    description: z.string(),
});

// Apply paired field validations
export const CreateSetStrategySchema = zodValidatePair(
    zodValidatePair(
        zodValidatePair(BaseCreateSetStrategySchema, "baseWeight", "weightFactor"),
        "baseReps", "repsFactor"
    ),
    "baseRest", "restFactor"
).refine(
    (data) => {
        if (data.strategyType === "TIMED") {
            return data.duration !== undefined && data.duration !== null;
        }
        return true;
    },
    {
        message: "duration is required when strategyType is 'TIMED'",
        path: ["duration"]
    }
);

export const CreateExerciseRecordSchema = z.object({
    userId: z.uuid(),
    mapId: z.uuid(),
    exerciseType: ExerciseTypeSchema,
    completedSets: z.number().optional(),
    maxWeight: zodDouble.optional(),
    maxDuration: z.number().optional(),
});

export type StrategyType = z.infer<typeof StrategyTypeSchema>;
export type ExerciseType = z.infer<typeof ExerciseTypeSchema>;
export type CreateSetStrategyDTO = z.infer<typeof CreateSetStrategySchema>;
export type CreateExerciseRecordDTO = z.infer<typeof CreateExerciseRecordSchema>;
