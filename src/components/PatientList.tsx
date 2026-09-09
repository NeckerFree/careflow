import { useState } from 'react';
import type { PatientStatus, Patient } from '../types/patient';
import PatientCard from './PatientCard';
import AppointmentForm from "./AppointmentForm";
import { getPatients, updatePatientStatus } from "../api/patientsApi"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function PatientList()
{

    const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
    const [search, setSearch] = useState("");
    const [updatingPatientId, setUpdatingPatientId] = useState<number | null>(null);

    const {
        data: patients = [],
        isLoading,
        isFetching,
        error,
    } = useQuery({
        queryKey: ["patients"],
        queryFn: ({ signal }) => getPatients({ signal }),
        staleTime: 1000 * 30,
        gcTime: 5 * 60 * 1000,
    });
    const queryClient = useQueryClient();

    type UpdatePatientStatusVariables = {
        id: number;
        newStatus: PatientStatus;
    };

    const mutation = useMutation({
        mutationFn: ({ id, newStatus }:
            UpdatePatientStatusVariables) =>
            updatePatientStatus(id, newStatus),
        onMutate: async ({ id, newStatus }) =>
        {
            // 1. Stop an ongoing patients request
            await queryClient.cancelQueries({ queryKey: ["patients"] });
            // 2. Save the current cache for rollback
            const previousPatients = queryClient.getQueryData<Patient[]>(["patients"]);
            // 3. Optimistically update the cache
            queryClient.setQueryData<Patient[]>(["patients"],
                (previousPatients) =>
                    previousPatients?.map(patient =>
                        patient.id === id ? { ...patient, status: newStatus } : patient
                    ) ?? []
            );
            // 4. Return context for possible rollback
            return { previousPatients };
        },
        onError: (_error, _variables, context) =>
        {
            // Roll back if server update failed
            if (context?.previousPatients)
            {
                queryClient.setQueryData<Patient[]>(["patients"],
                    context.previousPatients);
            }
        },
        onSettled: () =>
        {
            // Reconcile UI with the actual server state
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
        setUpdatingPatientId(id);
        mutation.mutate(
            { id, newStatus },
            {
                onSettled: () =>
                {
                    setUpdatingPatientId(null);
                }
            }
        );

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
            {mutation.isError && (
                <p>Unable to update patient status.</p>
            )
            }
            <h2>Patient List</h2>
            {isFetching && !isLoading && (
                <p>Refreshing...</p>
            )
            }
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
                        isUpdating={patient.id === updatingPatientId}
                        onSelect={setSelectedPatientId}
                        onChangeStatus={handleChangeStatus}
                    />
                ))}
            </div>
            <AppointmentForm patients={patients} />
        </>
    )
}