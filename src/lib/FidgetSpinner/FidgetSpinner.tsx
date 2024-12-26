import {useCallback, useRef, useState} from 'react';

import {useAnimationFrame} from './useAnimationFrame';
import {toBezierEasing} from './toBezierEasing';
import {BubbleSpawner} from './Bubble';
import {SparkSpawner} from './Spark';

type VelocityBreakpoint = {
    breakpoint: number;
    scale: number;
};

type FidgetSpinnerProps = {
    velocityBreakpoints: VelocityBreakpoint[];
    momentOfInertia: number;
    dampingCoefficient: number;
    initialAngle: number;
    initialAngularVelocity: number;
    maxAngularVelocity: number;
    initialScale: number;
    containerId: string;
    debug: boolean;
    onMaxAngularVelocity: () => void;
    onClick: () => void;
    scaleStart: number;
    scaleEasing: [number, number, number, number];
    scaleDurationMs: number;
    onScaleChange: (scale: number) => void;
    onScaleStart: () => void;
    onScaleEnd: () => void;
    onResetStart: () => void;
    onResetEnd: () => void;
    onResetCancel: () => void;
    resetDurationMs: number;
    resetEasing: [number, number, number, number];
};

const spinnerConfig: FidgetSpinnerProps = {
    velocityBreakpoints: [
        {breakpoint: 0.9, scale: 8},
        {breakpoint: 0.7, scale: 4},
        {breakpoint: 0.3, scale: 2},
        {breakpoint: 0, scale: 1},
    ],
    momentOfInertia: 0.5,
    dampingCoefficient: 0.5,
    initialAngle: 0,
    initialAngularVelocity: 0,
    maxAngularVelocity: Math.PI * 20,
    initialScale: 1,
    containerId: 'fidget-spinner-container',
    debug: true,
    onMaxAngularVelocity: () => {
        if (spinnerConfig.debug) {
            console.log('max velocity');
        }
    },
    onClick: () => {
        if (spinnerConfig.debug) {
            console.log('click');
        }
    },
    scaleStart: 1,
    scaleEasing: [0.25, -0.75, 0.8, 1.2],
    scaleDurationMs: 500,
    onScaleChange: () => {},
    onScaleStart: () => {},
    onScaleEnd: () => {},
    onResetStart: () => {},
    onResetEnd: () => {},
    onResetCancel: () => {},
    resetDurationMs: 200,
    resetEasing: [0.67, 0.03, 0.86, 0.49],
};

const clickConfig = {
    component: null,
    durationMs: 300,
    onClickSpawn: () => {},
    onClickRemove: () => {},
};

export const FidgetSpinner = ({
    velocityBreakpoints = spinnerConfig.velocityBreakpoints,
    dampingCoefficient = spinnerConfig.dampingCoefficient,
    initialAngle = spinnerConfig.initialAngle,
    initialAngularVelocity = spinnerConfig.initialAngularVelocity,
    maxAngularVelocity = spinnerConfig.maxAngularVelocity,
    scaleStart = spinnerConfig.scaleStart,
    scaleEasing = spinnerConfig.scaleEasing,
    scaleDurationMs = spinnerConfig.scaleDurationMs,
    onScaleChange = spinnerConfig.onScaleChange,
    onScaleStart = spinnerConfig.onScaleStart,
    onScaleEnd = spinnerConfig.onScaleEnd,
    containerId = spinnerConfig.containerId,
    onResetStart = spinnerConfig.onResetStart,
    onResetEnd = spinnerConfig.onResetEnd,
    onResetCancel = spinnerConfig.onResetCancel,
    resetDurationMs = spinnerConfig.resetDurationMs,
    resetEasing = spinnerConfig.resetEasing,
    onMaxAngularVelocity: onMaxVelocity = spinnerConfig.onMaxAngularVelocity,
}: Partial<FidgetSpinnerProps>) => {
    const [angleRadians, setAngleRadians] = useState(initialAngle);
    const angleRadiansRef = useRef(initialAngle);
    const angularVelocityRef = useRef(initialAngularVelocity);
    const isResettingRef = useRef(false);
    const resetStartTimeRef = useRef<number | null>(null);
    const resetStartAngleRef = useRef<number | null>(null);

    const scalingStartTimeRef = useRef<number | null>(null);
    const initialScaleRef = useRef<number | null>(null);
    const targetScaleRef = useRef<number | null>(null);
    const isScalingRef = useRef(false);
    const scaleRef = useRef(scaleStart);

    const [scale, setScale] = useState(scaleStart);
    const [isActive, setIsActive] = useState(false);

    const startScaling = useCallback(
        ({newScale = 1}: {newScale?: number}) => {
            scalingStartTimeRef.current = performance.now();
            initialScaleRef.current = scaleRef.current;
            targetScaleRef.current = newScale;
            isScalingRef.current = true;
            onScaleStart();
            onScaleChange(newScale);
        },
        [onScaleStart, onScaleChange]
    );

    const endScaling = useCallback(() => {
        scalingStartTimeRef.current = null;
        initialScaleRef.current = null;
        targetScaleRef.current = null;
        isScalingRef.current = false;
        onScaleEnd();
    }, [onScaleEnd]);

    const scaleAnimation = useCallback(() => {
        const scaleTransitionTime = scaleDurationMs;

        const scaleStartTime = scalingStartTimeRef.current;
        const scaleStartScale = initialScaleRef.current;
        const targetScale = targetScaleRef.current;

        if (!scaleStartTime || !scaleStartScale || !targetScale) {
            return;
        }
        const elapsedTime = performance.now() - scaleStartTime;
        const timeProgress = Math.min(elapsedTime / scaleTransitionTime, 1);
        const easing = toBezierEasing(scaleEasing);
        const easedProgress = easing(timeProgress);

        const newScale = scaleStartScale + (targetScale - scaleStartScale) * easedProgress;
        scaleRef.current = newScale;
        setScale(newScale);

        if (timeProgress >= 1) {
            endScaling();
        }
    }, [setScale, endScaling, scaleDurationMs, scaleEasing]);

    const resetState = useCallback(() => {
        setAngleRadians(initialAngle);
        angleRadiansRef.current = initialAngle;
        angularVelocityRef.current = initialAngularVelocity;
        isResettingRef.current = false;
        resetStartTimeRef.current = null;
        resetStartAngleRef.current = null;
    }, [initialAngle, initialAngularVelocity]);

    const beginReset = useCallback(() => {
        onResetStart();
        isResettingRef.current = true;
        resetStartTimeRef.current = performance.now();
        resetStartAngleRef.current = angleRadiansRef.current;
    }, [onResetStart]);

    const cancelReset = useCallback(() => {
        isResettingRef.current = false;
        resetStartTimeRef.current = null;
        resetStartAngleRef.current = null;
        onResetCancel();
    }, [onResetCancel]);

    const rotationAnimation = useCallback(
        (deltaTime: number) => {
            if (isResettingRef.current) {
                if (resetStartTimeRef.current === null) {
                    resetStartTimeRef.current = performance.now();
                }
                const elapsedTime = performance.now() - resetStartTimeRef.current;
                const timeProgress = Math.min(elapsedTime / resetDurationMs, 1);
                const easing = toBezierEasing(resetEasing);
                const easedProgress = easing(timeProgress);

                if (resetStartAngleRef.current === null) {
                    resetStartAngleRef.current = angleRadiansRef.current;
                }

                const targetAngle = resetStartAngleRef.current < 0 ? -2 * Math.PI : 0;

                const newAngle =
                    resetStartAngleRef.current + (targetAngle - resetStartAngleRef.current) * easedProgress;

                if (timeProgress >= 1) {
                    resetState();
                    onResetEnd();
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
                onMaxVelocity();
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
                for (const {breakpoint, scale} of velocityBreakpoints) {
                    const targetScale =
                        breakpoint === 1 ? velocity === maxVelocity : velocity > maxVelocity * breakpoint;

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
        [
            maxAngularVelocity,
            beginReset,
            resetState,
            startScaling,
            dampingCoefficient,
            onMaxVelocity,
            onResetEnd,
            resetDurationMs,
            resetEasing,
            velocityBreakpoints,
        ]
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
                id={containerId}
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
