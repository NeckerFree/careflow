import type { UserRole } from "../types/user";
export type Permission =
    | "patients:read"
    | "patients:update"
    | "patients:create"
    | "patients:delete"
    | "appointments:read"
    | "appointments:create"
    | "users:manage";

export const rolePermissions: Record<UserRole, Permission[]> = {
    admin: [
        "patients:read",
        "patients:update",
        "patients:create",
        "patients:delete",
        "appointments:read",
        "appointments:create",
        "users:manage"
    ],
    doctor: [
        "patients:read",
        "patients:update",
        "appointments:read",
        "appointments:create"
    ],
    nurse: [
        "patients:read",
        "patients:create",
        "appointments:read"
    ],
    patient: [
        "patients:read",
        "appointments:read"
    ],
    guest: ["appointments:read"]
};
