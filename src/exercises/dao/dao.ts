import DB from "@lib/infra/postgres";
import { CreateExercisePlanDTO, CreateExerciseSetDTO, CreateSetRecordDTO } from "@src/exercises/dto/dto";
import SQL from "sql-template-strings";
import { v4 as uuid4 } from "uuid";

export class ExerciseDAO {
    db: DB;

    constructor() {
        this.db = DB.getInstance();
    }

    async createExercisePlan(inputData: CreateExercisePlanDTO): Promise<string> {
        const planId = uuid4();
        const query = SQL`
            INSERT INTO repy_exercise_plan_l
                (plan_id, exercise_id, memo, description)
            VALUES (${planId}, 
                    ${inputData.exerciseId},
                    ${inputData.memo ?? null}, 
                    ${inputData.description});
        `;

        const cursor = this.db.cursor();
        await cursor.execute(query);

        return planId;
    }

    async createExerciseSet(inputData: CreateExerciseSetDTO): Promise<string> {
        const setId = uuid4();
        const query = SQL`
            INSERT INTO repy_exercise_set_l 
                (set_id, exercise_id, plan_id, set_type_id, set_order, reps, weight, rest_time, duration) 
            VALUES (${setId}, 
                    ${inputData.exerciseId}, 
                    ${inputData.planId},
                    ${inputData.setTypeId},
                    ${inputData.setOrder},
                    ${inputData.reps ?? null},
                    ${inputData.weight ?? null},
                    ${inputData.restTime},
                    ${inputData.duration ?? null});
        `;

        const cursor = this.db.cursor();
        await cursor.execute(query);
        
        return setId;
    }

    async createSetRecord(inputData: CreateSetRecordDTO): Promise<string> {
        const recordId = uuid4();
        const query = SQL`
            INSERT INTO repy_set_record_l 
                (record_id, set_id, actual_reps, actual_weight, actual_rest_time, actual_duration, was_completed) 
            VALUES (${recordId}, 
                    ${inputData.setId}, 
                    ${inputData.actualReps ?? null},
                    ${inputData.actualWeight ?? null},
                    ${inputData.actualRestTime},
                    ${inputData.actualDuration ?? null},
                    ${inputData.wasCompleted});
        `;

        const cursor = this.db.cursor();
        await cursor.execute(query);
        
        return recordId;
    }
}
