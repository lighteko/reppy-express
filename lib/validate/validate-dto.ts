import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

export async function validateDTO<T extends object>(cls: new () => T, input: unknown): Promise<T> {
    const dto = plainToInstance(cls, input);
    const errors = await validate(dto);
    if (errors.length > 0) {
        const message = errors
            .map(e => Object.values(e.constraints ?? {}).join(', '))
            .join('; ');
        throw new Error(`Validation Error: ${message}`);
    }
    return dto;
}
