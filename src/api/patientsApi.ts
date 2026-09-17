import type { Appointment } from "../types/appointment";
import type { Patient, PatientStatus } from "../types/patient";
export type ApiProps = {
    signal?: AbortSignal
}
//API/data-access logic
export async function getPatients({ signal }: ApiProps): Promise<Patient[]>
{
    type JsonPlaceholderUser = {
        id: number;
        name: string;
        email: string;
        phone: string;
    };
    const response = await fetch(
        "https://jsonplaceholder.typicode.com/users",
        {
            signal,
        }
    );

    if (!response.ok)
    {
        throw new Error("Failed to fetch patients");
    }

    const data: JsonPlaceholderUser[] = await response.json();
    return data.map((user): Patient => ({
        id: user.id,
        firstName: user.name.split(" ")[0],
        lastName: user.name.split(" ").slice(1).join(" "),
        dateOfBirth: "1970-01-01",
        email: user.email,
        phone: user.phone,
        status: "active",
    }));
}

export async function updatePatientStatus(
    id: number,
    status: PatientStatus
): Promise<void>
{
    const response = await fetch(
        `https://jsonplaceholder.typicode.com/users/${id}`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                status,
            }),
        }
    );

    if (!response.ok)
    {
        throw new Error("Failed to update patient status");
    }
}

export async function createAppointment(appointment: Omit<Appointment, "id" | "status">): Promise<Appointment>
{
    const response = await fetch(
        "https://jsonplaceholder.typicode.com/posts",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(appointment),
        }
    );
    if (!response.ok)
    {
        throw new Error("Failed to create appointment");
    }
    const data: Appointment = await response.json();
    return data;
}