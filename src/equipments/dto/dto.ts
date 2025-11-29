import { z } from "zod";
import { zodLocale } from "@lib/utils";

export const EquipmentType = z.enum(["FREE_WEIGHTS", "BENCHES", "STRETCH", "MACHINES", "CABLES", "CARDIO", "BODY_WEIGHTS"]);

export const GetFilteredEquipmentsSchema = z.object({
    locale: zodLocale,
    types_to_exclude: z.array(EquipmentType),
});

const EquipmentsSchema = z.object({
    equipmentId: z.uuid(),
    equipmentName: z.string().nullable(),
    equipmentType: EquipmentType,
    equipmentCode: z.string(),
    description: z.string().nullable(),
});

export const GetFilteredEquipmentsResponseSchema = z.object({
    equipments: z.array(EquipmentsSchema)
});

export type GetFilteredEquipmentsDTO = z.infer<typeof GetFilteredEquipmentsSchema>;
export type GetFilteredEquipmentsResponseDTO = z.infer<typeof GetFilteredEquipmentsResponseSchema>;
