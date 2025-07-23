import { RoutinesDAO } from "@src/routines/dao/dao";
import { RefreshRoutinesDTO, UpdatePlanDTO, UpdateScheduleDTO } from "@src/routines/dto/dto";

export class RoutineService {
    private dao: RoutinesDAO;

    constructor() {
        this.dao = new RoutinesDAO();
    }

    async refreshRoutines(inputData: RefreshRoutinesDTO): Promise<void> {
        await this.dao.refreshRoutines(inputData);
    }

    async updatePlan(inputData: UpdatePlanDTO): Promise<void> {
        await this.dao.updatePlan(inputData);
    }

    async updateSchedule(inputData: UpdateScheduleDTO): Promise<void> {
        await this.dao.updateSchedule(inputData);
    }
}
