
import type { Patient, PatientStatus } from "../types/patient";
import StatusBadge from "./StatusBadge";
import { useAuth } from "../context/AuthContext";

type PatientCardProps = {
    patient: Patient;
    isSelected: boolean;
    isUpdating: boolean;
    onSelect: (patientId: number) => void;
    onChangeStatus: (
        patientId: number,
        status: PatientStatus
    ) => void;
};

const PatientCard = ({ patient, isSelected, isUpdating, onSelect, onChangeStatus }: PatientCardProps) =>
{
    const { user } = useAuth();

    return (
        <article className={isSelected ? "patientSelected" : ""}
            onClick={() => onSelect(patient.id)} >
            <p> {user ? user.name : "Not authenticated"}</p>
            <h3>{patient.firstName} {patient.lastName}</h3>
            <p>Date of Birth: {patient.dateOfBirth}</p>
            {patient.email && <p>Email: {patient.email}</p>}
            {patient.phone && <p>Phone: {patient.phone}</p>}
            <StatusBadge status={patient.status} />
            {patient.status === "critical" && <p>⚠ Immediate attention required</p>}
            <button disabled={patient.status === "critical" || isUpdating}
                onClick={(event) =>
                {
                    event.stopPropagation();
                    onChangeStatus(patient.id, "critical")
                }}>{isUpdating ? "Updating..." : "Mark Critical"}</button>
        </article>
    );
};

export default PatientCard;