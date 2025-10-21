import DB, { Row } from "@lib/infra/postgres";
import SQL from "sql-template-strings";
import { v4 as uuid4 } from "uuid";
import { LoginPayloadDTO, SignUpWithOAuthDTO, SignUpWithPasswordDTO, TokenPayloadDTO } from "@src/auth/dto/dto";

export class AuthDAO {
    private db: DB;

    constructor() {
        this.db = DB.getInstance();
    }

    async createUserWithPassword(inputData: SignUpWithPasswordDTO): Promise<void> {
        const userId = uuid4();
        const query = SQL`
            INSERT INTO REPY_USER_L
                (USER_ID, USERNAME, EMAIL, PASSWORD)
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
            INSERT INTO REPY_USER_L
                (USER_ID, USERNAME, EMAIL, PROVIDER, SUB)
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
                   EXTRACT(YEAR FROM AGE(CURRENT_DATE, bio.birthdate)) AS age
            FROM repy_user_l u
                     JOIN repy_user_bio_l bio
                          ON u.user_id = bio.user_id
            WHERE u.email = ${email};
        `;

        const cursor = this.db.cursor();
        return await cursor.fetchOne(query);
    }

    async getUserIdAndPwdByEmail(inputData: LoginPayloadDTO): Promise<Row> {
        const query = SQL`
            SELECT u.user_id  AS "userId",
                   u.password AS password
            FROM repy_user_l
            WHERE u.email = ${inputData.email};
        `;

        const cursor = this.db.cursor();
        return await cursor.fetchOne(query);
    }

    async saveRefreshToken(userId: string, refreshToken: Buffer): Promise<void> {
        const query = SQL`
            INSERT INTO repy_refresh_token_l (
                user_id,
--                 jti,
                token_hash,        -- 평문 토큰은 절대 저장 금지. 서버에서 HMAC-SHA256(pepper)로 해시한 값
--                 token_version,     -- 유저 레벨 무효화 버전(발급 시점의 값)
                expires_at
--                 ip,
--                 user_agent,
--                 last_used_at
            ) VALUES (
                ${userId},          -- user_id
--                 $2::uuid,          -- jti
                ${refreshToken},
--                 $4::int,           -- token_version (예: repy_user_l 쪽 current_version을 읽어와서 넣음)
                NOW()    -- expires_at
--                 $6::inet,          -- ip
--                 $7::text,          -- user_agent
--                 NOW()
            );  
        `;
    }
}
