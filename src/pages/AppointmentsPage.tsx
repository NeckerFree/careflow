import AppointmentForm from "../components/AppointmentForm";
import { usePatients } from "../hooks/usePatients";

const AppointmentsPage = () =>
{
    // Server state
    const {
        data: patients = [],
    } = usePatients();
    return (
        <>
            <AppointmentForm patients={patients} />
        </>
    );
};

export default AppointmentsPage;