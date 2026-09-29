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
        isFetching,
        isRefetching,
    }
        = useQuery({
            queryKey: ["appointments"],
            queryFn: fetchAppointments,
        });

    return (
        <>
            <div data-testid="appointments-count">
                {data.length}
            </div>
            {isError &&
                <p role="alert">
                    Failed to load appointments.
                </p>
            }
            {isLoading && (
                <p
                    role="status"
                    data-testid="appointments-loading"
                >
                    Loading appointments...
                </p>
            )}
            {isFetching && (
                <p
                    role="status"
                    data-testid="appointments-fetching"
                >
                    Fetching appointments...
                </p>
            )}
            {isRefetching && (
                <p role="status"
                    data-testid="appointments-updating"
                >
                    Updating appointments...
                </p>
            )}
            <button type="button" onClick={() => refetch()}>
                Retry
            </button>
        </>
    );
}