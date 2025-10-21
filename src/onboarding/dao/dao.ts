import DB, { Row } from "@lib/infra/postgres";
import {
    CreateProgramDTO,
    CreateUserBioDTO,
    CreateUserEquipmentsDTO,
    CreateUserPreferencesDTO
} from "@src/onboarding/dto/dto";
import SQL from "sql-template-strings";

export class OnboardingDAO {
    db: DB;

    constructor() {
        this.db = DB.getInstance();
    }


    async createUserBio(inputData: CreateUserBioDTO): Promise<void> {
        const query = SQL`
            INSERT INTO repy_user_bio_l
                (user_id, height, sex, body_weight, birthdate)
            VALUES (${inputData.userId},
                    ${inputData.height},
                    ${inputData.sex},
                    ${inputData.bodyWeight},
                    ${inputData.birthdate});
        `;

        const cursor = this.db.cursor();
        await cursor.execute(query);
    }

    async createUserPreferences(inputData: CreateUserPreferencesDTO): Promise<void> {
        const query = SQL`
            INSERT INTO repy_user_pref_l
                (user_id, unit_system, notif_reminder, locale)
            VALUES (${inputData.userId},
                    ${inputData.unitSystem},
                    ${inputData.notifReminder},
                    ${inputData.locale});
        `;

        const cursor = this.db.cursor();
        await cursor.execute(query);
    }

    async createProgram(inputData: CreateProgramDTO): Promise<Row> {
        const query = SQL`
            INSERT INTO repy_program_l
                (user_id, program_name, experience, start_date, goal_date, goal)
            VALUES
                (${inputData.userId},
                ${inputData.programName},
                ${inputData.experience}
                ${inputData.startDate},
                ${inputData.goalDate},
                ${inputData.goal})
            RETURNING program_id;
        `;

        const cursor = this.db.cursor();
        return await cursor.fetchOne(query);
    }

    async createUserEquipments(inputData: CreateUserEquipmentsDTO): Promise<void> {
        const equipmentIds = JSON.stringify({ equipmentIds: inputData.equipmentIds });
        const query = SQL`
            INSERT INTO repy_user_equipments_map
                (user_id, equipment_id)
            SELECT ${inputData.userId},
                   equipment_id::uuid
            FROM jsonb_array_elements(${equipmentIds}::jsonb -> 'equipmentIds') equipment_id;
        `;

        const cursor = this.db.cursor();
        await cursor.execute(query);
    }
}
