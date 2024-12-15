import {useCallback, useEffect, useRef, useState} from 'react';

// From this https://css-tricks.com/using-requestanimationframe-with-react-hooks/

export const useAnimationFrame = (callback: (deltaTime: number) => void, isEnabled = true) => {
    const requestRef = useRef(0);
    const previousTimeRef = useRef(0);

    const animate = useCallback(
        (time: number) => {
            if (previousTimeRef.current != undefined) {
                const deltaTime = time - previousTimeRef.current;
                callback(deltaTime);
            }
            previousTimeRef.current = time;
            requestRef.current = requestAnimationFrame(animate);
        },
        [callback]
    );

    useEffect(() => {
        if (isEnabled) {
            requestRef.current = requestAnimationFrame(animate);
            return () => cancelAnimationFrame(requestRef.current);
        }
        return undefined;
    }, [isEnabled, animate]);
};

export const Counter = () => {
    const [count, setCount] = useState(0);

    useAnimationFrame(deltaTime => {
        setCount(prevCount => (prevCount + deltaTime * 0.01) % 100);
    });

    return <div>{Math.round(count)}</div>;
};
