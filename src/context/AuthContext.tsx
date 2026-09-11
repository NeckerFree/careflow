import { useContext, createContext, type ReactNode, useState } from "react";
type UserRole =
    | "admin"
    | "doctor"
    | "nurse"
    | "patient";

export type User = {
    id: number;
    name: string;
    email: string;
    role: UserRole;
}
const mockUser: User = {
    id: 1,
    name: "Pepe Grillo",
    email: "pepe.grillo@email.com",
    role: "doctor",
}
export type AuthContextValue = {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode })
{
    const [user, setUser] = useState<User | null>(mockUser);
    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            login: async (email: string, password: string) =>
            {
                setUser(mockUser);
            },
            logout: async () =>
            {
                setUser(null);
            }
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth()
{
    const context = useContext(AuthContext);
    if (!context)
    {
        throw new Error(
            "useAuth must be used within AuthProvider"
        );
    }
    return context;
}