import { NavLink, Outlet, useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";

const AppLayout = () =>
{
    const { logout } = useAuth();
    const navigate = useNavigate();
    const handleLogout = () =>
    {
        logout();
        navigate("/login", { replace: true });
    }
    return (
        <>
            <header>
                <h1>CareFlow</h1>
                <nav aria-label="Main Navigation">
                    <NavLink to="/app" end>Dashboard</NavLink> {" | "}
                    <NavLink to="/app/patients">Patients</NavLink> {" | "}
                    <NavLink to="/app/appointments">Appointments</NavLink>
                </nav>
            </header>
            <main>
                <Outlet />
            </main>
            <footer>
                <button onClick={handleLogout}>Log Out</button>
            </footer>
        </>
    );
}

export default AppLayout;
