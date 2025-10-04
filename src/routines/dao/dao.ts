import DB from "@lib/infra/postgres";
import { CreateRoutineDTO, UpdateRoutineDTO, UpdateProgramDTO, UpdateScheduleDTO } from "@src/routines/dto/dto";
import SQL, { SQLStatement } from "sql-template-strings";
import { v4 as uuid4 } from "uuid";

/**
 * RoutinesDAO - Implements immutable version control for routines
 * 
 * Version Control Strategy:
 * - Routines are IMMUTABLE - they are never modified, only created
 * - Each change creates a NEW version and a NEW routine
 * - All routines from the previous version are copied to the new version
 * - The modified routine is replaced with a new routine containing the changes
 * - Old versions and routines persist for complete history tracking
 * 
 * Version Flow:
 * 1. User creates/updates a routine
 * 2. System fetches all routines from current version
 * 3. System creates new version (marks old as not current)
 * 4. System creates new routine with changes
 * 5. System links all old routines + new routine to new version via repy_version_routine_map
 * 
 * This ensures complete version history while maintaining referential integrity.
 */
export class RoutinesDAO {
    private db: DB;

    constructor() {
        this.db = DB.getInstance();
    }

    async createRoutine(inputData: CreateRoutineDTO): Promise<string> {
        const cursor = this.db.cursor();

        // Get all routines from the current version
        const currentRoutinesQuery = SQL`
            SELECT vrm.routine_id
            FROM repy_version_l v
            JOIN repy_version_routine_map vrm ON v.version_id = vrm.version_id
            WHERE v.user_id = ${inputData.userId}
              AND v.is_current = TRUE;
        `;
        const currentRoutines = await cursor.fetchAll(currentRoutinesQuery);

        // Create the new routine
        const routineId = uuid4();
        const routineQuery = SQL`
            INSERT INTO repy_routine_l
                (routine_id, schedule_id, user_id, routine_name)
            VALUES (${routineId},
                    ${inputData.scheduleId},
                    ${inputData.userId},
                    ${inputData.routineName});
        `;

        // Create routine-plan mappings for the new routine
        const planMapRows = inputData.plans.map((plan) => SQL`
            (
                ${uuid4()},             -- map_id
                ${routineId},           -- routine_id
                ${plan.planId},         -- plan_id
                ${plan.execOrder}       -- exec_order
            )
        `);

        const planMapValues = SQL``;
        planMapRows.forEach((row, index) => {
            if (index > 0) planMapValues.append(SQL`, `);
            planMapValues.append(SQL`${row}`);
        });

        const planMapQuery = SQL`
            INSERT INTO repy_routine_plan_map
                (map_id, routine_id, plan_id, exec_order)
            VALUES ${planMapValues};
        `;

        // Disable current version
        const versionDisableQuery = SQL`
            UPDATE repy_version_l
            SET is_current = FALSE
            WHERE user_id = ${inputData.userId};
        `;

        // Create new version
        const versionId = uuid4();
        const versionQuery = SQL`
            INSERT INTO repy_version_l (version_id, user_id, is_current)
            VALUES (${versionId}, ${inputData.userId}, TRUE);
        `;

        // Build version-routine mappings: all old routines + new routine
        const allRoutineIds = [
            ...currentRoutines.map((r: any) => r.routine_id),
            routineId
        ];

        const versionRoutineRows = allRoutineIds.map((rId) => SQL`
            (${versionId}, ${rId})
        `);

        const versionRoutineValues = SQL``;
        versionRoutineRows.forEach((row, index) => {
            if (index > 0) versionRoutineValues.append(SQL`, `);
            versionRoutineValues.append(SQL`${row}`);
        });

        const versionRoutineMapQuery = SQL`
            INSERT INTO repy_version_routine_map (version_id, routine_id)
            VALUES ${versionRoutineValues};
        `;

        await cursor.execute(routineQuery, planMapQuery, versionDisableQuery, versionQuery, versionRoutineMapQuery);
        return routineId;
    }

    async updateRoutine(inputData: UpdateRoutineDTO): Promise<string> {
        const cursor = this.db.cursor();

        // Get all routines from the current version
        const currentRoutinesQuery = SQL`
            SELECT vrm.routine_id
            FROM repy_version_l v
            JOIN repy_version_routine_map vrm ON v.version_id = vrm.version_id
            WHERE v.user_id = ${inputData.userId}
              AND v.is_current = TRUE;
        `;
        const currentRoutines = await cursor.fetchAll(currentRoutinesQuery);

        // Get the routine being updated to copy its data
        const oldRoutineQuery = SQL`
            SELECT routine_id as "routineId", 
                   schedule_id as "scheduleId", 
                   routine_name as "routineName"
            FROM repy_routine_l
            WHERE routine_id = ${inputData.routineId}
              AND user_id = ${inputData.userId};
        `;
        const oldRoutineData: any = await cursor.fetchOne(oldRoutineQuery);

        if (!oldRoutineData) {
            throw new Error("Routine not found");
        }

        // Create a new routine with updated data
        const newRoutineId = uuid4();
        const newRoutineQuery = SQL`
            INSERT INTO repy_routine_l
                (routine_id, schedule_id, user_id, routine_name)
            VALUES (${newRoutineId},
                    ${oldRoutineData.scheduleId},
                    ${inputData.userId},
                    ${inputData.routineName ?? oldRoutineData.routineName});
        `;

        // Get old routine's plan mappings if plans not provided
        let planMapQuery: SQLStatement;
        
        if (inputData.plans) {
            // Use provided plans
            const planMapRows = inputData.plans.map((plan) => SQL`
                (
                    ${uuid4()},             -- map_id
                    ${newRoutineId},        -- routine_id
                    ${plan.planId},         -- plan_id
                    ${plan.execOrder}       -- exec_order
                )
            `);

            const planMapValues = SQL``;
            planMapRows.forEach((row, index) => {
                if (index > 0) planMapValues.append(SQL`, `);
                planMapValues.append(SQL`${row}`);
            });

            planMapQuery = SQL`
                INSERT INTO repy_routine_plan_map
                    (map_id, routine_id, plan_id, exec_order)
                VALUES ${planMapValues};
            `;
        } else {
            // Copy plans from old routine
            planMapQuery = SQL`
                INSERT INTO repy_routine_plan_map (map_id, routine_id, plan_id, exec_order)
                SELECT ${uuid4()}, ${newRoutineId}, plan_id, exec_order
                FROM repy_routine_plan_map
                WHERE routine_id = ${inputData.routineId};
            `;
        }

        // Disable current version
        const versionDisableQuery = SQL`
            UPDATE repy_version_l
            SET is_current = FALSE
            WHERE user_id = ${inputData.userId};
        `;

        // Create new version
        const versionId = uuid4();
        const versionQuery = SQL`
            INSERT INTO repy_version_l (version_id, user_id, is_current)
            VALUES (${versionId}, ${inputData.userId}, TRUE);
        `;

        // Build version-routine mappings: all old routines (except the updated one) + new routine
        const allRoutineIds = [
            ...currentRoutines
                .map((r: any) => r.routine_id)
                .filter((rId: string) => rId !== inputData.routineId),
            newRoutineId
        ];

        const versionRoutineRows = allRoutineIds.map((rId) => SQL`
            (${versionId}, ${rId})
        `);

        const versionRoutineValues = SQL``;
        versionRoutineRows.forEach((row, index) => {
            if (index > 0) versionRoutineValues.append(SQL`, `);
            versionRoutineValues.append(SQL`${row}`);
        });

        const versionRoutineMapQuery = SQL`
            INSERT INTO repy_version_routine_map (version_id, routine_id)
            VALUES ${versionRoutineValues};
        `;

        await cursor.execute(newRoutineQuery, planMapQuery, versionDisableQuery, versionQuery, versionRoutineMapQuery);
        return newRoutineId;
    }

    async updateProgram(inputData: UpdateProgramDTO): Promise<void> {
        const updates: SQLStatement[] = [];
        
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
