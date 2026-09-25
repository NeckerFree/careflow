import { useQuery } from "@tanstack/react-query";
import { vi } from "vitest";
export const initialAppointments = [
    {
        id: 1,
        patientId: 1,
        date: "2026-09-30",
        time: "09:00",
        status: "scheduled",
        reason: "Initial appointment",
    },
];

export const refreshedAppointments = [
    ...initialAppointments,
    {
        id: 2,
        patientId: 1,
        date: "2026-10-01",
        time: "10:30",
        status: "scheduled",
        reason: "Annual checkup",
    },
];

let fetchCount = 0;

export const fetchAppointments2 = vi.fn(async () =>
{
    fetchCount++;

    return fetchCount === 1
        ? initialAppointments
        : refreshedAppointments;
});
export function AppointmentsProbe2()
{
    const { data } = useQuery({
        queryKey: ["appointments"],
        queryFn: fetchAppointments2,
    });

    return (
        <div data-testid="appointments-count">
            {data?.length ?? 0}
        </div>
    );
}