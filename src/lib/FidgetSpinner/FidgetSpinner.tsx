import {useCallback, useRef, useState} from 'react';

import {useAnimationFrame} from './useAnimationFrame';

type FidgetSpinnerProps = {
    momentOfInertia?: number;
    dampingCoefficient?: number;
    initialAngle?: number;
    initialAngularVelocity?: number;
};

export const FidgetSpinner = ({
    momentOfInertia = 0.0001, // Increased to make it heavier and spin slower
    dampingCoefficient = 0.5, // Reduced to make it spin longer
    initialAngle = 0,
    initialAngularVelocity = Math.PI * 20, // Reduced initial velocity significantly
}: FidgetSpinnerProps) => {
    const [angleRadians, setAngleRadians] = useState(initialAngle); // in radians
    const [angularVelocity, setAngularVelocity] = useState(initialAngularVelocity); // in radians per second
    // const [angularAcceleration, setAngularAcceleration] = useState(0); // in radians per second squared

    const angleRadiansRef = useRef(initialAngle);
    const angularVelocityRef = useRef(initialAngularVelocity);

    const cb = useCallback(
        (deltaTime: number) => {
            const dtSeconds = deltaTime / 1000;

            // Apply velocity decay: ω(t) = ω₀e^(-kt)
            const newVelocity = angularVelocityRef.current * Math.exp(-dampingCoefficient * dtSeconds);

            // Update position: Δθ = ω * Δt
            const deltaAngle = newVelocity * dtSeconds;
            const newAngle = angleRadiansRef.current + deltaAngle;

            // Stop spinning when velocity is very low
            if (Math.abs(newVelocity) < 1) {
                angularVelocityRef.current = 0;
                return;
            }

            // Update refs and state
            angleRadiansRef.current = newAngle;
            angularVelocityRef.current = newVelocity;

            setAngleRadians(newAngle);
            setAngularVelocity(newVelocity);
        },
        [dampingCoefficient]
    );

    useAnimationFrame(cb);

    const energy = 0.5 * momentOfInertia * angularVelocity * angularVelocity;

    return (
        <div style={{width: '100px', height: '800px'}}>
            Speed: {angularVelocity.toFixed(2)} rad/s
            <br />
            Energy: {energy.toFixed(2)} J
            <div style={{position: 'relative', width: '100%', height: '100%', cursor: 'pointer', userSelect: 'none'}}>
                <div
                    onClick={() => {
                        setAngularVelocity(prev => prev + 10);
                    }}
                    style={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        transform: `translate(-50%, -50%) rotate(${angleRadians}rad)`,
                    }}>
                    🪿
                </div>
            </div>
            <div></div>
        </div>
    );
};
