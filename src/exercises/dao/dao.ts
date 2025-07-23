import DB from "@lib/infra/postgres";
import { CreateExerciseRecordDTO, CreateSetStrategyDTO } from "@src/exercises/dto/dto";
import SQL from "sql-template-strings";
import { v4 as uuid4 } from "uuid";

export class ExerciseDAO {
    db: DB;

    constructor() {
        this.db = DB.getInstance();
    }

    async createSetStrategy(inputData: CreateSetStrategyDTO): Promise<string> {
        const strategyId = uuid4();
        const query = SQL`
            INSERT INTO repy_set_strategy_l
                (strategy_id, user_id, 
                 strategy_name, strategy_type, 
                 base_weight, weight_factor, 
                 base_reps, reps_factor, 
                 base_rest, rest_factor, 
                 duration, description)
            VALUES (${strategyId}, 
                    ${inputData.userId},
                    ${inputData.strategyName}, 
                    ${inputData.strategyType},
                    ${inputData.baseWeight ?? null},
                    ${inputData.weightFactor ?? null},
                    ${inputData.baseReps ?? null},
                    ${inputData.repsFactor ?? null},
                    ${inputData.baseRest ?? null},
                    ${inputData.restFactor ?? null},
                    ${inputData.duration ?? null},
                    ${inputData.description});
        `;

        const cursor = this.db.cursor();
        await cursor.execute(query);

        return strategyId;
    }

    async createExerciseRecord(inputData: CreateExerciseRecordDTO): Promise<string> {
        const recordId = uuid4();
        const query = SQL`
            INSERT INTO repy_exercise_record_l 
                (record_id, user_id, map_id, exercise_type, completed_sets, max_weight, max_duration) 
            VALUES (${recordId}, 
                    ${inputData.userId}, 
                    ${inputData.mapId},
                    ${inputData.exerciseType},
                    ${inputData.completedSets ?? null},
                    ${inputData.maxWeight ?? null},
                    ${inputData.maxDuration ?? null});
        `;

        const cursor = this.db.cursor();
        await cursor.execute(query);
        
        return recordId;
    }
}
