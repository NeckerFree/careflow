import { useQuery } from "@tanstack/react-query";
import { vi } from "vitest";
let fetchCount = 0;
export const fetchAppointments = vi.fn(async () =>
{
    fetchCount++;

    return [];
});
export function AppointmentsProbe()
{
    const { data } = useQuery({
        queryKey: ["appointments"],
        queryFn: fetchAppointments,
    });

    return (
        <div data-testid="appointments-count">
            {data?.length ?? 0}
        </div>
    );
}