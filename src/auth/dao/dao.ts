import DB, { Row } from "@lib/infra/postgres";
import SQL from "sql-template-strings";
import { v4 as uuid4 } from "uuid";
import { SignUpWithOAuthDTO, SignUpWithPasswordDTO } from "@src/auth/dto/dto";

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

    async getUserByEmail(email: string): Promise<Row> {
        const query = SQL`
            SELECT 
                u.user_id as "userId",
                u.username as "username",
                u.email as "email",
                u.password as "password",
                bio.sex as "sex",
                bio.height as "height",
                bio.body_weight as "bodyWeight",
                bio.birthdate as "birthdate",
                EXTRACT(YEAR FROM AGE(CURRENT_DATE, bio.birthdate)) AS age
            FROM repy_user_l u
            LEFT JOIN repy_user_bio_l bio ON u.user_id = bio.user_id
            WHERE u.email = ${email}
        `;

        const cursor = this.db.cursor();
        return await cursor.fetchOne(query);
    }
}
