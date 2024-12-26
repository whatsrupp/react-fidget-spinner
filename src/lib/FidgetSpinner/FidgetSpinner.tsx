import {useCallback, useRef, useState} from 'react';

import {useAnimationFrame} from './useAnimationFrame';
import {toBezierEasing} from './toBezierEasing';
import {BubbleSpawner} from './Bubble';
import {SparkSpawner} from './Spark';

const thresholdConfig = [
    {threshold: 0.9, scale: 3},
    {threshold: 0.7, scale: 2},
    {threshold: 0.3, scale: 1.5},
    {threshold: 0, scale: 1},
];

const spinnerConfig = {
    velocityBreakpoints: [
        {breakpoint: 0.9, scale: 8},
        {breakpoint: 0.7, scale: 4},
        {breakpoint: 0.3, scale: 2},
        {breakpoint: 0, scale: 1},
    ],
    maxVelocity: 10,
    momentOfInertia: 0.5,
    dampingCoefficient: 0.5,
    initialAngle: 0,
    initialAngularVelocity: 0,
    maxAngularVelocity: Math.PI * 20,
    initialScale: 1,
    containerId: 'fidget-spinner-container',
    debug: true,
    onMaxVelocity: () => {
        if (spinnerConfig.debug) {
            console.log('max velocity');
        }
    },
    onClick: () => {
        if (spinnerConfig.debug) {
            console.log('click');
        }
    },
};

const scalingConfig = {
    onScaleChange: (scale: number) => {
        if (spinnerConfig.debug) {
            console.log('scale change', scale);
        }
    },
    onScaleStart: () => {
        if (spinnerConfig.debug) {
            console.log('scale start');
        }
    },
    onScaleEnd: () => {
        if (spinnerConfig.debug) {
            console.log('scale end');
        }
    },
    durationMs: 500,
    easing: [0.25, -0.75, 0.8, 1.2] as const,
};

const resetConfig = {
    durationMs: 200,
    onResetStart: () => {
        if (spinnerConfig.debug) {
            console.log('reset start');
        }
    },
    onResetEnd: () => {
        if (spinnerConfig.debug) {
            console.log('reset end');
        }
    },
    onResetCancel: () => {
        if (spinnerConfig.debug) {
            console.log('reset cancel');
        }
    },
    easing: [0.67, 0.03, 0.86, 0.49] as const,
};

const clickConfig = {
    component: null,
    durationMs: 300,
    onClickSpawn: () => {},
    onClickRemove: () => {},
};

export const FidgetSpinner = () => {
    const dampingCoefficient = spinnerConfig.dampingCoefficient;
    const initialAngle = spinnerConfig.initialAngle;
    const initialAngularVelocity = spinnerConfig.initialAngularVelocity;
    const maxAngularVelocity = spinnerConfig.maxAngularVelocity;
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
    const scaleRef = useRef(spinnerConfig.initialScale);

    const [scale, setScale] = useState(spinnerConfig.initialScale);
    const [isActive, setIsActive] = useState(false);

    const startScaling = useCallback(({newScale = 1}: {newScale?: number}) => {
        scalingStartTimeRef.current = performance.now();
        initialScaleRef.current = scaleRef.current;
        targetScaleRef.current = newScale;
        isScalingRef.current = true;
        scalingConfig.onScaleStart();
        scalingConfig.onScaleChange(newScale);
    }, []);

    const endScaling = useCallback(() => {
        scalingStartTimeRef.current = null;
        initialScaleRef.current = null;
        targetScaleRef.current = null;
        isScalingRef.current = false;
        scalingConfig.onScaleEnd();
    }, []);

    const scaleAnimation = useCallback(() => {
        const scaleTransitionTime = scalingConfig.durationMs;

        const scaleStartTime = scalingStartTimeRef.current;
        const scaleStartScale = initialScaleRef.current;
        const targetScale = targetScaleRef.current;

        if (!scaleStartTime || !scaleStartScale || !targetScale) {
            return;
        }
        const elapsedTime = performance.now() - scaleStartTime;
        const timeProgress = Math.min(elapsedTime / scaleTransitionTime, 1);
        const easing = toBezierEasing(scalingConfig.easing);
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
        resetConfig.onResetStart();
        isResettingRef.current = true;
        resetStartTimeRef.current = performance.now();
        resetStartAngleRef.current = angleRadiansRef.current;
    }, []);

    const cancelReset = useCallback(() => {
        isResettingRef.current = false;
        resetStartTimeRef.current = null;
        resetStartAngleRef.current = null;
        resetConfig.onResetCancel();
    }, []);

    const rotationAnimation = useCallback(
        (deltaTime: number) => {
            if (isResettingRef.current) {
                const RESET_DURATION = resetConfig.durationMs;
                if (resetStartTimeRef.current === null) {
                    resetStartTimeRef.current = performance.now();
                }
                const elapsedTime = performance.now() - resetStartTimeRef.current;
                const timeProgress = Math.min(elapsedTime / RESET_DURATION, 1);
                const easing = toBezierEasing(resetConfig.easing);
                const easedProgress = easing(timeProgress);

                if (resetStartAngleRef.current === null) {
                    resetStartAngleRef.current = angleRadiansRef.current;
                }

                const targetAngle = resetStartAngleRef.current < 0 ? -2 * Math.PI : 0;

                const newAngle =
                    resetStartAngleRef.current + (targetAngle - resetStartAngleRef.current) * easedProgress;

                if (timeProgress >= 1) {
                    resetState();
                    resetConfig.onResetEnd();
                    setIsActive(false);
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
                spinnerConfig.onMaxVelocity();
            }

            const scaleMultiplier = 1.5;

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
                for (const {threshold, scale} of thresholdConfig) {
                    const targetScale = threshold === 1 ? velocity === maxVelocity : velocity > maxVelocity * threshold;

                    if (targetScale) {
                        const newScale = scale * scaleMultiplier;
                        if (currentScale !== newScale && !isScaling) {
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
            }

            const deltaAngle = newVelocity * dtSeconds;
            const newAngle = (angleRadiansRef.current + deltaAngle) % (2 * Math.PI);

            angleRadiansRef.current = newAngle;
            angularVelocityRef.current = newVelocity;

            setAngleRadians(newAngle);
        },
        [maxAngularVelocity, beginReset, resetState, startScaling, dampingCoefficient]
    );

    const animation = useCallback(
        (deltaTime: number) => {
            if (!isActive) return;

            rotationAnimation(deltaTime);
            scaleAnimation();
        },
        [isActive, rotationAnimation, scaleAnimation]
    );

    const addEnergy = useCallback(() => {
        if (isResettingRef.current === true) {
            cancelReset();
        }
        setIsActive(true);
        const multiplier = 0.9;
        angularVelocityRef.current = angularVelocityRef.current + Math.PI * 2 * multiplier;
    }, [cancelReset]);

    useAnimationFrame(animation);

    const size = 500;

    return (
        <div style={{cursor: 'pointer'}}>
            <div
                id={spinnerConfig.containerId}
                style={{
                    position: 'relative',
                    width: `${size}px`,
                    height: `${size}px`,
                    cursor: 'pointer',
                    backgroundColor: '#F3D173',
                    userSelect: 'none',
                }}>
                <div
                    onClick={e => {
                        addEnergy();
                        triggerMouseClickAnimation(e);
                    }}
                    style={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        transform: `translate(-50%, -50%) rotate(${angleRadians}rad) scale(${scale})`,
                        cursor: 'pointer',
                        zIndex: 100,
                        overflow: 'hidden',
                        userSelect: 'none',
                    }}>
                    <Goose />
                </div>
                <div style={{position: 'absolute', left: '50%', top: '50%'}}>
                    <BubbleSpawner />
                </div>
                <div style={{position: 'absolute', left: '50%', top: '50%'}}>
                    <SparkSpawner />
                </div>
            </div>
        </div>
    );
};

const Goose = () => {
    return <div style={{userSelect: 'none', fontSize: '4rem'}}>🪿</div>;
};

function triggerMouseClickAnimation(e: React.MouseEvent<HTMLDivElement>) {
    const clickAnim = document.createElement('div');
    clickAnim.style.position = 'absolute';
    clickAnim.style.left = `${e.pageX}px`;
    clickAnim.style.top = `${e.pageY}px`;
    clickAnim.style.width = '40px';
    clickAnim.style.height = '40px';
    clickAnim.style.background = 'rgba(255,0,0,0.8)';
    clickAnim.style.borderRadius = '50%';
    clickAnim.style.transform = 'translate(-50%, -50%) scale(0)';
    clickAnim.style.transition = 'all 300ms ease-out';
    clickAnim.style.pointerEvents = 'none';
    document.body.appendChild(clickAnim);
    clickConfig.onClickSpawn();
    requestAnimationFrame(() => {
        clickAnim.style.transform = 'translate(-50%, -50%) scale(1)';
        clickAnim.style.opacity = '0';
    });

    setTimeout(() => {
        clickAnim.remove();
        clickConfig.onClickRemove();
    }, clickConfig.durationMs);
}
