import DB from "@lib/infra/postgres";
import {
    OnboardUserDTO
} from "@src/onboarding/dto/dto";
import SQL from "sql-template-strings";

export class OnboardingDAO {
    db: DB;

    constructor() {
        this.db = DB.getInstance();
    }

    async onboardUser(inputData: OnboardUserDTO) {
        const query = SQL`
            WITH bio AS (
                INSERT INTO repy_user_bio_l
                    (user_id, height, sex, body_weight, birthdate)
                    VALUES (${inputData.userId},
                            ${inputData.height},
                            ${inputData.sex},
                            ${inputData.bodyWeight},
                            ${inputData.birthdate})
                    ON CONFLICT (user_id) DO UPDATE
                        SET height = EXCLUDED.height,
                            sex = EXCLUDED.sex,
                            body_weight = EXCLUDED.body_weight,
                            birthdate = EXCLUDED.birthdate
                    RETURNING user_id),
                 pref AS (
                     INSERT INTO repy_user_pref_l
                         (user_id, unit_system, notif_reminder, locale)
                         VALUES (${inputData.userId},
                                 ${inputData.unitSystem},
                                 false,
                                 ${inputData.locale})
                         ON CONFLICT (user_id) DO UPDATE
                             SET unit_system = EXCLUDED.unit_system,
                                 notif_reminder = EXCLUDED.notif_reminder,
                                 locale = EXCLUDED.locale
                         RETURNING user_id),
                 onboard AS (
                     UPDATE repy_user_l
                         SET is_onboarded = TRUE
                         WHERE user_id = ${inputData.userId}
                             AND is_onboarded IS DISTINCT FROM TRUE
                         RETURNING user_id)
            INSERT
            INTO repy_user_equipments_map
                (user_id, equipment_id)
            SELECT b.user_id,
                   e.equipment_id
            FROM bio b
                     JOIN pref p
                          ON p.user_id = b.user_id
                     LEFT JOIN onboard o
                               ON o.user_id = b.user_id
                     JOIN repy_equipment_preset_map m
                          ON m.preset_id = ${inputData.presetId}
                     JOIN repy_equipment_m e
                          ON e.equipment_id = m.equipment_id
            ON CONFLICT (user_id, equipment_id) DO NOTHING;
        `;

        const cursor = this.db.cursor();
        await cursor.execute(query);
    }
}
