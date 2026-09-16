import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../hooks/useAuth";

const RequireAuth = () =>
{
    const { user } = useAuth();
    const location = useLocation();
    if (!user)
    {
        return (
            <Navigate to="/login" replace state={{ from: location.pathname + location.search + location.hash }} />
        )
    }
    return <Outlet />;
}
export default RequireAuth;