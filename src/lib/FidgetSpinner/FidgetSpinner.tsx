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

    const scalingStartTimeRef = useRef<number | null>(null);
    const initialScaleRef = useRef<number | null>(null);
    const targetScaleRef = useRef<number | null>(null);
    const isScalingRef = useRef(false);
    const scaleRef = useRef(1);

    const [scale, setScale] = useState(1);

    const startScaling = useCallback(({newScale = 1, multiplier = 1}: {newScale?: number; multiplier?: number}) => {
        scalingStartTimeRef.current = performance.now();
        initialScaleRef.current = scaleRef.current;
        if (newScale) {
            targetScaleRef.current = newScale;
        } else {
            targetScaleRef.current = scaleRef.current * multiplier;
        }
        isScalingRef.current = true;
    }, []);

    const endScaling = useCallback(() => {
        scalingStartTimeRef.current = null;
        initialScaleRef.current = null;
        targetScaleRef.current = null;
        isScalingRef.current = false;
    }, []);

    const scaleAnimation = useCallback(() => {
        const scaleTransitionTime = 500;

        const scaleStartTime = scalingStartTimeRef.current;
        const scaleStartScale = initialScaleRef.current;
        const targetScale = targetScaleRef.current;

        if (!scaleStartTime || !scaleStartScale || !targetScale) {
            return;
        }
        // const easing = BezierEasing(0.62, -0.33, 1, -0.62);
        const elapsedTime = performance.now() - scaleStartTime;
        const timeProgress = Math.min(elapsedTime / scaleTransitionTime, 1);
        // const easing = BezierEasing(0, -0.36, 0, -0.73);
        const easing = BezierEasing(0.25, -0.75, 0.8, 1.2);
        const easedProgress = easing(timeProgress);

        const newScale = scaleStartScale + (targetScale - scaleStartScale) * easedProgress;
        scaleRef.current = newScale;
        setScale(newScale);

        if (timeProgress >= 1) {
            endScaling();
        }
    }, [setScale, endScaling]);

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

            const damping = angularVelocityRef.current < 15 ? dampingCoefficient * 6 : dampingCoefficient;
            const newVelocity = Math.min(
                angularVelocityRef.current * Math.exp(-damping * dtSeconds),
                maxAngularVelocity
            );

            if (newVelocity === maxAngularVelocity) {
                console.log('max velocity');
            }

            const scaleMultiplier = 1.5;

            // Scale based on velocity thresholds
            const updateScaleBasedOnVelocity = ({
                velocity,
                maxVelocity,
                scaleMultiplier,
                currentScale,
                isScaling,
                onScaleChange,
            }: {
                velocity: number;
                maxVelocity: number;
                scaleMultiplier: number;
                currentScale: number;
                isScaling: boolean;
                onScaleChange: (scale: number) => void;
            }) => {
                const scaleThresholds = [
                    {threshold: 0.9, scale: 8},
                    {threshold: 0.7, scale: 4},
                    {threshold: 0.3, scale: 2},
                    {threshold: 0, scale: 1},
                ];

                for (const {threshold, scale} of scaleThresholds) {
                    const targetScale = threshold === 1 ? velocity === maxVelocity : velocity > maxVelocity * threshold;

                    if (targetScale) {
                        const newScale = scale * scaleMultiplier;
                        if (currentScale !== newScale && !isScaling) {
                            console.log('scale change', newScale);
                            onScaleChange(newScale);
                        }
                        return;
                    }
                }
            };

            updateScaleBasedOnVelocity({
                velocity: newVelocity,
                maxVelocity: maxAngularVelocity,
                scaleMultiplier,
                currentScale: scaleRef.current,
                isScaling: isScalingRef.current,
                onScaleChange: newScale => startScaling({newScale}),
            });

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
            scaleAnimation();
        },
        [rotationAnimation, scaleAnimation]
    );

    const addEnergy = useCallback(() => {
        if (isResettingRef.current === true) {
            cancelReset();
        }
        const multiplier = 0.9;
        // const multiplier = 1;

        angularVelocityRef.current = angularVelocityRef.current + Math.PI * 2 * multiplier;
    }, [cancelReset]);

    useAnimationFrame(animation);

    const size = 500;

    return (
        <div>
            <button onClick={() => startScaling({multiplier: 1.5})}>Scale Up</button>
            <button onClick={() => startScaling({multiplier: 0.5})}>Scale Down</button>

            <div
                id="container"
                style={{position: 'relative', width: `${size}px`, height: `${size}px`, cursor: 'pointer'}}>
                <div
                    onClick={e => {
                        addEnergy();
                        // Create click animation element
                        const clickAnim = document.createElement('div');
                        clickAnim.style.position = 'absolute';
                        clickAnim.style.left = `${e.pageX}px`;
                        clickAnim.style.top = `${e.pageY}px`;
                        clickAnim.style.width = '40px';
                        clickAnim.style.height = '40px';
                        clickAnim.style.background = 'rgba(255,0,0,0.8)';
                        clickAnim.style.borderRadius = '50%';
                        clickAnim.style.transform = 'translate(-50%, -50%) scale(0)';
                        clickAnim.style.transition = 'all 0.3s ease-out';
                        clickAnim.style.pointerEvents = 'none';
                        document.body.appendChild(clickAnim);

                        // Trigger animation
                        requestAnimationFrame(() => {
                            clickAnim.style.transform = 'translate(-50%, -50%) scale(1)';
                            clickAnim.style.opacity = '0';
                        });

                        // Cleanup
                        setTimeout(() => clickAnim.remove(), 300);
                    }}
                    style={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        transform: `translate(-50%, -50%) rotate(${angleRadians}rad) scale(${scale})`,
                        fontSize: '2rem',
                        cursor: 'pointer',
                        userSelect: 'none',
                        zIndex: 100,
                        overflow: 'hidden',
                    }}>
                    🍷
                </div>
            </div>
        </div>
    );
};
