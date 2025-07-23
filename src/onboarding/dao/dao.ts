import DB from "@lib/infra/postgres";
import {
    CreatePlanDTO,
    CreateUserBioDTO,
    CreateUserEquipmentsDTO,
    CreateUserPreferencesDTO
} from "@src/onboarding/dto/dto";
import SQL from "sql-template-strings";
import { v4 as uuid4 } from "uuid";

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

    async createPlan(inputData: CreatePlanDTO): Promise<string> {
        const planId = uuid4();
        const planQuery = SQL`
            INSERT INTO repy_plan_l
                (plan_id, user_id, start_date, goal_date, goal)
            VALUES (${planId},
                    ${inputData.userId},
                    ${inputData.startDate},
                    ${inputData.goalDate},
                    ${inputData.goal});
        `;

        const versionId = uuid4();
        const versionQuery = SQL`
            INSERT INTO repy_flow_version_l 
                (version_id, user_id, plan_id, is_current)
            VALUES (${versionId}, ${planId}, ${inputData.userId}, TRUE);
        `;

        const scheduleQuery = SQL`INSERT `;
        scheduleQuery.append(SQL`INTO repy_schedule_l (schedule_id, user_id, version_id, 
                             wkday, start_time, max_duration) VALUES `);

        inputData.activeDays.forEach((dailySchedule, index) => {
            if (index > 0) scheduleQuery.append(SQL`, `);
            const scheduleId = uuid4();
            scheduleQuery.append(SQL`(
                ${scheduleId}, 
                ${inputData.userId},
                ${versionId},
                ${dailySchedule.weekday}, 
                ${dailySchedule.startTime}, 
                ${dailySchedule.maxDuration})`);
        });

        const cursor = this.db.cursor();
        await cursor.execute(planQuery, versionQuery, scheduleQuery);
        return planId;
    }

    async createUserEquipments(inputData: CreateUserEquipmentsDTO): Promise<void> {
        const query = SQL`INSERT `;
        query.append(SQL`INTO repy_user_equipment_map (user_id, equipment_id) VALUES `);

        inputData.equipmentIds.forEach((equipmentId, index) => {
            if (index > 0) query.append(SQL`,`);
            query.append(SQL`(${inputData.userId}, ${equipmentId})`);
        });

        query.append(SQL`;`);
        const cursor = this.db.cursor();
        await cursor.execute(query);
    }
}
