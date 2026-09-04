import { useState, useEffect } from 'react';
import type { Patient, PatientStatus } from '../types/patient';
import PatientCard from './PatientCard';
import AppointmentForm from "./AppointmentForm";
import { getPatients } from "../api/patientsApi"

export default function PatientList()
{

    const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
    const [search, setSearch] = useState("");
    const [patients, setPatients] = useState<Patient[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() =>
    {
        const controller = new AbortController();
        async function loadPatients()
        {
            try
            {
                setIsLoading(true);
                setError(null);

                const data = await getPatients({ controller });

                setPatients(data);
            } catch (error)
            {
                if (
                    error instanceof DOMException &&
                    error.name === "AbortError"
                )
                {
                    return;
                }
                setError("Unable to load patients");
            } finally
            {
                setIsLoading(false);
            }
        }

        loadPatients();
        return () =>
        {
            controller.abort();
        };
    }, []);

    const filteredPatients = patients.filter(patient =>
        `${patient.firstName} ${patient.lastName}`
            .toLowerCase()
            .includes(search.toLowerCase())
    );
    function handleChangeStatus(id: number, newStatus: PatientStatus)
    {
        setPatients(prevPatients =>
            prevPatients.map(patient =>
                patient.id === id
                    ? { ...patient, status: newStatus }
                    : patient
            )
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
        return <p>{error}</p>;
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