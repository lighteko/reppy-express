import DB from "@lib/infra/postgres";
import { CreateRoutineDTO, UpdateRoutineDTO, UpdateProgramDTO, UpdateScheduleDTO } from "@src/routines/dto/dto";
import SQL from "sql-template-strings";
import { v4 as uuid4 } from "uuid";

export class RoutinesDAO {
    private db: DB;

    constructor() {
        this.db = DB.getInstance();
    }

    async createRoutine(inputData: CreateRoutineDTO): Promise<string> {
        const routineId = uuid4();
        const routineQuery = SQL`
            INSERT INTO repy_routine_l
                (routine_id, schedule_id, user_id, routine_name)
            VALUES (${routineId},
                    ${inputData.scheduleId},
                    ${inputData.userId},
                    ${inputData.routineName});
        `;

        const mapRows = inputData.plans.map((plan) => SQL`
            (
                ${uuid4()},             -- map_id
                ${routineId},           -- routine_id
                ${plan.planId},         -- plan_id
                ${plan.execOrder}       -- exec_order
            )
        `);

        const mapValues = SQL``;
        mapRows.forEach((row, index) => {
            if (index > 0) mapValues.append(SQL`, `);
            mapValues.append(SQL`${row}`);
        });

        const mapQuery = SQL`
            INSERT INTO repy_routine_plan_map
                (map_id, routine_id, plan_id, exec_order)
            VALUES ${mapValues};
        `;

        // Create or update version
        const versionDisableQuery = SQL`
            UPDATE repy_version_l
            SET is_current = FALSE
            WHERE user_id = ${inputData.userId};
        `;

        const versionId = uuid4();
        const versionQuery = SQL`
            INSERT INTO repy_version_l (version_id, user_id, is_current)
            VALUES (${versionId}, ${inputData.userId}, TRUE);
        `;

        const versionRoutineMapQuery = SQL`
            INSERT INTO repy_version_routine_map (version_id, routine_id)
            VALUES (${versionId}, ${routineId});
        `;

        const cursor = this.db.cursor();
        await cursor.execute(routineQuery, mapQuery, versionDisableQuery, versionQuery, versionRoutineMapQuery);
        return routineId;
    }

    async updateRoutine(inputData: UpdateRoutineDTO): Promise<void> {
        // Update routine name if provided
        if (inputData.routineName) {
            const updateQuery = SQL`
                UPDATE repy_routine_l
                SET routine_name = ${inputData.routineName}
                WHERE routine_id = ${inputData.routineId}
                  AND user_id = ${inputData.userId};
            `;
            const cursor = this.db.cursor();
            await cursor.execute(updateQuery);
        }

        // Update plans if provided
        if (inputData.plans) {
            const deleteQuery = SQL`
                DELETE FROM repy_routine_plan_map
                WHERE routine_id = ${inputData.routineId};
            `;

            const mapRows = inputData.plans.map((plan) => SQL`
                (
                    ${uuid4()},             -- map_id
                    ${inputData.routineId}, -- routine_id
                    ${plan.planId},         -- plan_id
                    ${plan.execOrder}       -- exec_order
                )
            `);

            const mapValues = SQL``;
            mapRows.forEach((row, index) => {
                if (index > 0) mapValues.append(SQL`, `);
                mapValues.append(SQL`${row}`);
            });

            const insertQuery = SQL`
                INSERT INTO repy_routine_plan_map
                    (map_id, routine_id, plan_id, exec_order)
                VALUES ${mapValues};
            `;

            const cursor = this.db.cursor();
            await cursor.execute(deleteQuery, insertQuery);
        }
    }

    async updateProgram(inputData: UpdateProgramDTO): Promise<void> {
        const updates: SQL[] = [];
        
        if (inputData.programName) updates.push(SQL`program_name = ${inputData.programName}`);
        if (inputData.goalDate) updates.push(SQL`goal_date = ${inputData.goalDate}`);
        if (inputData.goal) updates.push(SQL`goal = ${inputData.goal}`);

        if (updates.length === 0) return;

        const query = SQL`UPDATE repy_program_l SET `;
        updates.forEach((update, index) => {
            if (index > 0) query.append(SQL`, `);
            query.append(update);
        });
        query.append(SQL` WHERE program_id = ${inputData.programId} AND user_id = ${inputData.userId};`);

        const cursor = this.db.cursor();
        await cursor.execute(query);
    }

    async updateSchedule(inputData: UpdateScheduleDTO): Promise<void> {
        // Delete existing schedules for the user
        const deleteQuery = SQL`
            DELETE FROM repy_schedule_l
            WHERE user_id = ${inputData.userId};
        `;

        const rows = inputData.activeDays.map(d => SQL`
          (
            ${uuid4()},                  -- schedule_id
            ${inputData.userId},         -- user_id
            ${d.weekday}                 -- wkday
          )
        `);

        const values = SQL``;
        rows.forEach((row, index) => {
            if (index > 0) values.append(SQL`, `);
            values.append(SQL`${row}`);
        });

        const scheduleQuery = SQL`
            INSERT INTO repy_schedule_l
                (schedule_id, user_id, wkday)
            VALUES ${values};
        `;

        const cursor = this.db.cursor();
        await cursor.execute(deleteQuery, scheduleQuery);
    }
}
