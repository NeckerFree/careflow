import { useFormStatus } from "react-dom";

export const FormStatus = () =>
{
    const { pending } = useFormStatus();

    if (!pending) return null;

    return (
        <p
            role="status"
            aria-live="polite"
        >
            Scheduling appointment...
        </p>
    );
};