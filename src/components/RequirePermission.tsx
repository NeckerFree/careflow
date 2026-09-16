import type { Permission } from "../auth/permissions";
import { usePermission } from "../hooks/usePermission";
import { Navigate, Outlet } from "react-router";
type RequirePermissionProps = {
    permission: Permission;
}
const RequirePermission = ({ permission }: RequirePermissionProps) =>
{
    const { can } = usePermission();
    if (!can(permission))
    {
        return <Navigate to="/access-denied" replace />;
    }
    return <Outlet />;
}

export default RequirePermission;