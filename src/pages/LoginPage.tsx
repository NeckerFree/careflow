import { useLocation, useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";

type LoginLocationState = {
    from?: string;
};
const LoginPage = () =>
{
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as LoginLocationState | null;
    const destination = state?.from ?? "/app";
    const handleLogin = async () =>
    {
        await login("demo@example.com", "password");
        navigate(destination, { replace: true });
    }
    return (
        <main>
            <h1>Login Page</h1>
            <button onClick={handleLogin}>Sign In</button>
        </main>
    );
};

export default LoginPage;