import { z } from "zod";
import { partialExcept } from "@lib/utils";
import { zodLocale } from "@lib/utils/validators";

const EquipmentSchema = z.object({
    equipmentId: z.uuid(),
    equipmentGroup: z.enum(["FREE_WEIGHT", "MACHINE", "BODY_WEIGHT", "AUXILIARY"]),
    equipmentName: z.string(),
    description: z.string(),
    locale: zodLocale,
});

const ExerciseSchema = z.object({
    exerciseId: z.uuid(),
    equipmentId: z.uuid(),
    exerciseName: z.string(),
    exerciseType: z.enum(["CARDIO", "WEIGHT", "STRETCH"]),
    targetMuscles: z.string(),
    instruction: z.string(),
    difficultyLvl: z.int(),
    locale: zodLocale
});

export const CreateEquipmentSchema = EquipmentSchema.omit({ equipmentId: true });
export const CreateExerciseSchema = ExerciseSchema.omit({ exerciseId: true });

export const GetEquipmentsSchema = EquipmentSchema.pick({ locale: true });
export const GetExercisesSchema = ExerciseSchema.pick({ locale: true });

export const UpdateEquipmentSchema = partialExcept(EquipmentSchema, ["equipmentId", "locale"]);
export const UpdateExerciseSchema = partialExcept(ExerciseSchema, ["exerciseId", "locale"]);

export const EquipmentsResponseSchema = z.array(EquipmentSchema);
export const ExercisesResponseSchema = z.array(ExerciseSchema);

export type CreateEquipmentDTO = z.infer<typeof CreateEquipmentSchema>;
export type CreateExerciseDTO = z.infer<typeof CreateExerciseSchema>;
export type GetEquipmentsDTO = z.infer<typeof GetEquipmentsSchema>;
export type GetExercisesDTO = z.infer<typeof GetExercisesSchema>;
export type UpdateEquipmentDTO = z.infer<typeof UpdateEquipmentSchema>;
export type UpdateExerciseDTO = z.infer<typeof UpdateExerciseSchema>;
export type EquipmentsResponseDTO = z.infer<typeof EquipmentsResponseSchema>;
export type ExerciseResponseDTO = z.infer<typeof ExercisesResponseSchema>;
