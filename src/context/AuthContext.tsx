import { createContext, type ReactNode, useState } from "react";
type UserRole =
    | "admin"
    | "doctor"
    | "nurse"
    | "patient"
    | "guest";

export type User = {
    id: number;
    name: string;
    email: string;
    role: UserRole;
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
    const [user, setUser] = useState<User | null>(null);
    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            login: async (email: string, password: string) =>
            {
                if (password == "password")
                {
                    const mockUser: User = {
                        id: 1,
                        name: "Pepe Grillo",
                        email: email,
                        role: "guest",
                    };
                    setUser(mockUser);
                }
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

