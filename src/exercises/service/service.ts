import { ExerciseDAO } from "@src/exercises/dao/dao";
import { CreateExerciseRecordDTO, CreateSetStrategyDTO } from "@src/exercises/dto/dto";

export class ExerciseService {
    dao: ExerciseDAO;

    constructor() {
        this.dao = new ExerciseDAO();
    }

    async createSetStrategy(inputData: CreateSetStrategyDTO): Promise<void> {
        await this.dao.createSetStrategy(inputData);
    }

    async createExerciseRecord(inputData: CreateExerciseRecordDTO): Promise<void> {
        await this.dao.createExerciseRecord(inputData);
        // TODO: Also need to send a request to the FastAPI server to store the record to Qdrant.
    }
}
