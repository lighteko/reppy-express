import { z } from "zod";
import { partialExcept } from "@lib/utils";

const EquipmentSchema = z.object({
    equipmentId: z.uuidv4(),
    equipmentGroup: z.enum(["FREE_WEIGHT", "MACHINE", "BODY_WEIGHT", "AUXILIARY"]),
    equipmentName: z.string(),
    description: z.string(),
    locale: z.regex(/^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$/),
});

const ExerciseSchema = z.object({
    exerciseId: z.uuidv4(),
    equipmentId: z.uuidv4(),
    exerciseName: z.string(),
    exerciseType: z.enum(["CARDIO", "WEIGHT", "STRETCH"]),
    targetMuscles: z.string(),
    instruction: z.string(),
    difficultyLvl: z.int(),
    locale: z.regex(/^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$/)
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
