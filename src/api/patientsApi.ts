import type { Patient } from "../types/patient";
export type ApiProps = {
    controller: AbortController
}
export async function getPatients({ controller }: ApiProps): Promise<Patient[]>
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
            signal: controller.signal,
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