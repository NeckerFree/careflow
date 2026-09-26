import { useQuery } from "@tanstack/react-query";
import type { Appointment } from "../types/appointment";

type AppointmentsProbeProps = {
    fetchAppointments: () => Promise<Appointment[]>;
};

export function AppointmentsProbe({
    fetchAppointments,
}: AppointmentsProbeProps)
{
    const {
        data = [],
        isLoading,
        isError,
        refetch,
    }
        = useQuery({
            queryKey: ["appointments"],
            queryFn: fetchAppointments,
        });

    return (
        <>
            <div data-testid="appointments-count">
                {data?.length ?? 0}
            </div>
            {isError &&
                <p role="alert">
                    Failed to load appointments.
                </p>
            }
            <button type="button" onClick={() => refetch()}>
                Retry
            </button>
            {isLoading && <p>Loading Appointments...</p>}
        </>
    );
}