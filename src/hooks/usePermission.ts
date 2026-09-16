import { rolePermissions, type Permission } from "../auth/permissions";
import type { UserRole } from "../types/user";
import { useAuth } from "./useAuth";

export function usePermission()
{
    const { user } = useAuth();
    function can(permission: string): boolean
    {
        if (!user) return false;
        const permissions = rolePermissions[user.role as UserRole] || [];
        return permissions.includes(permission as Permission);
    }
    return { can };
}