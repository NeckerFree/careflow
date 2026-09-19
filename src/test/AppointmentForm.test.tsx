import { describe, expect, it } from "vitest";
import
{ parseAppointmentForm, parsePositiveInteger } from "../components/AppointmentForm";

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