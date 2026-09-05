import { useState } from 'react';
import type { PatientStatus } from '../types/patient';
import PatientCard from './PatientCard';
import AppointmentForm from "./AppointmentForm";
import { getPatients, updatePatientStatus } from "../api/patientsApi"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
export default function PatientList()
{

    const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
    const [search, setSearch] = useState("");

    const {
        data: patients = [],
        isLoading,
        error,
    } = useQuery({
        queryKey: ["patients"],
        queryFn: ({ signal }) => getPatients({ signal }),
    });
    const queryClient = useQueryClient();

    type UpdatePatientStatusVariables = {
        id: number;
        newStatus: PatientStatus;
    };

    const mutation = useMutation({
        mutationFn: ({ id, newStatus }: UpdatePatientStatusVariables) => updatePatientStatus(id, newStatus),
        onSuccess: () =>
        {
            queryClient.invalidateQueries({ queryKey: ["patients"] });
        },
    });


    const filteredPatients = patients.filter(patient =>
        `${patient.firstName} ${patient.lastName}`
            .toLowerCase()
            .includes(search.toLowerCase())
    );
    function handleChangeStatus(id: number, newStatus: PatientStatus)
    {
        mutation.mutate({
            id,
            newStatus,
        });
    }
    function handleSearchData(event: React.ChangeEvent<HTMLInputElement>)
    {
        setSearch(event.target.value);
    }

    if (isLoading)
    {
        return <p>Loading patients...</p>;
    }
    if (error)
    {
        return <p>{error.message}</p>;
    }
    return (
        <>
            <h2>Patient List</h2>
            <input
                value={search}
                onChange={handleSearchData}
                placeholder="Search patients"
            />
            <div className="patient-list">
                {filteredPatients.map((patient) => (
                    <PatientCard
                        key={patient.id}
                        patient={patient}
                        isSelected={patient.id === selectedPatientId}
                        onSelect={setSelectedPatientId}
                        onChangeStatus={handleChangeStatus}
                    />
                ))}
            </div>
            <AppointmentForm patients={patients} />
        </>
    )
}