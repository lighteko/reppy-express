import { z } from "zod";
import { zodLocale } from "@lib/utils";

export const EquipmentType = z.enum(["FREE_WEIGHTS", "BENCHES", "STRETCH", "MACHINES", "CABLES", "CARDIO", "BODY_WEIGHTS"]);

export const GetFilteredEquipmentsSchema = z.object({
    locale: zodLocale,
    typesToExclude: z.array(EquipmentType),
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

const EquipmentPresetsSchema = z.object({
    presetCode: z.string(),
    equipments: z.array(EquipmentsSchema)
})

export const GetEquipmentPresetsSchema = z.object({
    locale: zodLocale,
})

export const GetEquipmentPresetsResponseSchema = z.object({
    presets: z.array(EquipmentPresetsSchema),
})

export type GetFilteredEquipmentsDTO = z.infer<typeof GetFilteredEquipmentsSchema>;
export type GetFilteredEquipmentsResponseDTO = z.infer<typeof GetFilteredEquipmentsResponseSchema>;
export type GetEquipmentPresetsDTO = z.infer<typeof GetEquipmentPresetsSchema>;
export type GetEquipmentPresetsResponseDTO = z.infer<typeof GetEquipmentPresetsResponseSchema>;
