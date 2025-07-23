import DB from "@lib/infra/postgres";
import { CreateEquipmentDTO, CreateExerciseDTO } from "@src/admin/dto/dto";
import SQL from "sql-template-strings";
import { v4 as uuid4 } from "uuid";

export class AdminDAO {
    db: DB;

    constructor() {
        this.db = DB.getInstance();
    }

    async createEquipment(inputData: CreateEquipmentDTO): Promise<void> {
        const query = SQL`
            WITH equipment AS (
                INSERT INTO repy_equipment_m (equipment_id, equipment_group)
                VALUES (${uuid4()}, ${inputData.equipmentGroup})
                RETURNING equipment_id
            )
            INSERT INTO repy_equipment_i18n_m 
                (equipment_i18n_id, locale, equipment_id, equipment_name, description)
            SELECT 
                ${uuid4()},
                ${inputData.locale},
                e.equipment_id,
                ${inputData.equipmentName},
                ${inputData.description}
            FROM equipment e;
        `;

        const cursor = this.db.cursor();
        await cursor.execute(query);
    }

    async createExercise(inputData: CreateExerciseDTO): Promise<void> {
        const query = SQL`
            WITH exercise AS (
                INSERT INTO repy_exercise_m (exercise_id, equipment_id, exercise_type, difficulty_lvl)
                VALUES (${uuid4()}, ${inputData.equipmentId}, ${inputData.exerciseType}, ${inputData.difficulty_lvl})
                RETURNING exercise_id
            )
            INSERT INTO repy_exercise_i18n_m
                (exercise_i18n_id, locale, exercise_id, exercise_name, target_muscles, instruction) 
            SELECT
                ${uuid4()},
                ${inputData.locale},
                e.exercise_id,
                ${inputData.exerciseName},
                ${inputData.targetMuscles},
                ${inputData.instruction}
            FROM exercise e;
        `;

        const cursor = this.db.cursor();
        await cursor.execute(query);
    }
}
