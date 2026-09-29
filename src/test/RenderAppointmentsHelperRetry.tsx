import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Appointment } from "../types/appointment";
import type { Patient } from "../types/patient";
import AppointmentForm from "../components/AppointmentForm";
import { AppointmentsProbe } from "./AppointmentsProbe";
import { render } from "@testing-library/react";

export function RenderAppointmentHelperRetry(
    patients: Patient[],
    fetchAppointments: () => Promise<Appointment[]>
)
{
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: 1,
                retryDelay: 0,
            },
        },
    });

    const result = render(
        <QueryClientProvider client={queryClient}>
            <>
                <AppointmentForm patients={patients} />
                <AppointmentsProbe
                    fetchAppointments={fetchAppointments}
                />
            </>
        </QueryClientProvider>
    );

    return {
        ...result,
        queryClient,
    };
}