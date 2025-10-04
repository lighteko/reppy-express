import { z } from "zod";
import { partialExcept } from "@lib/utils";
import { zodLocale } from "@lib/utils/validators";

const MuscleSchema = z.object({
    muscleId: z.uuid(),
    muscleName: z.string(),
    locale: zodLocale,
});

const EquipmentSchema = z.object({
    equipmentId: z.uuid(),
    equipmentName: z.string(),
    instruction: z.string(),
    locale: zodLocale,
});

const ExerciseSchema = z.object({
    exerciseId: z.uuid(),
    equipmentId: z.uuid(),
    exerciseName: z.string(),
    mainMuscleId: z.uuid(),
    auxMuscleId: z.uuid().optional(),
    instruction: z.string(),
    difficultyLevel: z.number().int(),
    locale: zodLocale
});

export const CreateMuscleSchema = MuscleSchema.omit({ muscleId: true });
export const CreateEquipmentSchema = EquipmentSchema.omit({ equipmentId: true });
export const CreateExerciseSchema = ExerciseSchema.omit({ exerciseId: true });

export const GetMusclesSchema = MuscleSchema.pick({ locale: true });
export const GetEquipmentsSchema = EquipmentSchema.pick({ locale: true });
export const GetExercisesSchema = ExerciseSchema.pick({ locale: true });

export const UpdateMuscleSchema = partialExcept(MuscleSchema, ["muscleId", "locale"]);
export const UpdateEquipmentSchema = partialExcept(EquipmentSchema, ["equipmentId", "locale"]);
export const UpdateExerciseSchema = partialExcept(ExerciseSchema, ["exerciseId", "locale"]);

export const MusclesResponseSchema = z.array(MuscleSchema);
export const EquipmentsResponseSchema = z.array(EquipmentSchema);
export const ExercisesResponseSchema = z.array(ExerciseSchema);

export type CreateMuscleDTO = z.infer<typeof CreateMuscleSchema>;
export type CreateEquipmentDTO = z.infer<typeof CreateEquipmentSchema>;
export type CreateExerciseDTO = z.infer<typeof CreateExerciseSchema>;
export type GetMusclesDTO = z.infer<typeof GetMusclesSchema>;
export type GetEquipmentsDTO = z.infer<typeof GetEquipmentsSchema>;
export type GetExercisesDTO = z.infer<typeof GetExercisesSchema>;
export type UpdateMuscleDTO = z.infer<typeof UpdateMuscleSchema>;
export type UpdateEquipmentDTO = z.infer<typeof UpdateEquipmentSchema>;
export type UpdateExerciseDTO = z.infer<typeof UpdateExerciseSchema>;
export type MusclesResponseDTO = z.infer<typeof MusclesResponseSchema>;
export type EquipmentsResponseDTO = z.infer<typeof EquipmentsResponseSchema>;
export type ExerciseResponseDTO = z.infer<typeof ExercisesResponseSchema>;
