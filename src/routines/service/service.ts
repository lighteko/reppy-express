import { RoutinesDAO } from "@src/routines/dao/dao";
import { CreateRoutineDTO, UpdateRoutineDTO, UpdateProgramDTO, UpdateScheduleDTO } from "@src/routines/dto/dto";

export class RoutineService {
    private dao: RoutinesDAO;

    constructor() {
        this.dao = new RoutinesDAO();
    }

    async createRoutine(inputData: CreateRoutineDTO): Promise<string> {
        return await this.dao.createRoutine(inputData);
    }

    async updateRoutine(inputData: UpdateRoutineDTO): Promise<void> {
        await this.dao.updateRoutine(inputData);
    }

    async updateProgram(inputData: UpdateProgramDTO): Promise<void> {
        await this.dao.updateProgram(inputData);
    }

    async updateSchedule(inputData: UpdateScheduleDTO): Promise<void> {
        await this.dao.updateSchedule(inputData);
    }
}
