import { z } from "zod";

export const UpdateUserEquipmentsSchema = z.object({
    addedEquipmentIds: z.array(z.uuid()),
    removedEquipmentIds: z.array(z.uuid()),
    userId: z.uuid(),
});

export const GetUserEquipmentCodesSchema = z.object({
    userId: z.uuid()
})

export const GetUserExerciseCodesSchema = z.object({
    userId: z.uuid()
})

export type UpdateUserEquipmentsDTO = z.infer<typeof UpdateUserEquipmentsSchema>;
export type GetUserEquipmentCodesDTO = z.infer<typeof GetUserEquipmentCodesSchema>;
export type GetUserExerciseCodesDTO = z.infer<typeof GetUserExerciseCodesSchema>;
