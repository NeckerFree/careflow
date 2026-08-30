type AppointmentStatus = "scheduled" | "confirmed" | "completed" | "canceled";
export type Appointment = {
    id: number;
    patientId: number;
    date: string;
    time: string;
    status: AppointmentStatus;
    reason: string;
}
export type CreateAppointment = Omit<Appointment, "id" | "status">;
