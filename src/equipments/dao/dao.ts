import DB, { Row } from "@lib/infra/postgres";
import SQL from "sql-template-strings";
import { GetEquipmentPresetsDTO, GetFilteredEquipmentsDTO } from "@src/equipments/dto/dto";


export class EquipmentDAO {
    private db: DB;

    constructor() {
        this.db = DB.getInstance();
    }

    async getFilteredEquipments(inputData: GetFilteredEquipmentsDTO): Promise<Row[]> {
        const query = SQL`
            SELECT eq.equipment_id    AS "equipmentId",
                   eqi.equipment_name AS "equipmentName",
                   eq.equipment_type  AS "equipmentType",
                   eq.equipment_code  AS "equipmentCode",
                   eqi.description    AS description
            FROM repy_equipment_m AS eq
                     JOIN repy_equipment_i18n_m AS eqi
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

    async getEquipmentPresets(inputData: GetEquipmentPresetsDTO): Promise<Row[]> {
        const query = SQL`
            WITH mapped AS (SELECT m.preset_id,

                                   eq.equipment_id    AS equipment_id,
                                   eqi.equipment_name AS equipment_name,
                                   eq.equipment_type  AS equipment_type,
                                   eq.equipment_code  AS equipment_code,
                                   eqi.description    AS description
                            FROM repy_equipment_preset_map AS m
                                     JOIN repy_equipment_m AS eq
                                          ON eq.equipment_id = m.equipment_id
                                     JOIN repy_equipment_i18n_m AS eqi
                                          ON eq.equipment_id = eqi.equipment_id
                                              AND eqi.locale = ${inputData.locale}),
                 agg AS (SELECT preset_id,
                                jsonb_agg(
                                        jsonb_build_object(
                                                'equipmentId', equipment_id,
                                                'equipmentName', equipment_name,
                                                'equipmentType', equipment_type,
                                                'equipmentCode', equipment_code,
                                                'description', description
                                        )
                                        ORDER BY equipment_id
                                ) AS equipments
                         FROM mapped
                         GROUP BY preset_id)
            SELECT p.preset_code                       AS "presetCode",
                   COALESCE(a.equipments, '[]'::jsonb) AS "equipments"
            FROM repy_equipment_preset_m AS p
                     LEFT JOIN agg AS a
                               ON a.preset_id = p.preset_id
            ORDER BY p.preset_code;
        `;

        const cursor = this.db.cursor();
        return await cursor.fetchAll(query);
    }
}
