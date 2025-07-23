import DB from "@lib/infra/postgres";
import { RefreshRoutinesDTO, UpdatePlanDTO, UpdateScheduleDTO } from "@src/routines/dto/dto";
import SQL from "sql-template-strings";
import { v4 as uuid4 } from "uuid";

export class RoutinesDAO {
    private db: DB;

    constructor() {
        this.db = DB.getInstance();
    }

    // This function will be used for both creating & updating the routine, since the routine is dependent to versions.
    async refreshRoutines(inputData: RefreshRoutinesDTO): Promise<void> {
        const versionDisableQuery = SQL`
            UPDATE repy_flow_version_l
            SET is_current = FALSE
            WHERE user_id = ${inputData.userId};
        `;

        const versionId = uuid4();
        const versionQuery = SQL`
            INSERT INTO repy_flow_version_l (version_id, user_id, plan_id, is_current)
                SELECT 
                    ${versionId},
                    p.user_id,
                    p.plan_id,
                    TRUE
                FROM repy_plan_l p
                WHERE p.user_id = ${inputData.userId}
            ORDER BY p.created_at DESC
            LIMIT 1;
        `;

        const rows = inputData.routines.map((routine) => SQL`
            (
                ${uuid4()},                 -- routine_id
                ${versionId},               -- version_id
                ${routine.scheduleId},      -- schedule_id
                ${routine.duration},        -- duration
                ${routine.setBreak},        -- set_break
                ${routine.executionOrder}   -- execution_order
            )
        `);

        const values = SQL``;
        rows.forEach((row, index) => {
            if (index > 0) values.append(SQL`, `);
            values.append(SQL`${row}`);
        });

        const routinesQuery = SQL`
            INSERT INTO repy_routines_l
                (routine_id, version_id, schedule_id, duration, set_break, execution_order)
            VALUES ${values};
        `;

        const cursor = this.db.cursor();
        await cursor.execute(versionDisableQuery, versionQuery, routinesQuery);
    }

    async updatePlan(inputData: UpdatePlanDTO): Promise<void> {
        const query = SQL`
            UPDATE repy_plan_l
            SET goal_date  = COALESCE(${inputData.goalDate}, goal_date),
                goal       = COALESCE(${inputData.goal}, goal),
                updated_at = NOW()
            WHERE plan_id = ${inputData.planId};
        `;

        const cursor = this.db.cursor();
        await cursor.execute(query);
    }

    async updateSchedule(inputData: UpdateScheduleDTO): Promise<void> {
        const versionDisableQuery = SQL`
            UPDATE repy_flow_version_l
            SET is_current = FALSE
            WHERE user_id = ${inputData.userId};
        `;

        const versionId = uuid4();
        const versionQuery = SQL`
            INSERT INTO repy_flow_version_l (version_id, user_id, plan_id, is_current)
                SELECT 
                    ${versionId},
                    p.user_id,
                    p.plan_id,
                    TRUE
                FROM repy_plan_l p
                WHERE p.user_id = ${inputData.userId}
            ORDER BY p.created_at DESC
            LIMIT 1;
        `;

        const rows = inputData.activeDays.map(d => SQL`
          (
            ${uuid4()},                  -- schedule_id
            ${versionId},                -- version_id
            ${inputData.userId},         -- user_id
            ${d.weekday},                -- wkday
            ${d.startTime},              -- start_time
            ${d.maxDuration}             -- max_duration
          )
        `);

        const values = SQL``;
        rows.forEach((row, index) => {
            if (index > 0) values.append(SQL`, `);
            values.append(SQL`${row}`);
        });

        const scheduleQuery = SQL`
            INSERT INTO repy_schedule_l
                (schedule_id, version_id, user_id, wkday, start_time, max_duration)
            VALUES ${values};
        `;

        const cursor = this.db.cursor();
        await cursor.execute(versionDisableQuery, versionQuery, scheduleQuery);
    }
}
