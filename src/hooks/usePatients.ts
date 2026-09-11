
import { useQuery } from "@tanstack/react-query";
import { getPatients } from "../api/patientsApi";
export function usePatients()
{
    return useQuery({
        queryKey: ["patients"],
        queryFn: ({ signal }) => getPatients({ signal }),
        staleTime: 1000 * 30,
        gcTime: 5 * 60 * 1000,
    })
};