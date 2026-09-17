
import { type Patient } from "../types/patient"
import { type CreateAppointment } from "../types/appointment"
import { useActionState, useEffect, useRef } from "react";
import { createAppointment } from "../api/patientsApi";
import SubmitButton from "./SubmitButton";
import { useQueryClient } from "@tanstack/react-query";
type AppointmentFormProps = {
    patients: Patient[]

}
type AppointmentFormErrors = {
    patientId?: string;
    date?: string;
    time?: string;
    reason?: string;
};
type FormValues = {
    patientId: string;
    date: string;
    time: string;
    reason: string;
};

const EMPTY_FORM_VALUES: FormValues = {
    patientId: "",
    date: "",
    time: "",
    reason: "",
};
const AppointmentForm = ({ patients }: AppointmentFormProps) =>
{
    const queryClient = useQueryClient();
    const formRef = useRef<HTMLFormElement>(null);



    type AppointmentFormState = {
        attempt: number;
        success: boolean;
        values: FormValues;
        errors?: AppointmentFormErrors;
        formError?: string;
    }

    const initialState: AppointmentFormState = {
        attempt: 0,
        success: false,
        values: EMPTY_FORM_VALUES,
        errors: {},

    };
    const [state, formAction] = useActionState(
        createAppointmentAction,
        initialState
    );

    useEffect(() =>
    {
        if (state.attempt === 0 || state.success) return;
        const form = formRef.current;
        if (!form) return;
        console.log(`success: ${state.success}`);
        for (const [name, value] of Object.entries(state.values))
        {
            console.log(`${name}: ${value}`)
            const field = form.elements.namedItem(name);

            if (field instanceof HTMLInputElement ||
                field instanceof HTMLSelectElement ||
                field instanceof HTMLTextAreaElement)
            {
                field.value = value;
            }
        }
    }, [state.attempt, state.formError, state.values]);

    async function createAppointmentAction(
        previousState: AppointmentFormState,
        formData: FormData
    ): Promise<AppointmentFormState>
    {
        const values: FormValues = {
            patientId: String(formData.get("patientId") ?? ""),
            date: String(formData.get("date") ?? ""),
            time: String(formData.get("time") ?? ""),
            reason: String(formData.get("reason") ?? ""),
        };
        const dateValue = String(formData.get("date") ?? "");
        const timeValue = String(formData.get("time") ?? "");
        const reasonValue = String(formData.get("reason") ?? "");
        if (!dateValue.trim())
        {
            return {
                attempt: previousState.attempt + 1,
                success: false,
                values,
                errors: {
                    date: "Date is required",
                },
            };
        }

        if (!timeValue.trim())
        {
            return {
                attempt: previousState.attempt + 1,
                success: false,
                values,
                errors: {
                    time: "Time is required",
                },
            };
        }

        if (!reasonValue.trim())
        {
            return {
                attempt: previousState.attempt + 1,
                success: false,
                values,
                errors: {
                    reason: "Reason is required",
                },
            };
        }

        const patientIdValue = String(formData.get("patientId") ?? "")
        if (!patientIdValue.trim())
        {
            return {
                attempt: previousState.attempt + 1,
                success: false,
                values,
                errors: {
                    patientId: "PatientId is required",
                },
            };
        }

        const patientId = Number(patientIdValue);

        if (!Number.isInteger(patientId) || patientId <= 0)
        {
            return {
                attempt: previousState.attempt + 1,
                values,
                success: false,
                errors:
                {
                    patientId: "Select a valid patient."
                }
            };
        }
        if (!patients.some(patient => patient.id === patientId))
        {
            return {
                attempt: previousState.attempt + 1,
                values,
                success: false,
                errors: {
                    patientId: "Select a valid patient.",
                },
            };
        }

        const appointment: CreateAppointment = {
            patientId,
            date: dateValue,
            time: timeValue,
            reason: reasonValue,
        };
        try
        {
            await createAppointment(appointment);
            await queryClient.invalidateQueries({ queryKey: ["appointments"] });
            return {
                attempt: previousState.attempt + 1,
                values: EMPTY_FORM_VALUES,
                success: true,
            };

        } catch 
        {
            return {
                attempt: previousState.attempt + 1,
                values,
                success: false,
                formError: "Failed to create appointment. Please try again.",
            };
        }

    }

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
                {patients?.map(patient => (
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

            {state.errors && Object.entries(state.errors).map(([key, value]) => (
                value && <p key={key} role="alert">{value}</p>
            ))}
            {state.formError && (
                <p role="alert">{state.formError}</p>
            )}
            {state.success && <p role="status">Schedule created!</p>}
        </form>
    </>);
};

export default AppointmentForm;

