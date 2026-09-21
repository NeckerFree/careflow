export type ValidationResult<T> =
    | {
        success: true;
        data: T;
    }
    | {
        success: false;
        errors: Record<string, string>;
    };
