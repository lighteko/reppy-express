import { Express } from "express";
import { Pool, PoolClient, QueryResult } from "pg";
import { format as sqlFormat } from "sql-formatter";
import initLogger from "@src/logger";
import { SQLStatement } from "sql-template-strings";

const logger = initLogger("error");

interface DBConfig {
    PG_HOST: string;
    PG_PORT: number;
    PG_USER: string;
    PG_PASSWORD: string;
    PG_DB: string;
    PG_POOL_SIZE: number;
}

class DB {
    private static instance: DB | null = null;
    private static config: DBConfig = {
        PG_HOST: "127.0.0.1",
        PG_PORT: 5432,
        PG_USER: "postgres",
        PG_PASSWORD: "postgres",
        PG_DB: "template",
        PG_POOL_SIZE: 10,
    };
    private static pool: Pool | null = null;
    private static initialized = false;

    public static initApp(app: Express): void {
        const {
            PG_HOST,
            PG_PORT,
            PG_USER,
            PG_PASSWORD,
            PG_DB,
            PG_POOL_SIZE,
        } = app.get("config");

        DB.config = {
            PG_HOST,
            PG_PORT,
            PG_USER,
            PG_PASSWORD,
            PG_DB,
            PG_POOL_SIZE,
        };

        if (!DB.pool) {
            DB.pool = new Pool({
                host: DB.config.PG_HOST,
                port: DB.config.PG_PORT,
                user: DB.config.PG_USER,
                password: DB.config.PG_PASSWORD,
                database: DB.config.PG_DB,
                max: DB.config.PG_POOL_SIZE,
                idleTimeoutMillis: 30_000,
            });
        }

        DB.initialized = true;
    }

    /** Get Singleton Instance */
    public static getInstance(): DB {
        if (!DB.initialized) {
            throw new Error("DB not initialized. Call DB.initApp() first.");
        }
        if (!DB.instance) {
            DB.instance = new DB();
        }
        return DB.instance;
    }

    private constructor() {
    }

    /* ---------- Internal Method ---------- */

    private async executeQuery<T extends QueryResult>(
        statements: SQLStatement[],
        isTransactionRequired = false,
    ): Promise<T[]> {
        if (!DB.pool) {
            throw new Error("Connection pool not initialized. Call initApp() first.");
        }

        const client: PoolClient = await DB.pool.connect();
        try {
            if (isTransactionRequired) await client.query("BEGIN");

            let response: T[] = [];
            for (const stmt of statements) {
                const result: QueryResult<T> = await client.query(stmt);
                response = response.concat(result.rows);
            }

            if (isTransactionRequired) await client.query("COMMIT");
            return response;
        } catch (err: any) {
            if (isTransactionRequired) await client.query("ROLLBACK");
            logger.error(sqlFormat(statements.map(s => s.text).join(";\n")));
            logger.error(err);
            throw err;
        } finally {
            client.release();
        }
    }

    /* ---------- Cursor ---------- */

    public cursor() {
        return {
            /** Returns multiple rows */
            fetchAll: async (...statements: SQLStatement[]) =>
                this.executeQuery(statements, statements.length > 1),

            /** Returns a single row */
            fetchOne: async (...statements: SQLStatement[]) => {
                const rows = await this.executeQuery(statements, statements.length > 1);
                return rows.length === 1 ? rows[0] : null;
            },

            /** Only for INSERT/UPDATE/DELETE */
            execute: async (...statements: SQLStatement[]) =>
                this.executeQuery(statements, statements.length > 1),
        };
    }
}

export default DB;

export type Row = QueryResult | null;
export type Rows = QueryResult[];
