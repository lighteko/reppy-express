import { z } from "zod";

export const zodDouble = z.number().refine((val) => !Number.isInteger(val), {
    message: "Must be a non-integer number"
});

export const zod24Hour = z.string({ message: "Must be in 'HH:mm' 24-hour format" }).regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/);

export const zodLocale = z.string({ message: "Must be in a locale format" }).regex(/^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$/);

// Zod helper for paired fields validation
export function zodValidatePair<T extends z.ZodRawShape>(
    schema: z.ZodObject<T>,
    field1: keyof T,
    field2: keyof T
) {
    return schema.refine(
        (data: any) => {
            const isEmpty = (v: any) => v === undefined || v === null;
            const val1 = data[field1 as string];
            const val2 = data[field2 as string];
            const bothEmpty = isEmpty(val1) && isEmpty(val2);
            const bothPresent = !isEmpty(val1) && !isEmpty(val2);
            return bothEmpty || bothPresent;
        },
        {
            message: `${String(field1)} and ${String(field2)} must both be present or both be absent`,
            path: [String(field1)]
        }
    );
}

