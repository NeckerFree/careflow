import { useState } from "react";
import type { Patient } from '../types/patient';
export function usePatientSearch({ patients }: { patients: Patient[] })
{
    const [search, setSearch] = useState("");
    const filteredPatients = patients.filter(patient =>
        `${patient.firstName} ${patient.lastName}`
            .toLowerCase()
            .includes(search.toLowerCase())
    );
    return {
        search,
        setSearch,
        filteredPatients
    };
}

