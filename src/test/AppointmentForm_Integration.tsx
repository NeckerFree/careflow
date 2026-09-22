
import { beforeEach, describe, expect, it, vi } from "vitest";
import
{
    createAppointmentAction
} from "../components/AppointmentForm";
import type { Patient } from "../types/patient";
import type { AppointmentFormState } from "../types/AppointmentFormState";
import type { FormValues } from "../types/AppointmentFormInput";
import { createAppointment } from "../api/patientsApi";
import { QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient();
describe("createAppointmentAction", () =>
{
    it("returns validation-error when form parsing fails", async () => 
    {
        // Arrange
        const formData = new FormData();
        formData.set("patientId", "abc");
        formData.set("date", "2026-10-01");
        formData.set("time", "10:30");
        formData.set("reason", "Routine checkup");
        const initialState: AppointmentFormState<FormValues> = {
            status: "idle",
            values: {
                patientId: "",
                date: "",
                time: "",
                reason: "",
            },
        };
        const patients: Patient[] = [{
            id: 1,
            firstName: "Elio",
            lastName: "Cortes",
            dateOfBirth: "1968-10-20",
            status: "active",
        }];
        // Act
        const result = await createAppointmentAction(
            patients,
            queryClient,
            initialState,
            formData
        );

        // Assert
        expect(result.status).toBe("validation-error");

        if (result.status === "validation-error")
        {
            expect(result.fieldErrors.patientId).toBe("Patient ID must be a positive integer.");

            expect(result.values).toEqual({
                patientId: "abc",
                date: "2026-10-01",
                time: "10:30",
                reason: "Routine checkup",
            });
        }
    });
});

describe("createAppointmentAction", () =>
{
    it("returns validation-error when appointment validation fails", async () =>
    {
        // Arrange
        const formData = new FormData();
        formData.set("patientId", "999");
        formData.set("date", "2026-10-01");
        formData.set("time", "10:30");
        formData.set("reason", "Routine checkup");
        const initialState: AppointmentFormState<FormValues> = {
            status: "idle",
            values: {
                patientId: "",
                date: "",
                time: "",
                reason: "",
            },
        };
        const patients: Patient[] = [{
            id: 1,
            firstName: "Elio",
            lastName: "Cortes",
            dateOfBirth: "1968-10-20",
            status: "active",
        }];
        // Act
        const result = await createAppointmentAction(
            patients,
            queryClient,
            initialState,
            formData
        );
        // Assert
        expect(result.status).toBe("validation-error");

        if (result.status === "validation-error")
        {
            expect(result.fieldErrors.patientId).toBe("Select a valid patient.");

            expect(result.values).toEqual({
                patientId: "999",
                date: "2026-10-01",
                time: "10:30",
                reason: "Routine checkup",
            });
        }
    });
});
describe("createAppointmentAction", () =>
{
    it("creates an appointment and returns success", async () =>
    {
        // Arrange
        const formData = new FormData();
        formData.set("patientId", "1");
        formData.set("date", "2026-10-01");
        formData.set("time", "10:30");
        formData.set("reason", "Routine checkup");
        const EMPTY_FORM_VALUES: FormValues = {
            patientId: "",
            date: "",
            time: "",
            reason: "",
        };
        const initialState: AppointmentFormState<FormValues> = {
            status: "idle",
            values: EMPTY_FORM_VALUES,
        };
        beforeEach(() =>
        {
            vi.clearAllMocks();
        });
        vi.mocked(createAppointment).mockResolvedValue(
            {} as Awaited<ReturnType<typeof createAppointment>>);

        vi.mocked(queryClient.invalidateQueries).mockResolvedValue(undefined);
        const patients: Patient[] = [{
            id: 1,
            firstName: "name",
            lastName: "last",
            dateOfBirth: "1970-01-01",
            status: "active",
        }];
        // Act
        const result = await createAppointmentAction(
            patients,
            queryClient,
            initialState,
            formData
        );
        // Assert
        expect(result.status).toBe("success");

        expect(result.values).toEqual(EMPTY_FORM_VALUES);
        expect(createAppointment).toHaveBeenCalledWith({
            patientId: 1,
            date: "2026-10-01",
            time: "10:30",
            reason: "Routine checkup",
        });
        expect(createAppointment).toHaveBeenCalledTimes(1);
        expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
            queryKey: ["appointments"],
        });
        expect(queryClient.invalidateQueries).toHaveBeenCalledTimes(1);
    });
});

describe("createAppointmentAction", () =>
{
    beforeEach(() =>
    {
        vi.clearAllMocks();
    });
    it("returns api-error when appointment creation fail", async () =>
    {
        // Arrange
        const formData = new FormData();
        formData.set("patientId", "1");
        formData.set("date", "2026-10-01");
        formData.set("time", "10:30");
        formData.set("reason", "Routine checkup");
        const EMPTY_FORM_VALUES: FormValues = {
            patientId: "",
            date: "",
            time: "",
            reason: "",
        };
        const initialState: AppointmentFormState<FormValues> = {
            status: "idle",
            values: EMPTY_FORM_VALUES,
        };
        const patients: Patient[] = [{
            id: 1,
            firstName: "Elio",
            lastName: "Cortes",
            dateOfBirth: "1968-10-20",
            status: "active",
        }];
        vi.mocked(createAppointment).mockRejectedValue(new Error("API failure"));

        vi.mocked(queryClient.invalidateQueries).mockResolvedValue(undefined);

        // Act
        const result = await createAppointmentAction(
            patients,
            queryClient,
            initialState,
            formData
        );
        // Assert
        expect(result.status).toBe("api-error");
        if (result.status === "api-error")
        {
            expect(result.formError).toBe("Failed to create appointment. Please try again.");
            expect(result.errorCode).toBe("CONFLICT");
        }

        expect(result.values).toEqual({
            patientId: "1",
            date: "2026-10-01",
            time: "10:30",
            reason: "Routine checkup",
        });
        expect(createAppointment).toHaveBeenCalledWith({
            patientId: 1,
            date: "2026-10-01",
            time: "10:30",
            reason: "Routine checkup",
        });
        expect(createAppointment).toHaveBeenCalledTimes(1);

        expect(queryClient.invalidateQueries).toHaveBeenCalledTimes(0);
    });
});