import { ExerciseDAO } from "@src/exercises/dao/dao";
import { CreateExercisePlanDTO, CreateExerciseSetDTO, CreateSetRecordDTO } from "@src/exercises/dto/dto";

export class ExerciseService {
    dao: ExerciseDAO;

    constructor() {
        this.dao = new ExerciseDAO();
    }

    async createExercisePlan(inputData: CreateExercisePlanDTO): Promise<string> {
        return await this.dao.createExercisePlan(inputData);
    }

    async createExerciseSet(inputData: CreateExerciseSetDTO): Promise<string> {
        return await this.dao.createExerciseSet(inputData);
    }

    async createSetRecord(inputData: CreateSetRecordDTO): Promise<string> {
        const recordId = await this.dao.createSetRecord(inputData);
        // TODO: Also need to send a request to the FastAPI server to store the record to Qdrant.
        return recordId;
    }
}
