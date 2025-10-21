import { z } from "zod";

const Calculate1RMSchema = z.object({
    userId: z.uuid(),
    exerciseCode: z.string(),
});
