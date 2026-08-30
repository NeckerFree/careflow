
export const PatientStatus = {
    Active: "active",
    Inactive: "inactive",
    Critical: "critical",
} as const;

export type PatientStatus = (typeof PatientStatus)[keyof typeof PatientStatus];

export type Patient = {
    id: number;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    email?: string;
    phone?: string;
    status: PatientStatus;
}
export type PatientSummary =
    Pick<Patient, "id" | "firstName" | "lastName" | "status">;
