import DB, { Row } from "@lib/infra/postgres";
import {
    CreateBatchRoutinesDTO,
    CreateRoutineDTO,
    UpdateProgramDTO,
} from "@src/routines/dto/dto";
import SQL from "sql-template-strings";


export class RoutinesDAO {
    private db: DB;

    constructor() {
        this.db = DB.getInstance();
    }

    async createRoutine(inputData: CreateRoutineDTO): Promise<Row> {
        const plans = JSON.stringify({ plans: inputData.plans });
        const query = SQL`
            WITH new_routine AS (
                INSERT INTO repy_routine_l (user_id, routine_name, routine_order)
                    VALUES (${inputData.userId}, ${inputData.routineName}, ${inputData.routineOrder})
                    RETURNING routine_id),
                 program_mapping AS (
                     INSERT INTO repy_program_routine_map (program_id, routine_id)
                         SELECT ${inputData.programId}, routine_id FROM new_routine),
                 new_version AS (
                     INSERT INTO repy_routine_version_l (routine_id, user_id, is_active)
                         SELECT routine_id, ${inputData.userId}, TRUE FROM new_routine
                         RETURNING routine_version_id),
                 input_plans AS (SELECT (plan ->> 'exerciseId')::uuid    AS exercise_id,
                                        (plan ->> 'execOrder')::smallint AS exec_order,
                                        plan ->> 'memo'                  AS memo,
                                        plan ->> 'description'           AS description,
                                        plan ->> 'sets'                  AS sets
                                 FROM jsonb_array_elements(${plans}::jsonb -> 'plans') AS t(plan)),
                 new_plans AS (
                     INSERT INTO repy_exercise_plan_l (routine_version_id, exercise_id, exec_order, memo, description)
                         SELECT (SELECT routine_version_id FROM new_version),
                                ip.exercise_id,
                                ip.exec_order,
                                ip.memo,
                                ip.description
                         FROM input_plans ip
                         RETURNING plan_id, exercise_id, exec_order),
                 sets_to_insert AS (SELECT np.plan_id,
                                           (s ->> 'setTypeId')::uuid    AS set_type_id,
                                           (s ->> 'setOrder')::smallint AS set_order,
                                           (s ->> 'reps')::int          AS reps,
                                           (s ->> 'weight')::float      AS weight,
                                           (s ->> 'restTime')::int      AS rest_time,
                                           (s ->> 'duration')::int      AS duration
                                    FROM input_plans ip
                                             JOIN new_plans np
                                                  ON ip.exercise_id = np.exercise_id AND ip.exec_order = np.exec_order
                                             CROSS JOIN LATERAL jsonb_array_elements(ip.sets) AS s),
                 final_sets_insert AS (
                     INSERT INTO repy_exercise_set_l (plan_id, set_type_id, set_order, reps, weight, rest_time, duration)
                         SELECT plan_id, set_type_id, set_order, reps, weight, rest_time, duration
                         FROM sets_to_insert)
            SELECT routine_version_id
            FROM new_version;
        `;

        const cursor = this.db.cursor();
        return await cursor.fetchOne(query);
    }

    async createBatchRoutines(inputData: CreateBatchRoutinesDTO) {
        const routines = JSON.stringify({ routines: inputData.routines });
        const query = SQL`
            WITH input_routines AS (SELECT ordinality                             AS routine_idx,
                                           routine ->> 'routineName'              AS routine_name,
                                           (routine ->> 'routineOrder')::smallint AS routine_order,
                                           routine -> 'plans'                     AS plans
                                    FROM jsonb_array_elements(${routines} -> 'routines') WITH ORDINALITY AS t(routine, ordinality)),
                 new_routines AS (
                     INSERT INTO repy_routine_l (user_id, routine_name)
                         SELECT ${inputData.userId},
                                ir.routine_name
                         FROM input_routines ir
                         RETURNING routine_id, routine_name),
                 program_mapping AS (
                     INSERT INTO repy_program_routine_map (program_id, routine_id)
                         SELECT ${inputData.programId},
                                nr.routine_id
                         FROM new_routines nr),
                 new_versions AS (
                     INSERT INTO repy_routine_version_l (routine_id, user_id, is_active)
                         SELECT routine_id, ${inputData.userId}, TRUE
                         FROM new_routines
                         RETURNING routine_version_id, routine_id),
                 plans_to_insert AS (SELECT nv.routine_version_id,
                                            (plan ->> 'exerciseId')::uuid    AS exercise_id,
                                            (plan ->> 'execOrder')::smallint AS exec_order,
                                            plan ->> 'description'           AS description,
                                            plan ->> 'memo'                  AS memo,
                                            plan -> 'sets'                   AS sets
                                     FROM input_routines ir
                                              JOIN new_routines nr ON ir.routine_name = nr.routine_name
                                              JOIN new_versions nv ON nr.routine_id = nv.routine_id
                                              CROSS JOIN LATERAL jsonb_array_elements(ir.plans) AS p(plan)),
                 new_plans AS (
                     INSERT INTO repy_exercise_plan_l
                         (routine_version_id, exercise_id, exec_order, memo, description)
                         SELECT routine_version_id,
                                exercise_id,
                                exec_order,
                                memo,
                                description
                         FROM plans_to_insert
                         RETURNING plan_id, routine_version_id, exercise_id),
                 sets_to_insert AS (SELECT np.plan_id,
                                           (s ->> 'setTypeId')::uuid    AS set_type_id,
                                           (s ->> 'setOrder')::smallint AS set_order,
                                           (s ->> 'reps')::int          AS reps,
                                           (s ->> 'weight')::float      AS weight,
                                           (s ->> 'restTime')::int      AS rest_time,
                                           (s ->> 'duration')::int      AS duration
                                    FROM plans_to_insert pti
                                             JOIN new_plans np
                                                  ON pti.routine_version_id = np.routine_version_id
                                                      AND pti.exercise_id = np.exercise_id
                                             CROSS JOIN LATERAL jsonb_array_elements(pti.sets) AS s)
            INSERT
            INTO repy_exercise_set_l
                (plan_id, set_type_id, set_order, reps, weight, rest_time, duration)
            SELECT plan_id,
                   set_type_id,
                   set_order,
                   reps,
                   weight,
                   rest_time,
                   duration
            FROM sets_to_insert;
        `;

        const cursor = this.db.cursor();
        await cursor.execute(query);
    }

    async updateProgram(inputData: UpdateProgramDTO): Promise<void> {
        const query = SQL`
            UPDATE repy_program_l
            SET program_name = COALESCE(${inputData.programName}, program_name),
                experience   = COALESCE(${inputData.experience}, experience),
                start_date   = COALESCE(${inputData.startDate}, start_date),
                goal_date    = COALESCE(${inputData.goalDate}, goal_date),
                goal         = COALESCE(${inputData.goal}, goal)
            WHERE program_id = ${inputData.programId}
              AND user_id = ${inputData.userId};
        `;

        const cursor = this.db.cursor();
        await cursor.execute(query);
    }
}
