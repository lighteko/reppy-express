import { z } from "zod";

export const EventSchema = z.object({
    type: z.enum(["BATCH_ROUTINES", "SINGLE_ROUTINE"]),
    eventId: z.uuid(),
    content: z.object(),
    bucket: z.string(),
    objectName: z.string(),
});
