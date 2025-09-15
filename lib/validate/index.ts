import { z } from "zod";
import { ValidationError } from "@lib/errors";
import { InternalServerError } from "@lib/errors";

export function validateInput<T extends z.ZodTypeAny>(schema: z.ZodTypeAny, data: unknown): T {
    const parseResult = schema.safeParse(data);
    if (!parseResult.success) {
        const errorTree = z.treeifyError(parseResult.error);
        const errors = errorTree.errors;
        if (errors.length > 0) {
            const errString = errors.join(", ");
            throw new ValidationError(errString);
        }
    }
    return parseResult.data as T;
}

export function validateOutput<T extends z.ZodTypeAny>(schema: z.ZodTypeAny, data: unknown): void {
    const parseResult = schema.safeParse(data);
    if (!parseResult.success) {
        const errorTree = z.treeifyError(parseResult.error);
        const errors = errorTree.errors;
        if (errors.length > 0) {
            const errString = errors.join(", ");
            throw new InternalServerError(errString);
        }
    }
}
