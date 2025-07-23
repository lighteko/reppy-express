import { AdminDAO } from "@src/admin/dao/dao";
import { CreateEquipmentDTO, CreateExerciseDTO } from "@src/admin/dto/dto";

export class AdminService {
    dao: AdminDAO;

    constructor() {
        this.dao = new AdminDAO();
    }

    async createEquipment(inputData: CreateEquipmentDTO): Promise<void> {
        await this.dao.createEquipment(inputData);
    }

    async createExercise(inputData: CreateExerciseDTO): Promise<void> {
        await this.dao.createExercise(inputData);
    }
}
