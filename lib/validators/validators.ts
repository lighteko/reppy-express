import { registerDecorator, ValidationOptions, ValidationArguments } from "class-validator";

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
