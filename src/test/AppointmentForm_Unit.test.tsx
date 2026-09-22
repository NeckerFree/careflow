import { describe, expect, it, vi } from "vitest";
import
{
    parseAppointmentForm,
    parsePositiveInteger,
    validateAppointment
} from "../components/AppointmentForm";
import type { Patient } from "../types/patient";
import type { CreateAppointment } from "../types/appointment";


vi.mock("../api/patientsApi", () => ({
    createAppointment: vi.fn(),
    invalidateQueries: vi.fn()
}));

describe("parsePositiveInteger", () =>
{
    const cases: Array<[string, number | null]> = [
        ["50", 50],
        ["0", null],
        ["-1", null],
        ["1.5", null],
        ["abc", null],
        ["", null],
        ["12abc", null],
    ];
    it("valid positive integer 1", () =>
    {
        // Arrange
        const valueToTest = "25";
        // Act
        const result = parsePositiveInteger(valueToTest);
        // Assert
        expect(result).toBe(25);
    });

    it.each(cases)(
        "parsePositiveInteger(%s) returns %s",
        (input, expected) =>
        {
            expect(parsePositiveInteger(input)).toBe(expected);
        }
    );

    it("valid positive integer 2", () =>
    {
        // Arrange
        const valueToTest = "1";
        // Act
        const result = parsePositiveInteger(valueToTest);
        // Assert
        expect(result).toBe(1);
    });
});
describe("parseAppointmentForm", () =>
{
    it("parses a valid appointment form", () =>
    {
        // Arrange
        const formData = new FormData();

        formData.set("patientId", "25");
        formData.set("date", "2026-10-01");
        formData.set("time", "10:30");
        formData.set("reason", "Routine checkup");
        // Act
        const result = parseAppointmentForm(formData);
        // Assert
        expect(result.success).toBe(true);

        if (result.success)
        {
            expect(result.data).toEqual({
                patientId: 25,
                date: "2026-10-01",
                time: "10:30",
                reason: "Routine checkup",
            });

            expect(result.values).toEqual({
                patientId: "25",
                date: "2026-10-01",
                time: "10:30",
                reason: "Routine checkup",
            });
        }
    });
    it("parses an invalid appointment form", () =>
    {
        // Arrange

        const formData = new FormData();
        formData.set("patientId", "-1");
        formData.set("date", "2026-10-01");
        formData.set("time", "10:30");
        formData.set("reason", "Routine checkup");
        // Act
        const result = parseAppointmentForm(formData);
        // Assert
        expect(result.success).toBe(false);

        if (!result.success)
        {
            expect(result.errors.patientId).toBe("Patient ID must be a positive integer.");
            expect(result.values.patientId).toBe("-1");
        }
    });
});

describe("parseAppointmentForm", () =>
{
    const invalidPatientIds: string[] = [
        "0",
        "-1",
        "1.5",
        "abc",
        "",
        "12abc",
    ];

    it.each(invalidPatientIds)(
        "rejects invalid patientId: %s",
        (patientId) =>
        {
            // Arrange
            const formData = new FormData();
            formData.set("patientId", patientId);
            formData.set("date", "2026-10-01");
            formData.set("time", "10:30");
            formData.set("reason", "Routine checkup");
            // Act

            const result = parseAppointmentForm(formData);
            // Assert
            expect(result.success).toBe(false);

            if (!result.success)
            {
                expect(result.errors.patientId).toBe("Patient ID must be a positive integer.");
                expect(result.values.patientId).toBe(patientId);
                expect(result.values.date).toBe("2026-10-01");
                expect(result.values.time).toBe("10:30");
                expect(result.values.reason).toBe("Routine checkup");
            }
        }
    );
});

describe("validateAppointment", () =>
{
    it("returns success for a valid appointment", () =>
    {
        // Arrange
        const patients: Patient[] = [
            {
                id: 25,
                firstName: "John",
                lastName: "Doe",
                dateOfBirth: "1990-01-15",
                status: "active",
            },
        ];
        const appointment: CreateAppointment = {
            patientId: 25,
            date: "2026-10-01",
            time: "10:30",
            reason: "Routine checkup",
        };
        // Act
        const result = validateAppointment(appointment, patients)
        // Assert
        expect(result.success).toBe(true);

        if (result.success)
        {
            expect(result.data).toEqual(appointment);
        }
    });
});

describe("validateAppointment", () =>
{
    it("rejects an appointment with a missing date", () =>
    {
        // Arrange
        const patients: Patient[] = [
            {
                id: 25,
                firstName: "John",
                lastName: "Doe",
                dateOfBirth: "1990-01-15",
                status: "active",
            },
        ];
        const appointment: CreateAppointment = {
            patientId: 25,
            date: "",
            time: "10:30",
            reason: "Routine checkup",
        };

        // Act
        const result = validateAppointment(appointment, patients)
        // Assert
        expect(result.success).toBe(false);
        if (!result.success)
        {
            expect(result.errors.date).toBe("Date is required");
            expect(result.errors.time).toBeUndefined();
            expect(result.errors.reason).toBeUndefined();
            expect(result.errors.patientId).toBeUndefined();

        }
    });
});


describe("validateAppointment", () =>
{
    it("rejects an appointment with invalid patientId", () =>
    {
        // Arrange
        const patients: Patient[] = [
            {
                id: 25,
                firstName: "John",
                lastName: "Doe",
                dateOfBirth: "1990-01-15",
                status: "active",
            },
        ];
        const appointment: CreateAppointment = {
            patientId: 999,
            date: "2026-10-01",
            time: "10:30",
            reason: "Routine checkup",
        };

        // Act
        const result = validateAppointment(appointment, patients);

        // Assert
        expect(result.success).toBe(false);
        if (!result.success)
        {
            expect(result.errors.patientId).toBe("Select a valid patient.");
            expect(result.errors.date).toBeUndefined();
            expect(result.errors.time).toBeUndefined();
            expect(result.errors.reason).toBeUndefined();
        }
    });
});


describe("validateAppointment", () =>
{
    it("returns all applicable validation errors", () =>
    {
        // Arrange
        const patients: Patient[] = [
            {
                id: 25,
                firstName: "John",
                lastName: "Doe",
                dateOfBirth: "1990-01-15",
                status: "active",
            },
        ];
        const appointment: CreateAppointment = {
            patientId: 999,
            date: "",
            time: "",
            reason: "Hi",
        };

        // Act
        const result = validateAppointment(appointment, patients);

        // Assert
        expect(result.success).toBe(false);
        if (!result.success)
        {
            expect(Object.keys(result.errors)).toHaveLength(4);
            expect(result.errors.date).toBe("Date is required");
            expect(result.errors.time).toBe("Time is required");
            expect(result.errors.reason).toBe("Reason must contain at least 3 characters");
            expect(result.errors.patientId).toBe("Select a valid patient.");
        }
    });
});

