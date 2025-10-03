import { z } from "zod";

export const SentimentTypeSchema = z.enum(["POSITIVE", "NEGATIVE", "NEUTRAL"]);

export const CreateFeedbackSchema = z.object({
    userId: z.uuid(),
    mapId: z.uuid(),
    sentiment: SentimentTypeSchema,
    feedbackText: z.string(),
});

export type SentimentType = z.infer<typeof SentimentTypeSchema>;
export type CreateFeedbackDTO = z.infer<typeof CreateFeedbackSchema>;
