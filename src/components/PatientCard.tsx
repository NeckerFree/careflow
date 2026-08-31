import type { Patient, PatientStatus } from "../types/patient";
import StatusBadge from "./StatusBadge";

type PatientCardProps = {
    patient: Patient;
    isSelected: boolean;
    onSelect: (patientId: number) => void;
    onChangeStatus: (
        patientId: number,
        status: PatientStatus
    ) => void;
};
const PatientCard = ({ patient, isSelected, onSelect, onChangeStatus }: PatientCardProps) =>
{
    return (
        <article className={isSelected ? "patientSelected" : ""}
            onClick={() => onSelect(patient.id)} >
            <h3>{patient.firstName} {patient.lastName}</h3>
            <p>Date of Birth: {patient.dateOfBirth}</p>
            {patient.email && <p>Email: {patient.email}</p>}
            {patient.phone && <p>Phone: {patient.phone}</p>}
            <StatusBadge status={patient.status} />
            <button disabled={patient.status === "critical"}
                onClick={(event) =>
                {
                    event.stopPropagation();
                    onChangeStatus(patient.id, "critical")
                }}>Mark Critical</button>
        </article>
    );
};

export default PatientCard;