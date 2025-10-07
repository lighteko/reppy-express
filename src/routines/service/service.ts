import { RoutinesDAO } from "@src/routines/dao/dao";
import {
    CreateRoutineDTO,
    UpdateProgramDTO,
    CreateBatchRoutinesDTO
} from "@src/routines/dto/dto";

export class RoutineService {
    private dao: RoutinesDAO;

    constructor() {
        this.dao = new RoutinesDAO();
    }

    async createRoutine(inputData: CreateRoutineDTO): Promise<string> {
        return await this.dao.createRoutine(inputData) as unknown as string;
    }

    async createBatchRoutines(inputData: CreateBatchRoutinesDTO): Promise<void> {
        await this.dao.createBatchRoutines(inputData);
    }

    async updateProgram(inputData: UpdateProgramDTO): Promise<void> {
        if (!inputData.goal)
            await this.dao.updateProgram(inputData);
        else {
            // TODO: Send update req to SQS.
        }
    }
}
