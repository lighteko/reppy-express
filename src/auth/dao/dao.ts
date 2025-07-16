import DB, { Row } from "@lib/infra/postgres";
import SQL from "sql-template-strings";
import { v4 as uuid4 } from "uuid";
import { PersonalInfoDTO, SignUpWithOAuthDTO, SignUpWithPasswordDTO } from "@src/auth/dto/dto";

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

    async updateUserWithPersonalInfo(inputData: PersonalInfoDTO): Promise<void> {
        const query = SQL`
            UPDATE REPY_USER_L
            SET HEIGHT      = ${inputData.height},
                BODY_WEIGHT = ${inputData.bodyWeight},
                BIRTHDATE   = ${inputData.birthDate},
                SEX         = ${inputData.sex}
            WHERE USER_ID = ${inputData.userId};
        `;

        const cursor = this.db.cursor();
        await cursor.execute(query);
    }

    async getUserByEmail(email: string): Promise<Row> {
        const query = SQL`
            SELECT 
                USER_ID as userId,
                USERNAME as username,
                EMAIL as email,
                EXTRACT(YEAR FROM AGE(CURRENT_DATE, BIRTHDATE)) AS age,
                SEX as sex,
                HEIGHT as height,
                BODY_WEIGHT as bodyWeight
            FROM REPY_USER_L
            WHERE EMAIL = ${email}
        `;

        const cursor = this.db.cursor();
        return await cursor.fetchOne(query);
    }
}
