
import { type Patient } from "../types/patient"
import { type CreateAppointment } from "../types/appointment"
import { useState, type SubmitEvent } from "react";
import { createAppointment } from "../api/patientsApi";
type AppointmentFormProps = {
    patients: Patient[]

}

type AppointmentFormErrors = {
    patientId?: string;
    date?: string;
    time?: string;
    reason?: string;
};

const AppointmentForm = ({ patients }: AppointmentFormProps) =>
{
    const [patientId, setPatientId] = useState<string | null>(null);
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [reason, setReason] = useState("");
    const [errors, setErrors] = useState<AppointmentFormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    function validateAppointment(): AppointmentFormErrors
    {
        const appointmentErrors: AppointmentFormErrors = {};

        if (!patientId)
        {
            appointmentErrors.patientId = "Patient is required";
        }
        else
        {
            if (!patients.some(patient => patient.id === Number(patientId)))
            {
                appointmentErrors.patientId = "Select a valid patient."
            };
        }
        if (date === "")
        {
            appointmentErrors.date = "Date is required";
        }
        if (time === "")
        {
            appointmentErrors.time = "Time is required";

        }
        if (reason.trim() === "")
        {
            appointmentErrors.reason = "Reason is required";
        }

        return appointmentErrors;

    }

    async function handleSubmit(event: SubmitEvent<HTMLFormElement>)
    {

        event.preventDefault();
        const validationErrors = validateAppointment();

        setErrors(validationErrors);
        const hasErrors = Object.keys(validationErrors).length > 0;

        if (hasErrors)
        {
            return;
        }

        const appointment: CreateAppointment = {
            patientId: Number(patientId),
            date,
            time,
            reason: reason.trim(),
        };
        setIsSubmitting(true);
        setSubmitError(null);
        try
        {

            await createAppointment(appointment);
            setPatientId(null);
            setDate("");
            setTime("");
            setReason("");
            setErrors({});
        } catch
        {
            setSubmitError("Failed to create appointment. Please try again.");
        }
        finally
        {
            setIsSubmitting(false);
        }
    }

    return (<>
        <form
            onSubmit={handleSubmit}
        >
            <h1>Schedule Appointment</h1>
            <label htmlFor="selectPatient">Select Patient:</label>
            <select id="selectPatient" name="patientId" value={patientId ?? ""} onChange={(e) => setPatientId(e.target.value || null)} aria-invalid={Boolean(errors.patientId)} aria-describedby={errors.patientId ? "patientId-error" : undefined} required>
                <option value="">Select patient...</option>
                {patients?.map(patient => (
                    <option key={patient.id} value={patient.id}>{patient.firstName} {patient.lastName}</option>
                ))}
            </select>
            {errors.patientId && (<p id="patientId-error" role="alert">{errors.patientId}</p>)}

            <label htmlFor="appointmentDate">Date:</label>
            <input id="appointmentDate" name="date" type="date" onChange={(e) => setDate(e.target.value)} value={date} aria-invalid={Boolean(errors.date)} aria-describedby={errors.date ? "date-error" : undefined} required />
            {errors.date && (<p id="date-error" role="alert">{errors.date}</p>)}

            <label htmlFor="appointmentTime">Time:</label>
            <input id="appointmentTime" name="time" type="time" onChange={(e) => setTime(e.target.value)} value={time} aria-invalid={Boolean(errors.time)} aria-describedby={errors.time ? "time-error" : undefined} required />
            {errors.time && (<p id="time-error" role="alert">{errors.time}</p>)}

            <label htmlFor="reason">Reason:</label>
            <input id="reason" name="reason" onChange={(e) => setReason(e.target.value)} value={reason} aria-invalid={Boolean(errors.reason)} aria-describedby={errors.reason ? "reason-error" : undefined} minLength={3}
                maxLength={200} required />
            {errors.reason && (<p id="reason-error" role="alert">{errors.reason}</p>)}

            <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Scheduling..." : "Schedule Appointment"}
            </button>

            {submitError && (
                <p role="alert">
                    {submitError}
                </p>
            )}
        </form>
    </>);
};

export default AppointmentForm;

