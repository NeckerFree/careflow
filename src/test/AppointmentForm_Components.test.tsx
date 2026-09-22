import { describe, expect, it, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import AppointmentForm from "../components/AppointmentForm";
import { vi } from "vitest";
import { createAppointment } from "../api/patientsApi";

vi.mock("../api/patientsApi", () => ({
    createAppointment: vi.fn(),
}));
import
{
    QueryClient,
    QueryClientProvider,
} from "@tanstack/react-query";
import type { Patient } from "../types/patient";

function renderAppointmentForm(patients: Patient[])
{
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });

    return render(
        <QueryClientProvider client={queryClient}>
            <AppointmentForm patients={patients} />
        </QueryClientProvider>
    );
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
});

