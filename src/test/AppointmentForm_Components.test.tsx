import { describe, expect, it, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import AppointmentForm from "../components/AppointmentForm";
import { createAppointment } from "../api/patientsApi";
import
{
    QueryClient,
    QueryClientProvider,
} from "@tanstack/react-query";
import type { Patient } from "../types/patient";
import { RenderAppointmentHelper } from "./RenderAppointmentsHelper";
import type { Appointment } from "../types/appointment";
import { RenderAppointmentHelperRetry } from "./RenderAppointmentsHelperRetry";

vi.mock("../api/patientsApi", () => ({
    createAppointment: vi.fn(),
}));

function renderAppointmentForm(patients: Patient[])
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
            <AppointmentForm patients={patients} />
        </QueryClientProvider>
    );
    return {
        ...result,
        queryClient,
    }
}

afterEach(() =>
{
    cleanup();
    vi.clearAllMocks();
});
describe("AppointmentForm", () =>
{
    const patients: Patient[] = [
        {
            id: 1,
            firstName: "John",
            lastName: "Doe",
            dateOfBirth: "1990-01-01",
            status: "active",
        },
    ];
    it("renders the appointment form", () =>
    {
        // Arrange

        // Act
        renderAppointmentForm(patients);

        // Assert
        expect(
            screen.getByRole("heading", {
                name: /schedule appointment/i,
            })
        ).toBeInTheDocument();
    });

    it("renders the patient selector", () =>
    {
        // Arrange

        //Act
        renderAppointmentForm(patients);

        const patientSelector = screen.getByRole("combobox", {
            name: /select patient/i,
        });
        //Assert 
        expect(patientSelector).toBeInTheDocument();

        expect(screen.getByRole("option", { name: /John Doe/i, })).toBeInTheDocument();
        expect(patientSelector).toBeRequired();
    });

    it("renders the inputs", () =>
    {
        //Arrange

        //Act
        renderAppointmentForm(patients);

        //Assert
        const dateInput = screen.getByLabelText(/date/i);
        expect(dateInput).toBeInTheDocument();
        expect(dateInput).toBeRequired();

        const timeInput = screen.getByLabelText(/time/i);
        expect(timeInput).toBeInTheDocument();
        expect(timeInput).toBeRequired();

        const reasonInput = screen.getByLabelText(/reason/i);
        expect(reasonInput).toBeInTheDocument();
        expect(reasonInput).toBeRequired();

    });
    it("allows the user to select a patient", async () =>
    {
        const user = userEvent.setup();

        renderAppointmentForm(patients);

        const patientSelector = screen.getByRole("combobox", {
            name: /select patient/i,
        });

        await user.selectOptions(patientSelector, "1");

        expect(patientSelector).toHaveValue("1");
    });
    it("allows the user to fill out the appointment form", async () =>
    {
        const user = userEvent.setup();

        renderAppointmentForm(patients);

        await user.selectOptions(
            screen.getByRole("combobox", {
                name: /select patient/i,
            }),
            "1"
        );

        const dateInput = screen.getByLabelText(/date/i);
        const timeInput = screen.getByLabelText(/time/i);
        const reasonInput = screen.getByLabelText(/reason/i);

        fireEvent.change(dateInput, {
            target: { value: "2026-10-01" },
        });
        await user.type(timeInput, "10:30");
        await user.type(reasonInput, "Annual checkup");

        expect(dateInput).toHaveValue("2026-10-01");
        expect(timeInput).toHaveValue("10:30");
        expect(reasonInput).toHaveValue("Annual checkup");
    });
    it("submits the appointment form successfully", async () =>
    {
        const user = userEvent.setup();

        vi.mocked(createAppointment).mockResolvedValue(
            undefined as never
        );

        renderAppointmentForm(patients);

        const patientSelector = screen.getByRole("combobox", {
            name: /select patient/i,
        });

        const dateInput = screen.getByLabelText(/date/i);
        const timeInput = screen.getByLabelText(/time/i);
        const reasonInput = screen.getByLabelText(/reason/i);

        await user.selectOptions(patientSelector, "1");

        fireEvent.change(dateInput, {
            target: { value: "2026-10-01" },
        });

        await user.type(timeInput, "10:30");
        await user.type(reasonInput, "Annual checkup");

        await user.click(
            screen.getByRole("button", {
                name: /schedule appointment/i,
            })
        );

        await waitFor(() =>
        {
            expect(screen.getByRole("status")).toHaveTextContent(
                "Schedule created!"
            );
        });

        expect(createAppointment).toHaveBeenCalledWith({
            patientId: 1,
            date: "2026-10-01",
            time: "10:30",
            reason: "Annual checkup",
        });
    });
    it("displays an error when appointment creation fails", async () =>
    {
        const user = userEvent.setup();

        vi.mocked(createAppointment).mockRejectedValue(
            new Error("API failure")
        );

        renderAppointmentForm(patients);

        const patientSelector = screen.getByRole("combobox", {
            name: /select patient/i,
        });

        const dateInput = screen.getByLabelText(/date/i);
        const timeInput = screen.getByLabelText(/time/i);
        const reasonInput = screen.getByLabelText(/reason/i);

        await user.selectOptions(patientSelector, "1");

        fireEvent.change(dateInput, {
            target: { value: "2026-10-01" },
        });

        await user.type(timeInput, "10:30");
        await user.type(reasonInput, "Annual checkup");

        await user.click(
            screen.getByRole("button", {
                name: /schedule appointment/i,
            })
        );
        await waitFor(() =>
        {
            expect(screen.getByRole("alert")).toHaveTextContent(
                "CONFLICT: Failed to create appointment. Please try again."
            );
        });
    });
    it("displays an error when an invalid patient ID injected", async () =>
    {
        const user = userEvent.setup();

        renderAppointmentForm(patients);

        const patientSelector = screen.getByRole("combobox", {
            name: /select patient/i,
        });

        const dateInput = screen.getByLabelText(/date/i);
        const timeInput = screen.getByLabelText(/time/i);
        const reasonInput = screen.getByLabelText(/reason/i);

        const invalidOption = document.createElement("option");
        invalidOption.value = "999";
        invalidOption.textContent = "Invalid Patient";
        patientSelector.appendChild(invalidOption);

        await user.selectOptions(patientSelector, "999");

        fireEvent.change(dateInput, {
            target: { value: "2026-10-01" },
        });

        await user.type(timeInput, "10:30");
        await user.type(reasonInput, "Annual checkup");

        await user.click(
            screen.getByRole("button", {
                name: /schedule appointment/i,
            })
        );
        await waitFor(() =>
        {
            expect(screen.getByRole("alert")).toHaveTextContent(
                "Select a valid patient."
            );
        });
    });
    it("displays multiple validation errors", async () =>
    {
        const user = userEvent.setup();

        renderAppointmentForm(patients);

        const patientSelector = screen.getByRole("combobox", {
            name: /select patient/i,
        });

        const dateInput = screen.getByLabelText(/date/i);
        const timeInput = screen.getByLabelText(/time/i);
        const reasonInput = screen.getByLabelText(/reason/i);

        const invalidOption = document.createElement("option");
        invalidOption.value = "999";
        invalidOption.textContent = "Invalid Patient";
        patientSelector.appendChild(invalidOption);

        await user.selectOptions(patientSelector, "999");

        fireEvent.change(dateInput, {
            target: { value: "2026-10-01" },
        });

        await user.type(timeInput, "10:30");
        await user.type(reasonInput, "    ");

        await user.click(
            screen.getByRole("button", {
                name: /schedule appointment/i,
            })
        );

        await waitFor(() =>
        {
            const alerts = screen.getAllByRole("alert");

            expect(alerts).toHaveLength(2);

            expect(alerts).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        textContent: "Select a valid patient.",
                    }),
                    expect.objectContaining({
                        textContent:
                            "Reason must contain at least 3 non-whitespace characters",
                    }),
                ])
            );
        });
        expect(patientSelector).toHaveValue("999");
        expect(dateInput).toHaveValue("2026-10-01");
        expect(timeInput).toHaveValue("10:30");
        expect(reasonInput).toHaveValue("");
    });
    it("clears the form after successful submission", async () =>
    {
        const user = userEvent.setup();

        vi.mocked(createAppointment).mockResolvedValue(
            undefined as never
        );

        renderAppointmentForm(patients);

        const patientSelector = screen.getByRole("combobox", {
            name: /select patient/i,
        });

        const dateInput = screen.getByLabelText(/date/i);
        const timeInput = screen.getByLabelText(/time/i);
        const reasonInput = screen.getByLabelText(/reason/i);

        await user.selectOptions(patientSelector, "1");

        fireEvent.change(dateInput, {
            target: { value: "2026-10-01" },
        });

        await user.type(timeInput, "10:30");
        await user.type(reasonInput, "Annual checkup");

        await user.click(
            screen.getByRole("button", {
                name: /schedule appointment/i,
            })
        );

        await waitFor(() =>
        {
            expect(screen.getByRole("status")).toHaveTextContent(
                "Schedule created!"
            );
        });

        expect(patientSelector).toHaveValue("");
        expect(dateInput).toHaveValue("");
        expect(timeInput).toHaveValue("");
        expect(reasonInput).toHaveValue("");
    });
    it("disables the submit button while the appointment is being created", async () =>
    {
        const user = userEvent.setup();

        let resolveRequest!: () => void;

        vi.mocked(createAppointment).mockImplementation(
            () =>
                new Promise((resolve) =>
                {
                    resolveRequest = () => resolve(undefined as never);
                })
        );

        renderAppointmentForm(patients);

        const patientSelector = screen.getByRole("combobox", {
            name: /select patient/i,
        });

        const dateInput = screen.getByLabelText(/date/i);
        const timeInput = screen.getByLabelText(/time/i);
        const reasonInput = screen.getByLabelText(/reason/i);

        await user.selectOptions(patientSelector, "1");

        fireEvent.change(dateInput, {
            target: { value: "2026-10-01" },
        });

        await user.type(timeInput, "10:30");
        await user.type(reasonInput, "Annual checkup");

        const submitButton = screen.getByRole("button", {
            name: /schedule appointment/i,
        });

        expect(submitButton).toBeEnabled();

        await user.click(submitButton);

        const pendingButton = await screen.findByRole("button", {
            name: /scheduling/i,
        });

        expect(pendingButton).toBeDisabled();

        resolveRequest();

        await waitFor(() =>
        {
            expect(
                screen.getByRole("status")
            ).toHaveTextContent("Schedule created!");
        });
    });

    it("prevents duplicate submissions while pending", async () =>
    {
        const user = userEvent.setup();

        let resolveRequest!: () => void;

        vi.mocked(createAppointment).mockImplementation(
            () =>
                new Promise((resolve) =>
                {
                    resolveRequest = () => resolve(undefined as never);
                })
        );

        renderAppointmentForm(patients);

        const patientSelector = screen.getByRole("combobox", {
            name: /select patient/i,
        });

        const dateInput = screen.getByLabelText(/date/i);
        const timeInput = screen.getByLabelText(/time/i);
        const reasonInput = screen.getByLabelText(/reason/i);

        await user.selectOptions(patientSelector, "1");

        fireEvent.change(dateInput, {
            target: { value: "2026-10-01" },
        });

        await user.type(timeInput, "10:30");
        await user.type(reasonInput, "Annual checkup");

        const submitButton = screen.getByRole("button", {
            name: /schedule appointment/i,
        });

        expect(submitButton).toBeEnabled();

        await user.click(submitButton);

        const pendingButton = await screen.findByRole("button", {
            name: /scheduling/i,
        });

        expect(pendingButton).toBeDisabled();
        await user.click(pendingButton);
        resolveRequest();

        await waitFor(() =>
        {
            expect(
                screen.getByRole("status")
            ).toHaveTextContent("Schedule created!");
            expect(createAppointment).toHaveBeenCalledTimes(1);
        });
    });

    it("validates semantically associated with the field it describes", async () =>
    {
        const user = userEvent.setup();

        renderAppointmentForm(patients);

        const patientSelector = screen.getByRole("combobox", {
            name: /select patient/i,
        });

        const dateInput = screen.getByLabelText(/date/i);
        const timeInput = screen.getByLabelText(/time/i);
        const reasonInput = screen.getByLabelText(/reason/i);

        const invalidOption = document.createElement("option");
        invalidOption.value = "999";
        invalidOption.textContent = "Invalid Patient";
        patientSelector.appendChild(invalidOption);

        await user.selectOptions(patientSelector, "999");

        fireEvent.change(dateInput, {
            target: { value: "2026-10-01" },
        });

        await user.type(timeInput, "10:30");
        await user.type(reasonInput, "    ");

        const submitButton = screen.getByRole("button", {
            name: /schedule appointment/i,
        });

        await user.click(submitButton);

        await waitFor(() =>
        {
            expect(reasonInput).toHaveAttribute(
                "aria-invalid",
                "true"
            );
            expect(reasonInput).toHaveAttribute(
                "aria-describedby",
                "reason-error"
            );
            expect(reasonInput).toHaveAccessibleDescription(
                "Reason must contain at least 3 non-whitespace characters"
            );

            expect(patientSelector).toHaveAttribute(
                "aria-invalid",
                "true"
            );
            expect(patientSelector).toHaveAttribute(
                "aria-describedby",
                "patientId-error"
            );
            expect(patientSelector).toHaveAccessibleDescription(
                "Select a valid patient."
            );

            expect(dateInput).not.toHaveAttribute("aria-describedby");
            expect(timeInput).not.toHaveAttribute("aria-describedby");
        });
    });
    it("exposes API errors as a form-level accessible alert", async () =>
    {
        const user = userEvent.setup();

        vi.mocked(createAppointment).mockRejectedValue(
            new Error("API failure")
        );

        renderAppointmentForm(patients);

        const patientSelector = screen.getByRole("combobox", {
            name: /select patient/i,
        });

        const dateInput = screen.getByLabelText(/date/i);
        const timeInput = screen.getByLabelText(/time/i);
        const reasonInput = screen.getByLabelText(/reason/i);

        await user.selectOptions(patientSelector, "1");

        fireEvent.change(dateInput, {
            target: { value: "2026-10-01" },
        });

        await user.type(timeInput, "10:30");
        await user.type(reasonInput, "Routine appointment");

        const submitButton = screen.getByRole("button", {
            name: /schedule appointment/i,
        });

        await user.click(submitButton);

        const alert = await screen.findByRole("alert");

        expect(alert).toHaveTextContent(
            "CONFLICT: Failed to create appointment. Please try again."
        );

        expect(alert).toBeVisible();

        expect(patientSelector).not.toHaveAttribute("aria-describedby");
        expect(dateInput).not.toHaveAttribute("aria-describedby");
        expect(timeInput).not.toHaveAttribute("aria-describedby");
        expect(reasonInput).not.toHaveAttribute("aria-describedby");
    });

    it("supports logical keyboard navigation through the appointment form", async () =>
    {
        const user = userEvent.setup();
        renderAppointmentForm(patients);
        const patientSelector = screen.getByRole("combobox", {
            name: /select patient/i,
        });

        const dateInput = screen.getByLabelText(/date/i);

        const timeInput = screen.getByLabelText(/time/i);

        const reasonInput = screen.getByLabelText(/reason/i);

        const submitButton = screen.getByRole("button", {
            name: /schedule appointment/i,
        });

        document.body.focus();
        await user.tab();
        expect(document.activeElement).toBe(patientSelector);
        await user.tab();
        expect(document.activeElement).toBe(dateInput);
        await user.tab();
        expect(document.activeElement).toBe(timeInput);
        await user.tab();
        expect(document.activeElement).toBe(reasonInput);
        await user.tab();
        expect(document.activeElement).toBe(submitButton);
    });

    it("submits the appointment form using the keyboard", async () =>
    {
        const user = userEvent.setup();
        renderAppointmentForm(patients);
        const patientSelector = screen.getByRole("combobox", {
            name: /select patient/i,
        });

        const dateInput = screen.getByLabelText(/date/i);

        const timeInput = screen.getByLabelText(/time/i);

        const reasonInput = screen.getByLabelText(/reason/i);

        const submitButton = screen.getByRole("button", {
            name: /schedule appointment/i,
        });

        const invalidOption = document.createElement("option");
        invalidOption.value = "999";
        invalidOption.textContent = "Invalid Patient";
        patientSelector.appendChild(invalidOption);
        await user.selectOptions(patientSelector, "999");

        fireEvent.change(dateInput, {
            target: { value: "2026-10-01" },
        });
        await user.type(timeInput, "10:30");
        await user.type(reasonInput, "    ");

        await user.tab();

        expect(document.activeElement).toBe(submitButton);
        await user.keyboard("{Enter}");
        expect(
            await screen.findByText("Select a valid patient.")
        ).toBeVisible();

        expect(
            await screen.findByText(
                "Reason must contain at least 3 non-whitespace characters"
            )
        ).toBeVisible();
    });

    it("moves focus to the first invalid field after validation fails", async () =>
    {
        const user = userEvent.setup();
        renderAppointmentForm(patients);
        const patientSelector = screen.getByRole("combobox", {
            name: /select patient/i,
        });

        const dateInput = screen.getByLabelText(/date/i);

        const timeInput = screen.getByLabelText(/time/i);

        const reasonInput = screen.getByLabelText(/reason/i);

        const submitButton = screen.getByRole("button", {
            name: /schedule appointment/i,
        });

        const invalidOption = document.createElement("option");
        invalidOption.value = "999";
        invalidOption.textContent = "Invalid Patient";
        patientSelector.appendChild(invalidOption);
        await user.selectOptions(patientSelector, "999");

        fireEvent.change(dateInput, {
            target: { value: "2026-10-01" },
        });
        await user.type(timeInput, "10:30");
        await user.type(reasonInput, "    ");

        await user.tab();

        expect(document.activeElement).toBe(submitButton);

        await user.keyboard("{Enter}");
        await waitFor(() =>
        {
            expect(document.activeElement).toBe(patientSelector);
        });
    });
    it("moves focus to the form-level alert after API failure", async () =>
    {
        const user = userEvent.setup();
        vi.mocked(createAppointment).mockRejectedValue(
            new Error("API failure")
        );
        renderAppointmentForm(patients);
        const patientSelector = screen.getByRole("combobox", {
            name: /select patient/i,
        });

        const dateInput = screen.getByLabelText(/date/i);

        const timeInput = screen.getByLabelText(/time/i);

        const reasonInput = screen.getByLabelText(/reason/i);

        const submitButton = screen.getByRole("button", {
            name: /schedule appointment/i,
        });

        await user.selectOptions(patientSelector, "1");

        fireEvent.change(dateInput, {
            target: { value: "2026-10-01" },
        });
        await user.type(timeInput, "10:30");
        await user.type(reasonInput, "Routine appointment");

        await user.tab();

        expect(document.activeElement).toBe(submitButton);

        await user.keyboard("{Enter}");
        const alert = await screen.findByRole("alert");

        await waitFor(() =>
        {
            expect(document.activeElement).toBe(alert);
        });
    });
    it("exposes the pending submission as an accessible status", async () =>
    {
        const user = userEvent.setup();

        let resolveRequest!: () => void;

        vi.mocked(createAppointment).mockImplementation(
            () =>
                new Promise(resolve =>
                {
                    resolveRequest = () => resolve(undefined as never);
                })
        );

        renderAppointmentForm(patients);

        const patientSelector = screen.getByRole("combobox", {
            name: /select patient/i,
        });

        const dateInput = screen.getByLabelText(/date/i);
        const timeInput = screen.getByLabelText(/time/i);
        const reasonInput = screen.getByLabelText(/reason/i);

        await user.selectOptions(patientSelector, "1");

        fireEvent.change(dateInput, {
            target: { value: "2026-10-01" },
        });

        await user.type(timeInput, "10:30");
        await user.type(reasonInput, "Routine appointment");

        const submitButton = screen.getByRole("button", {
            name: /schedule appointment/i,
        });

        await user.click(submitButton);

        const status = await screen.findByRole("status");

        expect(status).toHaveTextContent(
            "Scheduling appointment..."
        );

        expect(status).toHaveAttribute(
            "aria-live",
            "polite"
        );

        resolveRequest();

        await screen.findByText("Schedule created!");
    });
    it("announces successful submission as an accessible status", async () =>
    {
        const user = userEvent.setup();

        let resolveRequest!: () => void;

        vi.mocked(createAppointment).mockImplementation(
            () =>
                new Promise(resolve =>
                {
                    resolveRequest = () => resolve(undefined as never);
                })
        );

        renderAppointmentForm(patients);

        const patientSelector = screen.getByRole("combobox", {
            name: /select patient/i,
        });

        const dateInput = screen.getByLabelText(/date/i);
        const timeInput = screen.getByLabelText(/time/i);
        const reasonInput = screen.getByLabelText(/reason/i);

        await user.selectOptions(patientSelector, "1");

        fireEvent.change(dateInput, {
            target: { value: "2026-10-01" },
        });

        await user.type(timeInput, "10:30");
        await user.type(reasonInput, "Routine appointment");

        const submitButton = screen.getByRole("button", {
            name: /schedule appointment/i,
        });

        await user.click(submitButton);

        resolveRequest();

        await screen.findByText("Schedule created!");
        const status = screen.getByRole("status");
        expect(status).toHaveTextContent(
            "Schedule created!"
        );
        expect(status).toHaveAttribute(
            "aria-live",
            "polite"
        );
    });

    it("announces API failure after pending submission", async () =>
    {
        const user = userEvent.setup();
        let rejectRequest!: (reason?: unknown) => void;

        vi.mocked(createAppointment).mockImplementation(
            () =>
                new Promise((_, reject) =>
                {
                    rejectRequest = reject;
                })
        );
        renderAppointmentForm(patients);

        const patientSelector = screen.getByRole("combobox", {
            name: /select patient/i,
        });

        const dateInput = screen.getByLabelText(/date/i);
        const timeInput = screen.getByLabelText(/time/i);
        const reasonInput = screen.getByLabelText(/reason/i);

        await user.selectOptions(patientSelector, "1");

        fireEvent.change(dateInput, {
            target: { value: "2026-10-01" },
        });

        await user.type(timeInput, "10:30");
        await user.type(reasonInput, "Routine appointment");

        const submitButton = screen.getByRole("button", {
            name: /schedule appointment/i,
        });

        await user.click(submitButton);

        const pendingStatus = await screen.findByRole("status");

        expect(pendingStatus).toHaveTextContent(
            "Scheduling appointment..."
        );
        rejectRequest(new Error("API failure"));
        const alert = await screen.findByRole("alert");

        expect(alert).toHaveTextContent(
            "CONFLICT: Failed to create appointment. Please try again."
        );
        await waitFor(() =>
        {
            expect(document.activeElement).toBe(alert);
            expect(
                screen.queryByText("Scheduling appointment...")
            ).not.toBeInTheDocument();
        });
    });
    it("replaces the pending status with the success status", async () =>
    {
        const user = userEvent.setup();

        let resolveRequest!: () => void;

        vi.mocked(createAppointment).mockImplementation(
            () =>
                new Promise(resolve =>
                {
                    resolveRequest = () => resolve(undefined as never);
                })
        );

        renderAppointmentForm(patients);

        const patientSelector = screen.getByRole("combobox", {
            name: /select patient/i,
        });

        const dateInput = screen.getByLabelText(/date/i);
        const timeInput = screen.getByLabelText(/time/i);
        const reasonInput = screen.getByLabelText(/reason/i);

        await user.selectOptions(patientSelector, "1");

        fireEvent.change(dateInput, {
            target: { value: "2026-10-01" },
        });

        await user.type(timeInput, "10:30");
        await user.type(reasonInput, "Routine appointment");

        const submitButton = screen.getByRole("button", {
            name: /schedule appointment/i,
        });

        await user.click(submitButton);

        expect(
            await screen.findByText("Scheduling appointment...")
        ).toBeInTheDocument();

        resolveRequest();

        await waitFor(() =>
        {
            expect(
                screen.getByRole("status")
            ).toHaveTextContent("Schedule created!");
            expect(
                screen.queryByText("Scheduling appointment...")
            ).not.toBeInTheDocument();
        });
        const statuses = screen.getAllByRole("status");

        expect(statuses).toHaveLength(1);

        expect(statuses[0]).toHaveTextContent(
            "Schedule created!"
        );
    });
    it("recovers from an API error and succeeds on retry", async () =>
    {
        const user = userEvent.setup();
        let requestCount = 0;

        vi.mocked(createAppointment).mockImplementation(async () =>
        {
            requestCount++;

            if (requestCount === 1)
            {
                throw new Error("API failure");
            }

            return undefined as never;
        });

        renderAppointmentForm(patients);

        const patientSelector = screen.getByRole("combobox", {
            name: /select patient/i,
        });

        const dateInput = screen.getByLabelText(/date/i);
        const timeInput = screen.getByLabelText(/time/i);
        const reasonInput = screen.getByLabelText(/reason/i);

        await user.selectOptions(patientSelector, "1");

        fireEvent.change(dateInput, {
            target: { value: "2026-10-01" },
        });

        await user.type(timeInput, "10:30");
        await user.type(reasonInput, "Routine appointment");
        const submitButton = screen.getByRole("button", {
            name: /schedule appointment/i,
        });

        await user.click(submitButton);

        const alert = await screen.findByRole("alert");

        expect(alert).toHaveTextContent(
            "CONFLICT: Failed to create appointment. Please try again."
        );
        expect(patientSelector).toHaveValue("1");
        expect(dateInput).toHaveValue("2026-10-01");
        expect(timeInput).toHaveValue("10:30");
        expect(reasonInput).toHaveValue("Routine appointment");

        await user.click(submitButton);

        const successStatus = await screen.findByRole("status");
        expect(successStatus).toHaveTextContent("Schedule created!");
        expect(
            screen.queryByText(
                "CONFLICT: Failed to create appointment. Please try again."
            )
        ).not.toBeInTheDocument();
        expect(patientSelector).toHaveValue("");
        expect(dateInput).toHaveValue("");
        expect(timeInput).toHaveValue("");
        expect(reasonInput).toHaveValue("");
        const statuses = screen.getAllByRole("status");

        expect(statuses).toHaveLength(1);
        expect(statuses[0]).toHaveTextContent("Schedule created!");
    });
    it("recovers from validation errors and succeeds on retry", async () =>
    {
        const user = userEvent.setup();

        vi.mocked(createAppointment).mockImplementation(async () => { return undefined as never; });

        renderAppointmentForm(patients);

        const patientSelector = screen.getByRole("combobox", {
            name: /select patient/i,
        });

        const dateInput = screen.getByLabelText(/date/i);
        const timeInput = screen.getByLabelText(/time/i);
        const reasonInput = screen.getByLabelText(/reason/i);

        const invalidOption = document.createElement("option");
        invalidOption.value = "999";
        invalidOption.textContent = "Invalid Patient";
        patientSelector.appendChild(invalidOption);
        await user.selectOptions(patientSelector, "999");

        fireEvent.change(dateInput, {
            target: { value: "2026-10-01" },
        });

        await user.type(timeInput, "10:30");
        await user.type(reasonInput, "     ");
        const submitButton = screen.getByRole("button", {
            name: /schedule appointment/i,
        });

        await user.click(submitButton);

        await waitFor(() =>
        {
            const alerts = screen.getAllByRole("alert");

            expect(alerts).toHaveLength(2);

            expect(alerts).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        textContent: "Select a valid patient.",
                    }),
                    expect.objectContaining({
                        textContent:
                            "Reason must contain at least 3 non-whitespace characters",
                    }),
                ])
            );
        });
        expect(createAppointment).not.toHaveBeenCalled();
        await user.selectOptions(patientSelector, "1");
        await user.type(reasonInput, "Routine appointment");

        await user.click(submitButton);
        await waitFor(() =>
        {
            expect(
                screen.getByRole("status")
            ).toHaveTextContent("Schedule created!");
        });

        expect(patientSelector).toHaveValue("");
        expect(dateInput).toHaveValue("");
        expect(timeInput).toHaveValue("");
        expect(reasonInput).toHaveValue("");
        expect(
            screen.queryByText(
                "CONFLICT: Failed to create appointment. Please try again."
            )
        ).not.toBeInTheDocument();
    });
    it("replaces stale validation errors on a new submission", async () =>
    {
        const user = userEvent.setup();

        vi.mocked(createAppointment).mockImplementation(async () => { return undefined as never; });

        renderAppointmentForm(patients);

        const patientSelector = screen.getByRole("combobox", {
            name: /select patient/i,
        });

        const dateInput = screen.getByLabelText(/date/i);
        const timeInput = screen.getByLabelText(/time/i);
        const reasonInput = screen.getByLabelText(/reason/i);

        const invalidOption = document.createElement("option");
        invalidOption.value = "999";
        invalidOption.textContent = "Invalid Patient";
        patientSelector.appendChild(invalidOption);
        await user.selectOptions(patientSelector, "999");

        fireEvent.change(dateInput, {
            target: { value: "2026-10-01" },
        });

        await user.type(timeInput, "10:30");
        await user.type(reasonInput, "     ");
        const submitButton = screen.getByRole("button", {
            name: /schedule appointment/i,
        });

        await user.click(submitButton);

        await waitFor(() =>
        {
            const alerts = screen.getAllByRole("alert");

            expect(alerts).toHaveLength(2);

            expect(alerts).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        textContent: "Select a valid patient.",
                    }),
                    expect.objectContaining({
                        textContent:
                            "Reason must contain at least 3 non-whitespace characters",
                    }),
                ])
            );
        });
        await user.selectOptions(patientSelector, "1");
        await user.type(reasonInput, "     ");
        await user.click(submitButton);
        await waitFor(() =>
        {
            const alerts = screen.getAllByRole("alert");

            expect(alerts).toHaveLength(1);

            expect(alerts).toEqual(
                expect.arrayContaining([
                    expect.not.objectContaining({
                        textContent: "Select a valid patient.",
                    }),
                    expect.objectContaining({
                        textContent:
                            "Reason must contain at least 3 non-whitespace characters",
                    }),
                ])
            );
        });
        expect(createAppointment).not.toHaveBeenCalled();
    });
    it("clears the previous API error when a new submission starts", async () =>
    {
        const user = userEvent.setup();
        let requestCount = 0;
        let resolveRequest!: () => void;
        vi.mocked(createAppointment).mockImplementation(async () =>
        {
            requestCount++;

            if (requestCount === 1)
            {
                throw new Error("API failure");
            }

            return new Promise(resolve =>
            {
                resolveRequest = () => resolve(undefined as never);
            })
        });

        renderAppointmentForm(patients);

        const patientSelector = screen.getByRole("combobox", {
            name: /select patient/i,
        });

        const dateInput = screen.getByLabelText(/date/i);
        const timeInput = screen.getByLabelText(/time/i);
        const reasonInput = screen.getByLabelText(/reason/i);

        await user.selectOptions(patientSelector, "1");

        fireEvent.change(dateInput, {
            target: { value: "2026-10-01" },
        });

        await user.type(timeInput, "10:30");
        await user.type(reasonInput, "Routine appointment");
        const submitButton = screen.getByRole("button", {
            name: /schedule appointment/i,
        });

        await user.click(submitButton);

        const alert = await screen.findByRole("alert");

        expect(alert).toHaveTextContent(
            "CONFLICT: Failed to create appointment. Please try again."
        );

        await user.click(submitButton);
        expect(
            await screen.findByText("Scheduling appointment...")
        ).toBeInTheDocument();
        resolveRequest();
        await waitFor(() =>
        {
            expect(
                screen.getByRole("status")
            ).toHaveTextContent("Schedule created!");
            expect(
                screen.queryByText(
                    "CONFLICT: Failed to create appointment. Please try again."
                )
            ).not.toBeInTheDocument();
        });
    });
    it("invalidates appointments after successful creation", async () =>
    {
        const user = userEvent.setup();
        let resolveRequest!: () => void;

        vi.mocked(createAppointment).mockImplementation(
            () =>
                new Promise(resolve =>
                {
                    resolveRequest = () => resolve(undefined as never);
                })
        );
        const { queryClient } = renderAppointmentForm(patients);
        const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

        const patientSelector = screen.getByRole("combobox", {
            name: /select patient/i,
        });

        const dateInput = screen.getByLabelText(/date/i);
        const timeInput = screen.getByLabelText(/time/i);
        const reasonInput = screen.getByLabelText(/reason/i);

        await user.selectOptions(patientSelector, "1");

        fireEvent.change(dateInput, {
            target: { value: "2026-10-01" },
        });

        await user.type(timeInput, "10:30");
        await user.type(reasonInput, "Routine appointment");

        const submitButton = screen.getByRole("button", {
            name: /schedule appointment/i,
        });

        await user.click(submitButton);
        resolveRequest();
        await waitFor(() =>
        {
            expect(
                screen.getByRole("status")
            ).toHaveTextContent("Schedule created!");
            expect(invalidateSpy).toHaveBeenCalledWith({
                queryKey: ["appointments"],
            });
            expect(invalidateSpy).toHaveBeenCalledTimes(1);
        });
    });
    it("does not invalidate appointments when creation fails", async () =>
    {
        const user = userEvent.setup();

        vi.mocked(createAppointment).mockRejectedValue(
            new Error("API failure")
        );

        const { queryClient } = renderAppointmentForm(patients);
        const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

        const patientSelector = screen.getByRole("combobox", {
            name: /select patient/i,
        });

        const dateInput = screen.getByLabelText(/date/i);
        const timeInput = screen.getByLabelText(/time/i);
        const reasonInput = screen.getByLabelText(/reason/i);

        await user.selectOptions(patientSelector, "1");

        fireEvent.change(dateInput, {
            target: { value: "2026-10-01" },
        });

        await user.type(timeInput, "10:30");
        await user.type(reasonInput, "Routine appointment");

        const submitButton = screen.getByRole("button", {
            name: /schedule appointment/i,
        });

        await user.click(submitButton);
        const alert = await screen.findByRole("alert");

        expect(alert).toHaveTextContent(
            "CONFLICT: Failed to create appointment. Please try again."
        );
        expect(invalidateSpy).not.toHaveBeenCalled();

    });
    it("invalidates appointments only after the API succeeds", async () =>
    {
        const user = userEvent.setup();
        const events: string[] = [];

        vi.mocked(createAppointment).mockImplementation(
            async () =>
            {
                events.push("api");
                return undefined as never;
            }
        );
        const { queryClient } = renderAppointmentForm(patients);

        const invalidateSpy = vi.spyOn(
            queryClient,
            "invalidateQueries"
        ).mockImplementation(async () =>
        {
            events.push("invalidate");
        });
        const patientSelector = screen.getByRole("combobox", {
            name: /select patient/i,
        });

        const dateInput = screen.getByLabelText(/date/i);
        const timeInput = screen.getByLabelText(/time/i);
        const reasonInput = screen.getByLabelText(/reason/i);

        await user.selectOptions(patientSelector, "1");

        fireEvent.change(dateInput, {
            target: { value: "2026-10-01" },
        });

        await user.type(timeInput, "10:30");
        await user.type(reasonInput, "Routine appointment");

        const submitButton = screen.getByRole("button", {
            name: /schedule appointment/i,
        });

        await user.click(submitButton);

        expect(events).toEqual([
            "api",
            "invalidate",
        ]);
        expect(invalidateSpy).toHaveBeenCalled();
    });
    it("refetches active appointments after successful creation", async () =>
    {
        const user = userEvent.setup();

        vi.mocked(createAppointment).mockResolvedValue(
            undefined as never
        );
        const fetchAppointments = vi.fn(async () =>
        {
            return [];
        });

        RenderAppointmentHelper(
            patients,
            fetchAppointments
        );

        const patientSelector = screen.getByRole("combobox", {
            name: /select patient/i,
        });

        const dateInput = screen.getByLabelText(/date/i);
        const timeInput = screen.getByLabelText(/time/i);
        const reasonInput = screen.getByLabelText(/reason/i);

        await user.selectOptions(patientSelector, "1");

        fireEvent.change(dateInput, {
            target: { value: "2026-10-01" },
        });

        await user.type(timeInput, "10:30");
        await user.type(reasonInput, "Annual checkup");
        const submitButton = screen.getByRole("button", {
            name: /schedule appointment/i,
        });

        await user.click(submitButton);

        await waitFor(() =>
        {
            expect(
                screen.getByRole("status")
            ).toHaveTextContent("Schedule created!");
            expect(fetchAppointments).toHaveBeenCalledTimes(2);
        });
    });

    it("updates the appointments cache after successful creation", async () =>
    {
        const user = userEvent.setup();
        vi.mocked(createAppointment).mockImplementation(
            async () => { return undefined as never; }
        );
        const initialAppointments: Appointment[] = [
            {
                id: 1,
                patientId: 1,
                date: "2026-09-30",
                time: "09:00",
                status: "scheduled",
                reason: "Initial appointment",
            },
        ];

        const refreshedAppointments: Appointment[] = [
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

        const fetchAppointments = vi.fn(async () =>
        {
            fetchCount++;

            return fetchCount === 1
                ? initialAppointments
                : refreshedAppointments;
        });

        const { queryClient } = RenderAppointmentHelper(
            patients,
            fetchAppointments
        );

        await waitFor(() =>
        {
            expect(fetchAppointments).toHaveBeenCalledTimes(1);
            expect(
                queryClient.getQueryData(["appointments"])
            ).toEqual(initialAppointments);
        });
        const patientSelector = screen.getByRole("combobox", {
            name: /select patient/i,
        });

        const dateInput = screen.getByLabelText(/date/i);
        const timeInput = screen.getByLabelText(/time/i);
        const reasonInput = screen.getByLabelText(/reason/i);

        await user.selectOptions(patientSelector, "1");

        fireEvent.change(dateInput, {
            target: { value: "2026-10-01" },
        });

        await user.type(timeInput, "10:30");
        await user.type(reasonInput, "Annual checkup");

        const submitButton = screen.getByRole("button", {
            name: /schedule appointment/i,
        });

        await user.click(submitButton);
        await screen.findByText("Schedule created!");

        await waitFor(() =>
        {
            expect(fetchAppointments).toHaveBeenCalledTimes(2);
        });

    });
    it("preserves the appointments cache when creation fails", async () =>
    {
        const user = userEvent.setup();
        const initialAppointments: Appointment[] = [
            {
                id: 1,
                patientId: 1,
                date: "2026-09-30",
                time: "09:00",
                status: "scheduled",
                reason: "Initial appointment",
            },
        ];

        const fetchAppointments = vi.fn(async () =>
        {
            return initialAppointments;
        });

        vi.mocked(createAppointment).mockRejectedValue(
            new Error("API failure")
        );

        const { queryClient } = RenderAppointmentHelper(
            patients,
            fetchAppointments
        );

        await waitFor(() =>
        {
            expect(fetchAppointments).toHaveBeenCalledTimes(1);
        });

        const patientSelector = screen.getByRole("combobox", {
            name: /select patient/i,
        });

        const dateInput = screen.getByLabelText(/date/i);
        const timeInput = screen.getByLabelText(/time/i);
        const reasonInput = screen.getByLabelText(/reason/i);

        await user.selectOptions(patientSelector, "1");

        fireEvent.change(dateInput, {
            target: { value: "2026-10-01" },
        });

        await user.type(timeInput, "10:30");
        await user.type(reasonInput, "Annual checkup");

        const submitButton = screen.getByRole("button", {
            name: /schedule appointment/i,
        });

        await user.click(submitButton);
        await waitFor(() =>
        {
            expect(fetchAppointments).toHaveBeenCalledTimes(1);
        });
        expect(
            queryClient.getQueryData(["appointments"])
        ).toEqual(initialAppointments);
        const alert = await screen.findByRole("alert");

        expect(alert).toHaveTextContent(
            "CONFLICT: Failed to create appointment. Please try again."
        );
    });
    it("preserves cached appointments while refetching", async () =>
    {
        const user = userEvent.setup();
        vi.mocked(createAppointment).mockResolvedValue(
            undefined as never
        );
        const initialAppointments: Appointment[] = [
            {
                id: 1,
                patientId: 1,
                date: "2026-09-30",
                time: "09:00",
                status: "scheduled",
                reason: "Initial appointment",
            },
        ];
        let fetchCount = 0;
        let resolveRefetch!: () => void;

        const fetchAppointments = vi.fn(
            async () =>
            {
                fetchCount++;

                if (fetchCount === 1)
                {
                    return initialAppointments;
                }

                return new Promise<Appointment[]>(resolve =>
                {
                    resolveRefetch = () => resolve(initialAppointments);
                });
            }
        );
        const { queryClient } = RenderAppointmentHelper(
            patients,
            fetchAppointments
        );
        const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

        await waitFor(() =>
        {
            expect(fetchAppointments).toHaveBeenCalledTimes(1);
        });

        expect(
            queryClient.getQueryData(["appointments"])
        ).toEqual(initialAppointments);
        const patientSelector = screen.getByRole("combobox", {
            name: /select patient/i,
        });

        const dateInput = screen.getByLabelText(/date/i);
        const timeInput = screen.getByLabelText(/time/i);
        const reasonInput = screen.getByLabelText(/reason/i);

        await user.selectOptions(patientSelector, "1");

        fireEvent.change(dateInput, {
            target: { value: "2026-10-01" },
        });

        await user.type(timeInput, "10:30");
        await user.type(reasonInput, "Annual checkup");

        const submitButton = screen.getByRole("button", {
            name: /schedule appointment/i,
        });

        await user.click(submitButton);

        await waitFor(() =>
        {
            expect(fetchAppointments).toHaveBeenCalledTimes(2);
        });

        expect(
            queryClient.getQueryData(["appointments"])
        ).toEqual(initialAppointments);

        resolveRefetch();
        expect(invalidateSpy).toHaveBeenCalledWith({
            queryKey: ["appointments"],
        });
        await waitFor(() =>
        {
            expect(
                queryClient.getQueryData(["appointments"])
            ).toEqual(initialAppointments);
        });
    });
    it("preserves cached appointments when refetch fails", async () =>
    {
        const user = userEvent.setup();
        vi.mocked(createAppointment).mockResolvedValue(
            undefined as never
        );
        const initialAppointments: Appointment[] = [
            {
                id: 1,
                patientId: 1,
                date: "2026-09-30",
                time: "09:00",
                status: "scheduled",
                reason: "Initial appointment",
            },
        ];
        let fetchCount = 0;

        const fetchAppointments = vi.fn(
            async () =>
            {
                fetchCount++;

                if (fetchCount === 1)
                {
                    return initialAppointments;
                }

                throw new Error("Refetch failed");
            }
        );
        const { queryClient } = RenderAppointmentHelper(
            patients,
            fetchAppointments
        );
        await waitFor(() =>
        {
            expect(fetchAppointments).toHaveBeenCalledTimes(1);
        });
        expect(queryClient.getQueryData(["appointments"]))
            .toEqual(initialAppointments);

        const patientSelector = screen.getByRole("combobox", {
            name: /select patient/i,
        });

        const dateInput = screen.getByLabelText(/date/i);
        const timeInput = screen.getByLabelText(/time/i);
        const reasonInput = screen.getByLabelText(/reason/i);

        await user.selectOptions(patientSelector, "1");

        fireEvent.change(dateInput, {
            target: { value: "2026-10-01" },
        });

        await user.type(timeInput, "10:30");
        await user.type(reasonInput, "Annual checkup");

        const submitButton = screen.getByRole("button", {
            name: /schedule appointment/i,
        });

        await user.click(submitButton);

        await screen.findByText("Schedule created!");
        await waitFor(() =>
        {
            expect(fetchAppointments).toHaveBeenCalledTimes(2);
        });

        expect(queryClient.getQueryData(["appointments"]))
            .toEqual(initialAppointments);
    });

    it("shows an error when the initial appointments fetch fails", async () =>
    {
        const fetchAppointments = vi.fn(async () =>
        {
            throw new Error("Failed to load appointments");
        });
        RenderAppointmentHelper(
            patients,
            fetchAppointments
        );
        await waitFor(() =>
        {
            expect(fetchAppointments).toHaveBeenCalledTimes(1);
        });

        const alert = await screen.findByRole("alert");
        expect(alert).toHaveTextContent(
            "Failed to load appointments"
        );
    });
    it("retries the appointments query after an initial failure", async () =>
    {
        const initialAppointments: Appointment[] = [
            {
                id: 1,
                patientId: 1,
                date: "2026-09-30",
                time: "09:00",
                status: "scheduled",
                reason: "Initial appointment",
            },
        ];

        let fetchCount = 0;

        const fetchAppointments = vi.fn(async () =>
        {
            fetchCount++;

            if (fetchCount === 1)
            {
                throw new Error("Temporary failure");
            }

            return initialAppointments;
        });
        const { queryClient } = RenderAppointmentHelperRetry(
            patients,
            fetchAppointments
        );
        await waitFor(() =>
        {
            expect(fetchAppointments).toHaveBeenCalledTimes(2);
        });

        expect(
            queryClient.getQueryData(["appointments"])
        ).toEqual(initialAppointments);

        expect(
            screen.queryByRole("alert")
        ).not.toBeInTheDocument();
    });
    it("preserves appointments while showing a background refetch error", async () =>
    {
        const initialAppointments: Appointment[] = [
            {
                id: 1,
                patientId: 1,
                date: "2026-09-30",
                time: "09:00",
                status: "scheduled",
                reason: "Initial appointment",
            },
        ];

        let fetchCount = 0;

        const fetchAppointments = vi.fn(async () =>
        {
            fetchCount++;

            if (fetchCount === 1)
            {
                return initialAppointments;
            }

            throw new Error("Refetch failed");
        });

        const { queryClient } = RenderAppointmentHelper(
            patients,
            fetchAppointments
        );
        await waitFor(() =>
        {
            expect(fetchAppointments).toHaveBeenCalledTimes(1);
        });

        expect(
            queryClient.getQueryData(["appointments"])
        ).toEqual(initialAppointments);

        await queryClient.invalidateQueries({
            queryKey: ["appointments"],
        });
        await waitFor(() =>
        {
            expect(fetchAppointments).toHaveBeenCalledTimes(2);
        });

        expect(
            queryClient.getQueryData(["appointments"])
        ).toEqual(initialAppointments);

        expect(screen.getByTestId("appointments-count")
        ).toHaveTextContent("1");

        const alert = await screen.findByRole("alert");
        expect(alert).toHaveTextContent(
            "Failed to load appointments"
        );
    });

    it("retry a background refetch", async () =>
    {
        const initialAppointments: Appointment[] = [
            {
                id: 1,
                patientId: 1,
                date: "2026-09-30",
                time: "09:00",
                status: "scheduled",
                reason: "Initial appointment",
            },
        ];

        const refreshedAppointments: Appointment[] = [
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

        const fetchAppointments = vi.fn(async () =>
        {
            fetchCount++;

            if (fetchCount === 1)
            {
                return initialAppointments;
            }

            if (fetchCount === 2)
            {
                throw new Error("Temporary refetch failure");
            }

            return refreshedAppointments;
        });

        const { queryClient } = RenderAppointmentHelperRetry(
            patients,
            fetchAppointments
        );
        await waitFor(() =>
        {
            expect(fetchAppointments).toHaveBeenCalledTimes(1);
        });

        expect(
            queryClient.getQueryData(["appointments"])
        ).toEqual(initialAppointments);

        await queryClient.invalidateQueries({
            queryKey: ["appointments"],
        });

        await waitFor(() =>
        {
            expect(fetchAppointments).toHaveBeenCalledTimes(3);
        });

        expect(
            queryClient.getQueryData(["appointments"])
        ).toEqual(refreshedAppointments);

        expect(
            screen.queryByRole("alert")
        ).not.toBeInTheDocument();
        expect(
            screen.getByTestId("appointments-count")
        ).toHaveTextContent("2");
    });
    it("shows an error after a background refetch exhausts retries", async () =>
    {
        const initialAppointments: Appointment[] = [
            {
                id: 1,
                patientId: 1,
                date: "2026-09-30",
                time: "09:00",
                status: "scheduled",
                reason: "Initial appointment",
            },
        ];

        let fetchCount = 0;

        const fetchAppointments = vi.fn(async () =>
        {
            fetchCount++;

            if (fetchCount === 1)
            {
                return initialAppointments;
            }

            throw new Error("Refetch failed");
        });
        const { queryClient } = RenderAppointmentHelperRetry(
            patients,
            fetchAppointments
        );
        await waitFor(() =>
        {
            expect(fetchAppointments).toHaveBeenCalledTimes(1);
        });
        expect(
            queryClient.getQueryData(["appointments"])
        ).toEqual(initialAppointments);

        await queryClient.invalidateQueries({
            queryKey: ["appointments"],
        });
        await waitFor(() =>
        {
            expect(fetchAppointments).toHaveBeenCalledTimes(3);
        });

        expect(
            queryClient.getQueryData(["appointments"])
        ).toEqual(initialAppointments);
        const alert = await screen.findByRole("alert");

        expect(alert).toHaveTextContent(
            "Failed to load appointments"
        );
        expect(
            screen.getByTestId("appointments-count")
        ).toHaveTextContent("1");
    });




    it("allows manually retrying after automatic retries are exhausted", async () =>
    {
        const user = userEvent.setup();

        const initialAppointments: Appointment[] = [
            {
                id: 1,
                patientId: 1,
                date: "2026-09-30",
                time: "09:00",
                status: "scheduled",
                reason: "Initial appointment",
            },
        ];

        const refreshedAppointments: Appointment[] = [
            ...initialAppointments,
            {
                id: 2,
                patientId: 2,
                date: "2026-10-01",
                time: "10:00",
                status: "scheduled",
                reason: "Follow-up appointment",
            },
        ];

        let fetchCount = 0;

        const fetchAppointments = vi.fn(async () =>
        {
            fetchCount++;

            if (fetchCount === 1)
            {
                return initialAppointments;
            }

            if (fetchCount === 2 || fetchCount === 3)
            {
                throw new Error("Refetch failed");
            }

            return refreshedAppointments;
        });

        const { queryClient } = RenderAppointmentHelperRetry(
            patients,
            fetchAppointments
        );

        // Initial fetch succeeds.
        await waitFor(() =>
        {
            expect(fetchAppointments).toHaveBeenCalledTimes(1);
        });

        expect(queryClient.getQueryData(["appointments"]))
            .toEqual(initialAppointments);
        // Background refetch occurs.
        await queryClient.invalidateQueries({
            queryKey: ["appointments"],
        });

        await waitFor(() =>
        {
            expect(fetchAppointments).toHaveBeenCalledTimes(3);
        });
        // Automatic retry is exhausted.
        expect(
            queryClient.getQueryData(["appointments"])
        ).toEqual(initialAppointments);

        // Error is displayed.
        const alert = await screen.findByRole("alert");
        expect(alert).toHaveTextContent(
            "Failed to load appointments.");

        // Retry button is displayed.
        const retryButton = screen.getByRole("button", {
            name: "Retry"
        });
        // User clicks Retry.
        await user.click(retryButton);
        // Fetch #4 succeeds and refreshed appointments appear.
        await waitFor(() =>
        {
            expect(fetchAppointments).toHaveBeenCalledTimes(4);
        });

        // Error disappears and the query cache contains refreshedAppointments.
        expect(screen.queryByRole("alert"))
            .not.toBeInTheDocument();
        expect(queryClient.getQueryData(["appointments"]))
            .toEqual(refreshedAppointments);
    });
});