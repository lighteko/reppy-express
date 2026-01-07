import { WorkerDAO } from "workers/repository/dao/dao";

export class WorkerService {
    private dao: WorkerDAO;

    constructor() {
        this.dao = new WorkerDAO();
    }

    async tryMarkProcessing(eventId: string): Promise<boolean> {
        return await this.dao.tryMarkProcessing(eventId);
    }

    async markDone(eventId: string) {
        await this.dao.markDone(eventId);
    }

    async markFailed(eventId: string) {
        await this.dao.markFailed(eventId);
    }
}
