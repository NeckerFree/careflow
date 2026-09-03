
import { type Patient } from "../types/patient"
import { type CreateAppointment } from "../types/appointment"
import { useState } from "react";
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
    const [patientId, setPatientId] = useState<number | null>(null);
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [reason, setReason] = useState("");
    const [errors, setErrors] = useState<AppointmentFormErrors>({});


    function validateAppointment(): AppointmentFormErrors
    {
        const appointmentErrors: AppointmentFormErrors = {};
        if (!patientId)
        {
            appointmentErrors.patientId = "Patient is required";
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

    function handleSubmit(event: React.SubmitEvent<HTMLElement>)
    {
        event.preventDefault();
        const validationErrors = validateAppointment();
        setErrors(validationErrors);
        const hasErrors = Object.keys(validationErrors).length > 0;
        if (hasErrors) return;
        if (!patientId)
        {
            return;
        }
        const appointment: CreateAppointment = {
            patientId,
            date,
            time,
            reason: reason.trim(),
        };
        console.log("Creating Appointment:", appointment);
        setPatientId(null);
        setDate("");
        setTime("");
        setReason("");
        setErrors({});
    }

    return (<>
        <form onSubmit={handleSubmit}>
            <h1>Schedule Appointment</h1>
            <label htmlFor="selectPatient"></label>
            <select id="selectPatient" name="patientId" value={patientId ?? ""} onChange={(e) => setPatientId(Number(e.target.value) || null)}>
                <option value="">Select patient...</option>
                {patients?.map(patient => (
                    <option key={patient.id} value={patient.id}>{patient.firstName} {patient.lastName}</option>
                ))}
            </select>
            {errors.patientId && (<p>{errors.patientId}</p>)}

            <label htmlFor="appointmentDate">Date</label>
            <input id="appointmentDate" type="date" onChange={(e) => setDate(e.target.value)} value={date} />
            {errors.date && (<p>{errors.date}</p>)}

            <label htmlFor="appointmentTime">Time</label>
            <input id="appointmentTime" type="time" onChange={(e) => setTime(e.target.value)} value={time} />
            {errors.time && (<p>{errors.time}</p>)}

            <label htmlFor="reason">Reason</label>
            <input id="reason" onChange={(e) => setReason(e.target.value)} value={reason} />
            {errors.reason && (<p>{errors.reason}</p>)}

            <button type="submit" >
                Schedule Appointment
            </button>

        </form>
    </>);
};

export default AppointmentForm;

