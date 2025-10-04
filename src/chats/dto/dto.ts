import { z } from "zod";

export const SenderTypeSchema = z.enum(["USER", "REPPY"]);

export const CreateChatSchema = z.object({
    userId: z.uuid(),
    senderType: SenderTypeSchema,
    content: z.string(),
});

export const GetChatsWithCursorSchema = z.object({
    userId: z.uuid(),
    createdAt: z.string().datetime(),
});

export const ChatResponseSchema = z.object({
    messageId: z.uuid(),
    userId: z.uuid(),
    senderType: SenderTypeSchema,
    content: z.string(),
    createdAt: z.string().datetime(),
});

export const MultipleChatResponseSchema = z.object({
    chats: z.array(ChatResponseSchema),
});

export type SenderType = z.infer<typeof SenderTypeSchema>;
export type CreateChatDTO = z.infer<typeof CreateChatSchema>;
export type GetChatsWithCursorDTO = z.infer<typeof GetChatsWithCursorSchema>;
export type ChatResponseDTO = z.infer<typeof ChatResponseSchema>;
export type MultipleChatResponseDTO = z.infer<typeof MultipleChatResponseSchema>;
