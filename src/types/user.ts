export type UserRole =
    | "admin"
    | "doctor"
    | "nurse"
    | "patient";

export type user = {
    id: number;
    name: string;
    email: string;
    role: UserRole;
}