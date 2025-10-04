import DB, { Row } from "@lib/infra/postgres";
import { 
    CreateMuscleDTO, 
    CreateEquipmentDTO, 
    CreateExerciseDTO, 
    UpdateMuscleDTO,
    UpdateEquipmentDTO,
    UpdateExerciseDTO
} from "@src/admin/dto/dto";
import SQL from "sql-template-strings";
import { v4 as uuid4 } from "uuid";

export class AdminDAO {
    db: DB;

    constructor() {
        this.db = DB.getInstance();
    }

    async getMuscles(locale: string): Promise<Row[]> {
        const query = SQL`
            SELECT m.muscle_id      AS "muscleId",
                   i18n.muscle_name AS "muscleName",
                   i18n.locale      AS "locale"
            FROM repy_muscle_m m
                LEFT JOIN repy_muscle_i18n_m i18n
                    ON m.muscle_id = i18n.muscle_id
                    AND i18n.locale = ${locale};
        `;

        const cursor = this.db.cursor();
        return await cursor.fetchAll(query);
    }

    async getEquipments(locale: string): Promise<Row[]> {
        const query = SQL`
            SELECT eq.equipment_id     AS "equipmentId",
                   i18n.equipment_name AS "equipmentName",
                   i18n.instruction    AS "instruction",
                   i18n.locale         AS "locale"
            FROM repy_equipment_m eq
                LEFT JOIN repy_equipment_i18n_m i18n
                    ON eq.equipment_id = i18n.equipment_id
                    AND i18n.locale = ${locale};
        `;

        const cursor = this.db.cursor();
        return await cursor.fetchAll(query);
    }

    async getExercises(locale: string): Promise<Row[]> {
        const query = SQL`
            SELECT exc.exercise_id        AS "exerciseId",
                   exc.equipment_id       AS "equipmentId",
                   exc.main_muscle_id     AS "mainMuscleId",
                   exc.aux_muscle_id      AS "auxMuscleId",
                   exc.difficulty_level   AS "difficultyLevel",
                   i18n.exercise_name     AS "exerciseName",
                   i18n.instruction       AS "instruction",
                   i18n.locale            AS "locale"
            FROM repy_exercise_m AS exc
                LEFT JOIN repy_exercise_i18n_m AS i18n
                    ON i18n.exercise_id = exc.exercise_id
                    AND i18n.locale = ${locale};
        `;

        const cursor = this.db.cursor();
        return await cursor.fetchAll(query);
    }

    async createMuscle(inputData: CreateMuscleDTO): Promise<void> {
        const muscleId = uuid4();
        const query = SQL`
            WITH muscle AS (
                INSERT INTO repy_muscle_m (muscle_id)
                    VALUES (${muscleId})
                    RETURNING muscle_id)
            INSERT INTO repy_muscle_i18n_m
                (muscle_i18n_id, locale, muscle_id, muscle_name)
            SELECT ${uuid4()},
                   ${inputData.locale},
                   m.muscle_id,
                   ${inputData.muscleName}
            FROM muscle m;
        `;

        const cursor = this.db.cursor();
        await cursor.execute(query);
    }

    async createEquipment(inputData: CreateEquipmentDTO): Promise<void> {
        const equipmentId = uuid4();
        const query = SQL`
            WITH equipment AS (
                INSERT INTO repy_equipment_m (equipment_id)
                    VALUES (${equipmentId})
                    RETURNING equipment_id)
            INSERT INTO repy_equipment_i18n_m
                (equipment_i18n_id, locale, equipment_id, equipment_name, instruction)
            SELECT ${uuid4()},
                   ${inputData.locale},
                   e.equipment_id,
                   ${inputData.equipmentName},
                   ${inputData.instruction}
            FROM equipment e;
        `;

        const cursor = this.db.cursor();
        await cursor.execute(query);
    }

    async createExercise(inputData: CreateExerciseDTO): Promise<void> {
        const exerciseId = uuid4();
        const query = SQL`
            WITH exercise AS (
                INSERT INTO repy_exercise_m (exercise_id, equipment_id, main_muscle_id, aux_muscle_id, difficulty_level)
                    VALUES (${exerciseId}, ${inputData.equipmentId}, ${inputData.mainMuscleId}, ${inputData.auxMuscleId ?? null}, ${inputData.difficultyLevel})
                    RETURNING exercise_id)
            INSERT INTO repy_exercise_i18n_m
                (exercise_i18n_id, locale, exercise_id, exercise_name, instruction)
            SELECT ${uuid4()},
                   ${inputData.locale},
                   e.exercise_id,
                   ${inputData.exerciseName},
                   ${inputData.instruction}
            FROM exercise e;
        `;

        const cursor = this.db.cursor();
        await cursor.execute(query);
    }
}
