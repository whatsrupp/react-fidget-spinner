import {useCallback, useRef, useState} from 'react';
import BezierEasing from 'bezier-easing';

import {expressions, scores} from './constants';
import {useAnimationFrame} from './useAnimationFrame';

type FidgetSpinnerProps = {
    momentOfInertia?: number;
    dampingCoefficient?: number;
    initialAngle?: number;
    initialAngularVelocity?: number;
    maxAngularVelocity?: number;
};

const thresholdConfig = [
    {threshold: 0.9, scale: 3},
    {threshold: 0.7, scale: 2},
    {threshold: 0.3, scale: 1.5},
    {threshold: 0, scale: 1},
];

const bubbleConfig = {
    minSpawnInterval: 50,
    maxSpawnInterval: 500,
    components: scores,
    durationMs: 1000,
    maxDistance: 600,
    minDistance: 200,
    velocityEasing: [0.25, -0.75, 0.8, 1.2],
    opacityEasing: [0.25, -0.75, 0.8, 1.2],
    opacityStart: 1,
    opacityEnd: 0,
    startScale: 0.5,
    endScale: 1,
    wobbleFrequency: 0,
    wobbleAmplitude: 0,
    onSpawn: () => {
        console.log('spawn');
    },
    onRemove: () => {
        console.log('remove');
    },
};

const sparkConfig = {
    components: scores,
    minSpawnIntervalMs: 50,
    maxSpawnIntervalMs: 500,
    durationMs: 1000,
    maxDistancePx: 600,
    minDistancePx: 200,
    velocityEasing: [0.25, -0.75, 0.8, 1.2],
    opacityEasing: [0.25, -0.75, 0.8, 1.2],
    opacityStart: 1,
    opacityEnd: 0,
};

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
};

const toBezierEasing = (easing: readonly [number, number, number, number]) => {
    return BezierEasing(easing[0], easing[1], easing[2], easing[3]);
};

const scalingConfig = {
    onScaleChange: (scale: number) => {
        console.log('scale', scale);
    },
    onScaleStart: () => {
        console.log('scale start');
    },
    onScaleEnd: () => {
        console.log('scale end');
    },
    durationMs: 500,
    easing: [0.25, -0.75, 0.8, 1.2] as const,
};

const resetConfig = {
    durationMs: 200,
    onResetStart: () => {
        console.log('reset start');
    },
    onResetEnd: () => {
        console.log('reset end');
    },
    easing: [0.67, 0.03, 0.86, 0.49],
};

const clickConfig = {
    component: null,
};

export const FidgetSpinner = ({
    dampingCoefficient = 0.5, // Reduced to make it spin longer
    initialAngle = 0,
    initialAngularVelocity = 0, // Reduced initial velocity significantly
    maxAngularVelocity = Math.PI * 20,
}: FidgetSpinnerProps) => {
    const [angleRadians, setAngleRadians] = useState(spinnerConfig.initialAngle); // in radians
    const angleRadiansRef = useRef(spinnerConfig.initialAngle);
    const angularVelocityRef = useRef(spinnerConfig.initialAngularVelocity);
    const isResettingRef = useRef(false);
    const resetStartTimeRef = useRef<number | null>(null);
    const resetStartAngleRef = useRef<number | null>(null);

    const scalingStartTimeRef = useRef<number | null>(null);
    const initialScaleRef = useRef<number | null>(null);
    const targetScaleRef = useRef<number | null>(null);
    const isScalingRef = useRef(false);
    const scaleRef = useRef(spinnerConfig.initialScale);

    const [scale, setScale] = useState(spinnerConfig.initialScale);

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
                const RESET_DURATION = 200;
                if (resetStartTimeRef.current === null) {
                    resetStartTimeRef.current = performance.now();
                }
                const elapsedTime = performance.now() - resetStartTimeRef.current;
                const timeProgress = Math.min(elapsedTime / RESET_DURATION, 1);
                const easing = BezierEasing(0.67, 0.03, 0.86, 0.49);
                const easedProgress = easing(timeProgress);

                if (resetStartAngleRef.current === null) {
                    resetStartAngleRef.current = angleRadiansRef.current;
                }

                const targetAngle = resetStartAngleRef.current < 0 ? -2 * Math.PI : 0;

                const newAngle =
                    resetStartAngleRef.current + (targetAngle - resetStartAngleRef.current) * easedProgress;

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
                return;
            }

            const deltaAngle = newVelocity * dtSeconds;
            const newAngle = (angleRadiansRef.current + deltaAngle) % (2 * Math.PI);

            angleRadiansRef.current = newAngle;
            angularVelocityRef.current = newVelocity;

            setAngleRadians(newAngle);
        },
        [dampingCoefficient, maxAngularVelocity, beginReset, resetState, startScaling]
    );

    const lastEchoTimeRef = useRef<number | null>(null);

    const echoAnimation = useCallback(() => {
        const timestamp = performance.now();
        if (lastEchoTimeRef.current === null) {
            lastEchoTimeRef.current = timestamp;
        }
        const deltaTime = timestamp - lastEchoTimeRef.current;

        const velocity = angularVelocityRef.current;
        const velocityRatio = velocity / maxAngularVelocity;
        const minInterval = 50;
        const maxInterval = 500;
        const spawnInterval = maxInterval - (maxInterval - minInterval) * velocityRatio;

        if (deltaTime > spawnInterval && velocity > 0) {
            createEcho();
            lastEchoTimeRef.current = timestamp;
        }
    }, [maxAngularVelocity]);

    const lastScoreTimeRef = useRef<number | null>(null);

    const scoreAnimation = useCallback(() => {
        const timestamp = performance.now();
        if (lastScoreTimeRef.current === null) {
            lastScoreTimeRef.current = timestamp;
        }
        const deltaTime = timestamp - lastScoreTimeRef.current;

        const velocity = angularVelocityRef.current;
        const velocityRatio = velocity / maxAngularVelocity;
        const minInterval = 1000;
        const maxInterval = 5000;
        const spawnInterval = maxInterval - (maxInterval - minInterval) * velocityRatio;

        if (deltaTime > spawnInterval && velocity > 0) {
            createScore();
            lastScoreTimeRef.current = timestamp;
        }
    }, [maxAngularVelocity]);

    const animation = useCallback(
        (deltaTime: number) => {
            rotationAnimation(deltaTime);
            scaleAnimation();
            echoAnimation();
            scoreAnimation();
        },
        [rotationAnimation, scaleAnimation, echoAnimation, scoreAnimation]
    );

    const addEnergy = useCallback(() => {
        if (isResettingRef.current === true) {
            cancelReset();
        }
        const multiplier = 0.9;

        angularVelocityRef.current = angularVelocityRef.current + Math.PI * 2 * multiplier;
    }, [cancelReset]);

    useAnimationFrame(animation);

    const size = 500;

    function createScore() {
        const score = document.createElement('div');
        score.textContent = scores[Math.floor(Math.random() * scores.length)];
        score.style.position = 'absolute';
        score.style.left = '50%';
        score.style.top = '50%';
        score.style.opacity = '1';
        score.style.fontSize = '1rem';

        const startTime = Date.now();
        const duration = 1500 + Math.random() * 1000;
        const maxHeight = 100 + Math.random() * 200;
        const wobbleAmplitude = 1 + Math.random() * 40;
        const wobbleFrequency = 0.1 + Math.random() * 0.5;
        const randomXOffset = (Math.random() - 0.5) * 100;
        const startScale = 0.5 + Math.random() * 0.5;
        const endScale = startScale + 0.5 + Math.random() * 0.2;

        function animateScore() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const easeOutCubic = 1 - Math.pow(1 - progress, 3);
            const y = -maxHeight * easeOutCubic;

            const wobbleX =
                Math.sin(progress * Math.PI * 2 * wobbleFrequency) * wobbleAmplitude * 0.6 +
                Math.cos(progress * Math.PI * 3.7 * wobbleFrequency) * wobbleAmplitude * 0.4 +
                Math.sin(progress * Math.PI * 5.3 * wobbleFrequency) * wobbleAmplitude * 0.2;
            const x = wobbleX + randomXOffset;

            const opacity = progress > 0.7 ? 1 - (progress - 0.7) / 0.3 : 1;

            const scale = startScale + (endScale - startScale) * easeOutCubic;

            score.style.transform = `translate(calc(${x}px - 50%), calc(${y}px - 50%)) scale(${scale})`;
            score.style.opacity = opacity.toString();

            if (progress < 1) {
                requestAnimationFrame(animateScore);
            } else {
                score.remove();
            }
        }

        document.getElementById('container')?.appendChild(score);
        animateScore();
    }

    function createEcho() {
        const echo = document.createElement('div');
        echo.textContent = expressions[Math.floor(Math.random() * expressions.length)];

        echo.className = 'echo text-3xl';
        echo.style.position = 'absolute';
        echo.style.left = '50%';
        echo.style.top = '50%';
        echo.style.animation = 'none';
        echo.style.opacity = '1';
        const startTime = Date.now();
        const duration = 1000;
        const maxDistance = Math.min(200 * (1 + Math.abs(angularVelocityRef.current) / 10), 600);
        const angle = Math.random() * 2 * Math.PI;
        function moveEcho() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const distance = progress * maxDistance;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;

            const opacity = 1 - progress;

            echo.style.transform = `translate(${x - 50}%, ${y - 50}%)`;
            echo.style.opacity = opacity.toString();

            if (progress < 1) {
                requestAnimationFrame(moveEcho);
            }
        }

        document.getElementById('container')?.appendChild(echo);
        moveEcho();

        setTimeout(() => echo.remove(), duration);
    }

    const triggerMouseClickAnimation = (e: React.MouseEvent<HTMLDivElement>) => {
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

        requestAnimationFrame(() => {
            clickAnim.style.transform = 'translate(-50%, -50%) scale(1)';
            clickAnim.style.opacity = '0';
        });

        setTimeout(() => clickAnim.remove(), 300);
    };

    return (
        <div style={{cursor: 'pointer'}}>
            <div
                id="container"
                style={{
                    position: 'relative',
                    width: `${size}px`,
                    height: `${size}px`,
                    cursor: 'pointer',
                    backgroundColor: '#F3D173',
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
                    }}>
                    <Goose />
                </div>
            </div>
        </div>
    );
};

const Goose = () => {
    return <div style={{userSelect: 'none', fontSize: '4rem'}}>🪿</div>;
};
