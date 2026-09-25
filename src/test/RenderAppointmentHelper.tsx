import { QueryClientProvider } from "@tanstack/react-query";
import { QueryClient } from "@tanstack/react-query";
import { render } from "@testing-library/react";

import AppointmentForm from "../components/AppointmentForm";
import { AppointmentsProbe } from "./AppointmentsProbe";
import type { Patient } from "../types/patient";

export function RenderAppointmentHelper(patients: Patient[])
{
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });

    const result = render(
        <QueryClientProvider client={queryClient}>
            <>
                <AppointmentForm patients={patients} />
                <AppointmentsProbe />
            </>
        </QueryClientProvider>
    );
    return {
        ...result,
        queryClient,
    }
}