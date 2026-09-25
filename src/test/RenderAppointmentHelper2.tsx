import { QueryClientProvider } from "@tanstack/react-query";
import { QueryClient } from "@tanstack/react-query";
import { render } from "@testing-library/react";

import AppointmentForm from "../components/AppointmentForm";
import { AppointmentsProbe2 } from "./AppointmentsProbe2";
import type { Patient } from "../types/patient";

export function RenderAppointmentHelper2(patients: Patient[])
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
                <AppointmentsProbe2 />
            </>
        </QueryClientProvider>
    );
    return {
        ...result,
        queryClient,
    }
}