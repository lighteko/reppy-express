import DB from "lib/infra/postgres";
import SQL from "sql-template-strings";

export class WorkerDAO {
    private db: DB;

    constructor() {
        this.db = DB.getInstance();
    }

    async getEventStatus(eventId: string) {
        const query = SQL`
            SELECT status
            FROM repy_event_tracker_l
            WHERE event_id = ${eventId};
        `;

        const cursor = this.db.cursor();
        return await cursor.fetchOne(query);
    }

    async markDone(eventId: string): Promise<void> {
        const query = SQL`
            UPDATE repy_event_tracker_l
            SET status     = 'DONE',
                updated_at = now()
            WHERE event_id = ${eventId}
              AND status = 'PROCESSING';
        `;
        const cursor = this.db.cursor();
        await cursor.execute(query);
    }

    async markFailed(eventId: string): Promise<void> {
        const query = SQL`
            UPDATE repy_event_tracker_l
            SET status     = CASE WHEN attempts >= 5 THEN 'DEAD' ELSE 'FAILED' END,
                updated_at = now()
            WHERE event_id = ${eventId}
              AND status = 'PROCESSING';
        `;
        const cursor = this.db.cursor();
        await cursor.execute(query);
    }


    async tryMarkProcessing(eventId: string) {
        const query = SQL`
            UPDATE repy_event_tracker_l
            SET status     = 'PROCESSING',
                attempts   = attempts + 1,
                updated_at = now()
            WHERE event_id = ${eventId}
              AND status IN ('ENQUEUED', 'FAILED')
            RETURNING event_id;
        `;

        const cursor = this.db.cursor();
        const row = await cursor.fetchOne(query);
        return !!row;
    }
}
