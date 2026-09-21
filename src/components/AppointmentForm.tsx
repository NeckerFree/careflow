
import { type Patient } from "../types/patient"
import { type CreateAppointment } from "../types/appointment"
import { useActionState, useCallback, useEffect, useRef } from "react";
import { createAppointment } from "../api/patientsApi";
import SubmitButton from "./SubmitButton";
import { useQueryClient, type QueryClient } from "@tanstack/react-query";
import type { ValidationResult } from "../types/ValidationResult";
import type { AppointmentFormState } from "../types/AppointmentFormState";
import type { AppointmentFormInput, FormValues, ParsedAppointmentForm } from "../types/AppointmentFormInput";
type AppointmentFormProps = {
    patients: Patient[]

}

export function parsePositiveInteger(value: string): number | null
{
    const numeric = Number(value);
    return Number.isInteger(numeric) && numeric > 0
        ? numeric
        : null;
}

const getFormString = (formData: FormData,
    fieldName: string): string =>
{
    const value = formData.get(fieldName);
    if (typeof value !== "string")
    {
        return "";
    }
    return value.trim();
};

export function parseAppointmentForm(formData: FormData): ParsedAppointmentForm 
{

    const errors: Record<string, string> = {};
    // get strings
    const date = getFormString(formData, "date");
    const time = getFormString(formData, "time");
    const reason = getFormString(formData, "reason");
    const patientIdValue = getFormString(formData, "patientId");

    const formValues: FormValues = {
        patientId: patientIdValue,
        date,
        time,
        reason
    };

    const patientId = parsePositiveInteger(patientIdValue);
    if (patientId === null)
    {
        return {
            success: false,
            errors: {
                patientId: "Patient ID must be a positive integer.",
            },
            values: formValues,
        };
    }
    if (Object.keys(errors).length > 0)
    {
        return {
            success: false,
            errors: errors,
            values: formValues
        };
    }
    else
    {
        //return parsed data
        const appointmentFormInput: AppointmentFormInput = {
            patientId: patientId,
            date: date,
            time: time,
            reason: reason,
        };
        return {
            success: true,
            data: appointmentFormInput,
            values: formValues
        };
    }

};
const EMPTY_FORM_VALUES: FormValues = {
    patientId: "",
    date: "",
    time: "",
    reason: "",
};
export function validateAppointment(
    appointment: CreateAppointment,
    patients: Patient[]
): ValidationResult<CreateAppointment>
{
    const errors: Record<string, string> = {};
    //date
    if (!appointment.date || appointment.date === "")
    {
        errors["date"] = "Date is required";
    }
    //time
    if (!appointment.time || appointment.time === "")
    {
        errors["time"] = "Time is required";
    }
    //reason length
    if (appointment.reason.length < 3)
    {
        errors["reason"] = "Reason must contain at least 3 characters";
    }
    //patient existence
    if (!patients.some(patient => patient.id === appointment.patientId))
    {
        errors["patientId"] = "Select a valid patient.";
    }

    if (Object.keys(errors).length > 0)
    {
        return {
            success: false,
            errors: errors
        };
    }
    else
    {
        return {
            success: true,
            data: appointment,
        };
    }
};

export async function createAppointmentAction(
    patients: Patient[],
    queryClient: QueryClient,
    _previousState: AppointmentFormState<FormValues>,
    formData: FormData
): Promise<AppointmentFormState<FormValues>>
{
    const parsedResponse = parseAppointmentForm(formData);
    if (parsedResponse.success === false)
    {
        return {
            status: "validation-error",
            fieldErrors: parsedResponse.errors,
            values: parsedResponse.values,
        };
    }
    const appointment: CreateAppointment = {
        patientId: parsedResponse.data.patientId,
        date: parsedResponse.data.date,
        time: parsedResponse.data.time,
        reason: parsedResponse.data.reason,
    };
    const validationResult = validateAppointment(appointment, patients);
    if (validationResult.success === false)
    {
        return {
            status: "validation-error",
            fieldErrors: validationResult.errors,
            values: parsedResponse.values,
        };
    }
    try
    {
        await createAppointment(appointment);
        await queryClient.invalidateQueries({ queryKey: ["appointments"] });

        return {
            status: "success",
            values: EMPTY_FORM_VALUES,

        };

    } catch 
    {
        return {
            status: "api-error",
            errorCode: "CONFLICT",
            values: parsedResponse.values,
            formError: "Failed to create appointment. Please try again.",
        };
    }

}

const AppointmentForm = ({ patients }: AppointmentFormProps) =>
{
    const queryClient = useQueryClient();

    const formRef = useRef<HTMLFormElement>(null);

    const formActionCallback = useCallback(
        (
            previousState: AppointmentFormState<FormValues>,
            formData: FormData
        ) =>
            createAppointmentAction(
                patients,
                queryClient,
                previousState,
                formData
            ),
        [patients, queryClient]
    );

    const initialState: AppointmentFormState<FormValues> = {
        status: "idle",
        values: EMPTY_FORM_VALUES,
    };
    const [state, formAction] = useActionState(
        formActionCallback,
        initialState
    );

    useEffect(() =>
    {
        if (state.status === "success") return;
        const form = formRef.current;
        if (!form) return;

        for (const [name, value] of Object.entries(state.values))
        {
            const field = form.elements.namedItem(name);

            if (field instanceof HTMLInputElement ||
                field instanceof HTMLSelectElement ||
                field instanceof HTMLTextAreaElement)
            {
                field.value = value;
            }
        }
    }, [state.status, state.values]);

    return (<>
        <form
            ref={formRef}
            action={formAction}
        >
            <h1>Schedule Appointment</h1>
            <label htmlFor="selectPatient">Select Patient:</label>
            <select id="selectPatient" name="patientId"
                required>
                <option value="">Select patient...</option>
                {patients.map(patient => (
                    <option key={patient.id} value={patient.id}>{patient.firstName} {patient.lastName}</option>
                ))}
            </select>


            <label htmlFor="appointmentDate">Date:</label>
            <input id="appointmentDate" name="date" type="date"
                required />


            <label htmlFor="appointmentTime">Time:</label>
            <input id="appointmentTime" name="time" type="time" required />

            <label htmlFor="reason">Reason:</label>
            <input id="reason" name="reason"
                minLength={3}
                maxLength={200}
                required />
            <SubmitButton />

            {(() =>
            {
                switch (state.status)
                {
                    case "validation-error":
                        return (<>
                            {Object.entries(state.fieldErrors).map(([key, value]) => (
                                value && <p key={key} role="alert">{value}</p>
                            ))}</>)
                    case "api-error":
                        return (<>
                            {(
                                <p role="alert">
                                    {state.errorCode}: {state.formError}
                                </p>
                            )}
                        </>)
                    case "success":
                        return (<>
                            {<p role="status">Schedule created!</p>}
                        </>)
                    case "idle":
                        return null
                }
            }
            )()}
        </form>
    </>);
};
export default AppointmentForm;
