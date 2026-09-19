type AppointmentApiErrorCode =
    | "CONFLICT"
    | "SERVER_ERROR";
export type AppointmentFormState<FormValues> =
    | {
        status: "idle";
        values: FormValues;
    }
    | {
        status: "success";
        values: FormValues;
    }
    | {
        status: "validation-error";
        fieldErrors: Record<string, string>;
        values: FormValues;
    }
    | {
        status: "api-error";
        formError: string;
        errorCode: AppointmentApiErrorCode;
        values: FormValues;
    };
