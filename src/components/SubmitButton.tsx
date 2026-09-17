import { useFormStatus } from "react-dom";

const SubmitButton = () =>
{
    const { pending } = useFormStatus();
    return (
        <button type="submit" disabled={pending}>
            {pending ? "Scheduling..." : "Schedule Appointment"}
        </button>
    );
}
export default SubmitButton;