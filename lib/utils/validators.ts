import { registerDecorator, ValidationOptions, ValidationArguments } from "class-validator";
import { z } from "zod";

export function IsDouble(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: "isDouble",
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any) {
                    return typeof value === "number" && !Number.isInteger(value);
                },
                defaultMessage(args: ValidationArguments) {
                    return `${args.property} must be a non-integer number`;
                },
            },
        });
    };
}

export function Is24Hour(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'is24Hour',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any) {
                    if (typeof value !== 'string') return false;

                    const regex = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
                    return regex.test(value);
                },

                defaultMessage(args: ValidationArguments) {
                    return `${args.property} must be in 'HH:mm' 24-hour format`;
                },
            },
        });
    };
}

export function IsLocaleString(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: "isLocaleString",
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any) {
                    if (typeof value !== 'string') return false;

                    const regex = /^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$/
                    return regex.test(value);
                },

                defaultMessage(args?: ValidationArguments): string {
                    return `${args?.property} must be in a locale format`;
                }
            }
        })
    }
}

export function ValidatePair(pairedField: string, validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'validatePair',
            target: object.constructor,
            propertyName,
            constraints: [pairedField],
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    const [pairedField] = args.constraints;
                    const pairedValue = (args.object as any)[pairedField];

                    const isEmpty = (v: any) => v === undefined || v === null;

                    const bothEmpty = isEmpty(value) && isEmpty(pairedValue);
                    const bothPresent = !isEmpty(value) && !isEmpty(pairedValue);

                    return bothEmpty || bothPresent;
                },

                defaultMessage(args: ValidationArguments) {
                    const [pairedField] = args.constraints;
                    return `${args.property} and ${pairedField} must both be present or both be absent.`;
                },
            },
        });
    };
}

export function RequiredIf(
    relatedField: string,
    expectedValue: any,
    validationOptions?: ValidationOptions
) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'requiredIf',
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    const related = (args.object as any)[relatedField];
                    if (related === expectedValue) {
                        return value !== null && value !== undefined;
                    }
                    return true;
                },
                defaultMessage(args: ValidationArguments) {
                    return `${args.property} is required when ${relatedField} is '${expectedValue}'`;
                },
            },
        });
    };
}

// Zod custom validators
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

