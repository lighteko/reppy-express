import { AdminDAO } from "@src/admin/dao/dao";
import { CreateEquipmentSchema, CreateExerciseSchema, GetEquipmentsSchema, GetExercisesSchema } from "@src/admin/dto/dto";
import { Row } from "@lib/infra/postgres";

export class AdminService {
    dao: AdminDAO;

    constructor() {
        this.dao = new AdminDAO();
    }

    async getEquipments(inputData: GetEquipmentsSchema): Promise<Row[]> {
        return await this.dao.getEquipments(inputData.locale);
    }

    async getExercises(inputData: GetExercisesSchema): Promise<Row[]> {
        return await this.dao.getExercises(inputData.locale);
    }

    async createEquipment(inputData: CreateEquipmentSchema): Promise<void> {
        await this.dao.createEquipment(inputData);
    }

    async createExercise(inputData: CreateExerciseSchema): Promise<void> {
        await this.dao.createExercise(inputData);
    }

    adminLogin(password: string): boolean {
        return password !== process.env.ADMIN_PASSWORD
    }
}
