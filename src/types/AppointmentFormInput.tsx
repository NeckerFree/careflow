export type AppointmentFormInput = {
    patientId: number;
    date: string;
    time: string;
    reason: string;
};

export type FormValues = {
    patientId: string;
    date: string;
    time: string;
    reason: string;
};

export type ParsedAppointmentForm =
    | {
        success: true;
        data: AppointmentFormInput;
        values: FormValues;
    }
    | {
        success: false;
        errors: Record<string, string>;
        values: FormValues;
    };