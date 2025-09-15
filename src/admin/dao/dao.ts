import DB, { Row } from "@lib/infra/postgres";
import { CreateEquipmentDTO, CreateExerciseDTO, UpdateEquipmentDTO } from "@src/admin/dto/dto";
import SQL from "sql-template-strings";
import { v4 as uuid4 } from "uuid";

export class AdminDAO {
    db: DB;

    constructor() {
        this.db = DB.getInstance();
    }

    async getEquipments(locale: string): Promise<Row[]> {
        const query = SQL`
            SELECT eq.equipment_id     AS "equipmentId",
                   i18n.equipment_name AS "equipmentName",
                   eq.equipment_group  AS "equipmentGroup",
                   i18n.locale         AS "locale",
                   i18n.description    AS "description"
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
                   i18n.exercise_name     AS "exerciseName",
                   eq_i18n.equipment_name AS "equipmentName",
                   i18n.locale            AS "locale",
                   i18n.target_muscles    AS "targetMuscles",
                   i18n.instruction       AS "instruction",
                   exc.exercise_type      AS "exerciseType",
                   exc.difficulty_lvl     AS "difficultyLvl"
            FROM repy_exercise_m AS exc
                     LEFT JOIN repy_exercise_i18n_m AS i18n
                               ON i18n.exercise_id = exc.exercise_id
                                   AND i18n.locale = ${locale}
                     LEFT JOIN repy_equipment_i18n_m AS eq_i18n
                               ON eq_i18n.equipment_id = exc.equipment_id
                                   AND eq_i18n.locale = ${locale};
        `;

        const cursor = this.db.cursor();
        return await cursor.fetchAll(query);
    }

    async createEquipment(inputData: CreateEquipmentDTO): Promise<void> {
        const query = SQL`
            WITH equipment AS (
                INSERT INTO repy_equipment_m (equipment_id, equipment_group)
                    VALUES (${uuid4()}, ${inputData.equipmentGroup})
                    RETURNING equipment_id)
            INSERT
            INTO repy_equipment_i18n_m
                (equipment_i18n_id, locale, equipment_id, equipment_name, description)
            SELECT ${uuid4()},
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
                    VALUES (${uuid4()}, ${inputData.equipmentId}, ${inputData.exerciseType}, ${inputData.difficultyLvl})
                    RETURNING exercise_id)
            INSERT
            INTO repy_exercise_i18n_m
            (exercise_i18n_id, locale, exercise_id, exercise_name, target_muscles, instruction)
            SELECT ${uuid4()},
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

    async updateEquipment(inputData: UpdateEquipmentDTO): Promise<void> {
        const query = SQL`
            UPDATE repy_equipment_m
        `;
    }
}
