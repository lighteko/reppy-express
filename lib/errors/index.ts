abstract class BaseError extends Error {
    toString(): string {
        return this.name + ': ' + this.message;
    }
}

export class AuthenticationError extends BaseError {
    constructor(message: string) {
        super(message);
        this.name = 'AuthenticationError';
    }
}

export class AuthorizationError extends BaseError {
    constructor(message: string) {
        super(message);
        this.name = 'AuthorizationError';
    }
}

export class DuplicateError extends BaseError {
    constructor(message: string) {
        super(message);
        this.name = 'DuplicateError';
    }
}

export class InternalServerError extends BaseError {
    constructor(message: string) {
        super(message);
        this.name = 'InternalServerError';
    }
}

export class ValidationError extends BaseError {
    constructor(message: string) {
        super(message);
        this.name = 'ValidationError';
    }
}
