import DB, { Row } from "@lib/infra/postgres";
import SQL from "sql-template-strings";
import { v4 as uuid4 } from "uuid";
import { LoginPayloadDTO, SignUpWithOAuthDTO, SignUpWithPasswordDTO } from "@src/auth/dto/dto";

export class AuthDAO {
    private db: DB;

    constructor() {
        this.db = DB.getInstance();
    }

    async createUserWithPassword(inputData: SignUpWithPasswordDTO): Promise<void> {
        const userId = uuid4();
        const query = SQL`
            INSERT INTO REPY_USER_L
                (user_id, username, email, password)
            VALUES (${userId},
                    ${inputData.username},
                    ${inputData.email},
                    ${inputData.password});
        `;

        const cursor = this.db.cursor();
        await cursor.execute(query);
    }

    async createUserWithOAuth(inputData: SignUpWithOAuthDTO): Promise<void> {
        const userId = uuid4();
        const query = SQL`
            INSERT INTO repy_user_l
                (user_id, username, email, provider, sub)
            VALUES (${userId},
                    ${inputData.username},
                    ${inputData.email},
                    ${inputData.provider},
                    ${inputData.sub});
        `;

        const cursor = this.db.cursor();
        await cursor.execute(query);
    }

    async getUserInfoByEmail(email: string): Promise<Row> {
        const query = SQL`
            SELECT u.user_id                                           AS "userId",
                   u.username                                          AS username,
                   u.email                                             AS email,
                   u.password                                          AS password,
                   bio.sex                                             AS sex,
                   bio.height                                          AS height,
                   bio.body_weight                                     AS "bodyWeight",
                   bio.birthdate                                       AS birthdate,
                   EXTRACT(YEAR FROM AGE(CURRENT_DATE, bio.birthdate)) AS age,
                   pref.unit_system                                    AS "unitSystem",
                   pref.notif_reminder                                 AS "notifReminder",
                   pref.locale                                         AS "locale"
            FROM repy_user_l u
                     LEFT JOIN repy_user_bio_l bio
                               ON u.user_id = bio.user_id
                     LEFT JOIN repy_user_pref_l pref
                               ON u.user_id = pref.user_id
            WHERE u.email = ${email};
        `;

        const cursor = this.db.cursor();
        return await cursor.fetchOne(query);
    }

    async getUserIdAndPwdByEmail(inputData: LoginPayloadDTO): Promise<Row> {
        const query = SQL`
            SELECT user_id  AS "userId",
                   password AS password
            FROM repy_user_l
            WHERE email = ${inputData.email};
        `;

        const cursor = this.db.cursor();
        return await cursor.fetchOne(query);
    }

    async upsertRefreshToken(userId: string, tokenHash: Buffer, expiresAt: Date): Promise<void> {
        const query = SQL`
            WITH lock_user AS (SELECT 1
                               FROM repy_user_l
                               WHERE user_id = ${userId}
                                   FOR UPDATE),
                 upd AS (
                     UPDATE repy_refresh_token_l
                         SET revoked_at = NOW()
                         WHERE user_id = ${userId}
                             AND revoked_at IS NULL
                         RETURNING 1)
            INSERT
            INTO repy_refresh_token_l (user_id, token_hash, expires_at, last_used_at)
            VALUES (${userId},
                    ${tokenHash},
                    ${expiresAt},
                    NOW());
        `;

        const cursor = this.db.cursor();
        await cursor.execute(query);
    }

    async revokeRefreshToken(tokenHash: Buffer) {
        const query = SQL`
            UPDATE repy_refresh_token_l
            SET revoked_at   = NOW(),
                last_used_at = NOW()
            WHERE token_hash = ${tokenHash}
              AND revoked_at IS NULL;
        `;

        const cursor = this.db.cursor();
        await cursor.execute(query);
    }
}
