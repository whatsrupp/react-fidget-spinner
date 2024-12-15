import {useCallback, useRef, useState} from 'react';

import {useAnimationFrame} from './useAnimationFrame';

type FidgetSpinnerProps = {
    momentOfInertia?: number;
    dampingCoefficient?: number;
    initialAngle?: number;
    initialAngularVelocity?: number;
    maxAngularVelocity?: number;
};

export const FidgetSpinner = ({
    momentOfInertia = 0.0001, // Increased to make it heavier and spin slower
    dampingCoefficient = 0.5, // Reduced to make it spin longer
    initialAngle = 0,
    initialAngularVelocity = Math.PI * 20, // Reduced initial velocity significantly
    maxAngularVelocity = Math.PI * 20,
}: FidgetSpinnerProps) => {
    const [angleRadians, setAngleRadians] = useState(initialAngle); // in radians
    const [angularVelocity, setAngularVelocity] = useState(initialAngularVelocity); // in radians per second
    // const [angularAcceleration, setAngularAcceleration] = useState(0); // in radians per second squared
    const angleRadiansRef = useRef(initialAngle);
    const angularVelocityRef = useRef(initialAngularVelocity);

    const cb = useCallback(
        (deltaTime: number) => {
            const dtSeconds = deltaTime / 1000;

            const damping = angularVelocityRef.current < 10 ? dampingCoefficient * 4 : dampingCoefficient;

            const newVelocity = Math.min(
                angularVelocityRef.current * Math.exp(-damping * dtSeconds),
                maxAngularVelocity
            );

            if (newVelocity < 2) {
                angularVelocityRef.current = 0;
                return;
            }

            const deltaAngle = newVelocity * dtSeconds;
            const newAngle = (angleRadiansRef.current + deltaAngle) % (2 * Math.PI);

            angleRadiansRef.current = newAngle;
            angularVelocityRef.current = newVelocity;

            setAngleRadians(newAngle);
            setAngularVelocity(newVelocity);
        },
        [dampingCoefficient]
    );

    const addEnergy = () => {
        angularVelocityRef.current = angularVelocityRef.current + Math.PI * 2;
    };

    useAnimationFrame(cb);

    const energy = 0.5 * momentOfInertia * angularVelocity * angularVelocity;

    return (
        <div style={{width: '100vw', height: '100vh'}}>
            Speed: {angularVelocity.toFixed(2)} rad/s
            <br />
            Energy: {energy.toFixed(2)} J
            <div style={{position: 'relative', width: '100%', height: '100%', cursor: 'pointer'}}>
                <div
                    onClick={addEnergy}
                    style={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        transform: `translate(-50%, -50%) rotate(${angleRadians}rad)`,
                        fontSize: '10rem',
                        cursor: 'pointer',
                        userSelect: 'none',
                        zIndex: 100,
                    }}>
                    🪿
                </div>
            </div>
        </div>
    );
};
