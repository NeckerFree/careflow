import { useState } from "react";

const Counter = () =>
{
    const [count, setCount] = useState(0);

    const handleIncrease = () =>
    {
        setCount(c => c + 1);
    }
    return (
        <>
            <p>{count}</p>
            <button onClick={handleIncrease}>Increase</button>
        </>
    )
};

export default Counter;