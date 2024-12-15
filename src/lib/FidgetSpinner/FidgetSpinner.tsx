import {useCallback, useRef, useState} from 'react';
import BezierEasing from 'bezier-easing';

import {useAnimationFrame} from './useAnimationFrame';

type FidgetSpinnerProps = {
    momentOfInertia?: number;
    dampingCoefficient?: number;
    initialAngle?: number;
    initialAngularVelocity?: number;
    maxAngularVelocity?: number;
};

export const FidgetSpinner = ({
    dampingCoefficient = 0.5, // Reduced to make it spin longer
    initialAngle = 0,
    initialAngularVelocity = 0, // Reduced initial velocity significantly
    maxAngularVelocity = Math.PI * 20,
}: FidgetSpinnerProps) => {
    const [angleRadians, setAngleRadians] = useState(initialAngle); // in radians
    const angleRadiansRef = useRef(initialAngle);
    const angularVelocityRef = useRef(initialAngularVelocity);
    const isResettingRef = useRef(false);
    const resetStartTimeRef = useRef<number | null>(null);
    const resetStartAngleRef = useRef<number | null>(null);

    const resetState = useCallback(() => {
        setAngleRadians(initialAngle);
        angleRadiansRef.current = initialAngle;
        angularVelocityRef.current = initialAngularVelocity;
        isResettingRef.current = false;
        resetStartTimeRef.current = null;
        resetStartAngleRef.current = null;
    }, [initialAngle, initialAngularVelocity]);

    const beginReset = useCallback(() => {
        isResettingRef.current = true;
        resetStartTimeRef.current = performance.now();
        resetStartAngleRef.current = angleRadiansRef.current;
    }, []);

    const cancelReset = useCallback(() => {
        isResettingRef.current = false;
        resetStartTimeRef.current = null;
        resetStartAngleRef.current = null;
    }, []);

    const rotationAnimation = useCallback(
        (deltaTime: number) => {
            if (isResettingRef.current) {
                // Define exact duration in milliseconds
                const RESET_DURATION = 200; // 2 seconds
                if (resetStartTimeRef.current === null) {
                    resetStartTimeRef.current = performance.now();
                }
                // Calculate progress based on elapsed time
                const elapsedTime = performance.now() - resetStartTimeRef.current;
                const timeProgress = Math.min(elapsedTime / RESET_DURATION, 1);
                const easing = BezierEasing(0.67, 0.03, 0.86, 0.49);
                const easedProgress = easing(timeProgress);

                // Get the starting angle when reset began (using a ref)
                if (resetStartAngleRef.current === null) {
                    resetStartAngleRef.current = angleRadiansRef.current;
                }

                console.log(resetStartAngleRef.current);
                const targetAngle = resetStartAngleRef.current < 0 ? -2 * Math.PI : 0;

                // Interpolate between start and target angles
                const newAngle =
                    resetStartAngleRef.current + (targetAngle - resetStartAngleRef.current) * easedProgress;

                // Reset everything when animation is complete
                if (timeProgress >= 1) {
                    resetState();
                    return;
                }

                angleRadiansRef.current = newAngle;
                setAngleRadians(newAngle);
                return;
            }

            const dtSeconds = deltaTime / 1000;

            const damping = angularVelocityRef.current < 10 ? dampingCoefficient * 4 : dampingCoefficient;

            const newVelocity = Math.min(
                angularVelocityRef.current * Math.exp(-damping * dtSeconds),
                maxAngularVelocity
            );

            if (newVelocity < 2) {
                beginReset();
                return;
            }

            const deltaAngle = newVelocity * dtSeconds;
            const newAngle = (angleRadiansRef.current + deltaAngle) % (2 * Math.PI);

            angleRadiansRef.current = newAngle;
            angularVelocityRef.current = newVelocity;

            setAngleRadians(newAngle);
        },
        [dampingCoefficient, maxAngularVelocity, beginReset, resetState]
    );

    const animation = useCallback(
        (deltaTime: number) => {
            rotationAnimation(deltaTime);
        },
        [rotationAnimation]
    );

    const addEnergy = useCallback(() => {
        if (isResettingRef.current === true) {
            cancelReset();
        }

        angularVelocityRef.current = angularVelocityRef.current + Math.PI * 2;
    }, [cancelReset]);

    useAnimationFrame(animation);

    const size = 500;

    return (
        <div>
            <div style={{position: 'relative', width: `${size}px`, height: `${size}px`, cursor: 'pointer'}}>
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
