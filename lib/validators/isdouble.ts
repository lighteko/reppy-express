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
