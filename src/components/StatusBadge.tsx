import type { PatientStatus } from "../types/patient";
type StatusBadgeProps = {
    status: PatientStatus;
};

export default function StatusBadge({ status }: StatusBadgeProps)
{
    const statusLabel: Record<PatientStatus, string> = {
        active: "Active",
        inactive: "Inactive",
        critical: "Critical",
    };
    return (
        <p>
            {statusLabel[status]}
        </p>
    );
}

