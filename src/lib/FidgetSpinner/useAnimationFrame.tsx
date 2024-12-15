import {useEffect, useRef, useState} from 'react';

// From this https://css-tricks.com/using-requestanimationframe-with-react-hooks/

const useAnimationFrame = (callback: (deltaTime: number) => void) => {
    const requestRef = useRef(0);
    const previousTimeRef = useRef(0);

    const animate = (time: number) => {
        if (previousTimeRef.current != undefined) {
            const deltaTime = time - previousTimeRef.current;
            callback(deltaTime);
        }
        previousTimeRef.current = time;
        requestRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(requestRef.current);
    }, []);
};

export const Counter = () => {
    const [count, setCount] = useState(0);

    useAnimationFrame(deltaTime => {
        setCount(prevCount => (prevCount + deltaTime * 0.01) % 100);
    });

    return <div>{Math.round(count)}</div>;
};
