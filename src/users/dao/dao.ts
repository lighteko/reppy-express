import DB, { Row } from "@lib/infra/postgres";
import SQL from "sql-template-strings";
import { GetUserEquipmentCodesDTO, GetUserExerciseCodesDTO, UpdateUserEquipmentsDTO } from "@src/users/dto/dto";

export class UserDAO {
    private db: DB;

    constructor() {
        this.db = DB.getInstance();
    }

    async updateUserEquipments(inputData: UpdateUserEquipmentsDTO) {
        const equipments = JSON.stringify({
            addedEquipmentIds: inputData.addedEquipmentIds,
            removedEquipmentIds: inputData.removedEquipmentIds
        });
        const query = SQL`
            WITH remove_ids AS (SELECT x::uuid AS equipment_id
                                FROM jsonb_array_elements_text(${equipments}::jsonb -> 'removedEquipmentIds') x),
                 deleted AS (
                     DELETE FROM repy_user_equipment_map m
                         USING remove_ids r
                         WHERE m.user_id = ${inputData.userId}
                             AND m.equipment_id = r.equipment_id
                         RETURNING m.equipment_id),
                 add_ids AS (SELECT DISTINCT x::uuid AS equipment_id
                             FROM jsonb_array_elements_text(${equipments}::jsonb -> 'addedEquipmentIds') x),
                 inserted AS (
                     INSERT INTO repy_user_equipment_map (user_id, equipment_id)
                         SELECT ${inputData.userId}, a.equipment_id
                         FROM add_ids a
                         ON CONFLICT (user_id, equipment_id) DO NOTHING
                         RETURNING equipment_id)
            SELECT 'deleted' AS op, equipment_id
            FROM deleted
            UNION ALL
            SELECT 'inserted' AS op, equipment_id
            FROM inserted;
        `;

        const cursor = this.db.cursor();
        await cursor.execute(query);
    }

    async getUserEquipmentCodes(inputData: GetUserEquipmentCodesDTO) {
        const query = SQL`
            SELECT e.equipment_code
            FROM repy_equipment_m AS e
                     JOIN repy_user_equipment_map AS m
                          ON e.equipment_id = m.equipment_id
            WHERE m.user_id = ${inputData.userId};
        `;

        const cursor = this.db.cursor();
        return await cursor.fetchAll(query);
    }

    async getUserExerciseCodes(inputData: GetUserExerciseCodesDTO) {
        const query = SQL`
            SELECT ex.exercise_code
            FROM repy_exercise_m AS ex
                     JOIN repy_equipment_m AS eq
                          ON ex.equipment_id = eq.equipment_id
                     JOIN repy_user_equipment_map AS uem
                          ON eq.equipment_id = uem.equipment_id
            WHERE uem.user_id = ${inputData.userId};
        `;

        const cursor = this.db.cursor();
        return await cursor.fetchAll(query);
    }
}
