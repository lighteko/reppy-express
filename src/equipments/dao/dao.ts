import DB, { Row } from "@lib/infra/postgres";
import SQL from "sql-template-strings";
import { GetFilteredEquipmentsDTO } from "@src/equipments/dto/dto";


export class EquipmentDAO {
    private db: DB;

    constructor() {
        this.db = DB.getInstance();
    }

    async getFilteredEquipments(inputData: GetFilteredEquipmentsDTO): Promise<Row[]> {
        console.log(inputData);
        const query = SQL`
            SELECT eq.equipment_id    AS "equipmentId",
                   eqi.equipment_name AS "equipmentName",
                   eq.equipment_type  AS "equipmentType",
                   eq.equipment_code  AS "equipmentCode",
                   eqi.description    AS description
            FROM repy_equipment_m AS eq
                     LEFT JOIN repy_equipment_i18n_m AS eqi
                               ON eq.equipment_id = eqi.equipment_id
                                   AND eqi.locale = ${inputData.locale}
            WHERE NOT (
                eq.equipment_type = ANY (
                    COALESCE(${inputData.types_to_exclude}::equipment_type_enum[], ARRAY []::equipment_type_enum[])
                    )
                );
        `;

        const cursor = this.db.cursor();
        return await cursor.fetchAll(query);
    }
}
