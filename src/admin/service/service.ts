import { AdminDAO } from "@src/admin/dao/dao";
import { CreateEquipmentDTO, CreateExerciseDTO, GetEquipmentsDTO, GetExercisesDTO } from "@src/admin/dto/dto";
import { Row } from "@lib/infra/postgres";

export class AdminService {
    dao: AdminDAO;

    constructor() {
        this.dao = new AdminDAO();
    }

    async getEquipments(inputData: GetEquipmentsDTO): Promise<Row[]> {
        return await this.dao.getEquipments(inputData.locale);
    }

    async getExercises(inputData: GetExercisesDTO): Promise<Row[]> {
        return await this.dao.getExercises(inputData.locale);
    }

    async createEquipment(inputData: CreateEquipmentDTO): Promise<void> {
        await this.dao.createEquipment(inputData);
    }

    async createExercise(inputData: CreateExerciseDTO): Promise<void> {
        await this.dao.createExercise(inputData);
    }

    adminLogin(password: string): boolean {
        return password !== process.env.ADMIN_PASSWORD
    }
}
