import type { Patient } from "./patient";

type ApiResult<T> = | { success: true; data: T } | { success: false; error: string };

export default function getPatientName(
    result: ApiResult<Patient>
): string
{
    if (result.success)
    {
        return `${result.data.firstName} ${result.data.lastName}`;
    } else
    {
        return `Error: ${result.error}`;
    }
}


