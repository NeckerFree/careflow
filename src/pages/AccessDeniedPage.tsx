import { Link } from "react-router";
export function AccessDeniedPage()
{
    return (
        <main>
            <h1>Access Denied</h1>
            <p>You don't have permission to view this page.</p>
            <Link to="/app">Return to Careflow</Link>
        </main>
    );
}
