import { EquipmentDAO } from "@src/equipments/dao/dao";
import {
    GetEquipmentPresetsDTO,
    GetEquipmentPresetsResponseDTO, GetEquipmentPresetsResponseSchema,
    GetFilteredEquipmentsDTO,
    GetFilteredEquipmentsResponseDTO,
    GetFilteredEquipmentsResponseSchema,
} from "@src/equipments/dto/dto";
import { validateInput } from "@lib/validate";

export class EquipmentService {
    private dao: EquipmentDAO;

    constructor() {
        this.dao = new EquipmentDAO();
    }

    async getFilteredEquipments(inputData: GetFilteredEquipmentsDTO): Promise<GetFilteredEquipmentsResponseDTO> {
        const response = await this.dao.getFilteredEquipments(inputData);
        return validateInput(GetFilteredEquipmentsResponseSchema, { equipments: [...response] });
    }

    async getEquipmentPresets(inputData: GetEquipmentPresetsDTO): Promise<GetEquipmentPresetsResponseDTO> {
        const response = await this.dao.getEquipmentPresets(inputData);
        return validateInput(GetEquipmentPresetsResponseSchema, { presets: [...response] });
    }
}
