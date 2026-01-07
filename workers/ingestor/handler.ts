import { validateInput } from "lib/validate";
import ObjectStorage from "lib/infra/objectstorage";
import { RoutinesDAO } from "src/routines/dao/dao";
import { CreateBatchRoutinesSchema, CreateRoutineSchema } from "src/routines/dto/dto";
import { EventSchema } from "workers/repository/dto/dto";
import { WorkerService } from "workers/repository/service/service";

export async function handler(parsed: any, service: WorkerService, dao: RoutinesDAO) {
    const storage = ObjectStorage.getInstance();
    const message = validateInput(EventSchema, parsed);
    try {
        const acquired = await service.tryMarkProcessing(message.eventId);
        if (!acquired) return;
        if (message.type === "BATCH_ROUTINES") {
            const obj = await storage.getObject(message.objectName, message.bucket);
            const dto = validateInput(CreateBatchRoutinesSchema, JSON.parse(obj));
            await dao.createBatchRoutines(dto);
        } else if (message.type === "SINGLE_ROUTINE") {
            const obj = await storage.getObject(message.objectName, message.bucket);
            const dto = validateInput(CreateRoutineSchema, JSON.parse(obj));
            await dao.createRoutine(dto);
        } else {
            throw new Error(`Unknown message.type: ${message.type}`);
        }
        await service.markDone(message.eventId);
    } catch (e: unknown) {
        await service.markFailed(message.eventId);
        throw e;
    }
}
