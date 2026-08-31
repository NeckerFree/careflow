import { useState } from 'react';
import type { Patient, PatientStatus } from '../types/patient';
import PatientCard from './PatientCard';
export default function PatientList()
{

    const initialPatients: Patient[] = [
        {
            id: 1,
            firstName: "John",
            lastName: "Doe",
            dateOfBirth: "1978-05-15",
            status: "active",
        },
        {
            id: 2,
            firstName: "Jane",
            lastName: "Smith",
            dateOfBirth: "1985-10-20",
            status: "inactive",
        },
        {
            id: 3,
            firstName: "Alice",
            lastName: "Johnson",
            dateOfBirth: "1990-03-12",
            status: "critical",
        },
        {
            id: 4,
            firstName: "Bob",
            lastName: "Brown",
            dateOfBirth: "1988-07-25",
            status: "active",
        },
        {
            id: 5,
            firstName: "Elio",
            lastName: "Cortés",
            dateOfBirth: "1968-10-20",
            status: "inactive",
        }];

    const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
    const [search, setSearch] = useState("");
    const [patients, setPatients] = useState<Patient[]>(initialPatients);
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
        </>
    )
}