import {useCallback, useRef, useState} from 'react';
import BezierEasing from 'bezier-easing';

import {scores, expressions} from './constants';
import {useAnimationFrame} from './useAnimationFrame';

type FidgetSpinnerProps = {
    momentOfInertia?: number;
    dampingCoefficient?: number;
    initialAngle?: number;
    initialAngularVelocity?: number;
    maxAngularVelocity?: number;
};

const thresholdConfig = [
    // {threshold: 0.9, scale: 8},
    // {threshold: 0.7, scale: 4},
    // {threshold: 0.3, scale: 2}, //works well for 2rem
    // {threshold: 0, scale: 1},
    {threshold: 0.9, scale: 3},
    {threshold: 0.7, scale: 2},
    {threshold: 0.3, scale: 1.5},
    {threshold: 0, scale: 1},
];

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

    const startScaling = useCallback(({newScale = 1}: {newScale?: number}) => {
        scalingStartTimeRef.current = performance.now();
        initialScaleRef.current = scaleRef.current;
        targetScaleRef.current = newScale;

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

        // Calculate spawn interval based on velocity thresholds
        const velocity = angularVelocityRef.current;
        const velocityRatio = velocity / maxAngularVelocity;
        const minInterval = 50; // Minimum time between echoes (ms)
        const maxInterval = 500; // Maximum time between echoes (ms)

        // Spawn interval gets shorter as velocity increases
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

        // Calculate spawn interval based on velocity thresholds
        const velocity = angularVelocityRef.current;
        const velocityRatio = velocity / maxAngularVelocity;
        const minInterval = 1000; // Minimum time between echoes (ms)
        const maxInterval = 5000; // Maximum time between echoes (ms)

        // Spawn interval gets shorter as velocity increases
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
        // const multiplier = 1;

        angularVelocityRef.current = angularVelocityRef.current + Math.PI * 2 * multiplier;
    }, [cancelReset]);

    useAnimationFrame(animation);

    const size = 2000;

    function createScore() {
        const score = document.createElement('div');
        score.textContent = scores[Math.floor(Math.random() * scores.length)];
        score.style.position = 'absolute';
        score.style.left = '50%';
        score.style.top = '50%';
        score.style.opacity = '1';
        score.style.fontSize = '1rem';

        const startTime = Date.now();
        const duration = 1500 + Math.random() * 1000; // Random duration between 1.5-2.5 seconds
        const maxHeight = 100 + Math.random() * 200; // Random height between 150-250px
        const wobbleAmplitude = 1 + Math.random() * 40; // Random amplitude between 20-50px
        const wobbleFrequency = 0.1 + Math.random() * 0.5; // Random frequency between 1.5-3
        const randomXOffset = (Math.random() - 0.5) * 100;
        const startScale = 0.5 + Math.random() * 0.5; // Random start scale between 0.5-1
        const endScale = startScale + 0.5 + Math.random() * 0.2; // End scale 1-2 larger than start

        function animateScore() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out cubic for vertical movement
            const easeOutCubic = 1 - Math.pow(1 - progress, 3);
            const y = -maxHeight * easeOutCubic;

            // Mix of sine and cosine waves with different frequencies for more random-feeling wobble
            const wobbleX =
                Math.sin(progress * Math.PI * 2 * wobbleFrequency) * wobbleAmplitude * 0.6 +
                Math.cos(progress * Math.PI * 3.7 * wobbleFrequency) * wobbleAmplitude * 0.4 +
                Math.sin(progress * Math.PI * 5.3 * wobbleFrequency) * wobbleAmplitude * 0.2;
            const x = wobbleX + randomXOffset;

            // Fade out in the last 30% of animation
            const opacity = progress > 0.7 ? 1 - (progress - 0.7) / 0.3 : 1;

            // Scale animation
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
        // echo.textContent = document.getElementById('flywheel').textContent;
        echo.textContent = expressions[Math.floor(Math.random() * expressions.length)];

        echo.className = 'echo text-3xl';
        echo.style.position = 'absolute';
        echo.style.left = '50%';
        echo.style.top = '50%';
        echo.style.animation = 'none';
        echo.style.opacity = '1';
        // Add horizontal movement
        const startTime = Date.now();
        const duration = 1000; // 1 second duration
        const maxDistance = Math.min(200 * (1 + Math.abs(angularVelocityRef.current) / 10), 600); // Maximum distance in pixels, scales with velocity
        const angle = Math.random() * 2 * Math.PI;
        function moveEcho() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Calculate x and y components based on angle
            const distance = progress * maxDistance;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;

            // Fade opacity from 1 to 0 over the duration
            const opacity = 1 - progress;

            echo.style.transform = `translate(${x - 50}%, ${y - 50}%)`;
            echo.style.opacity = opacity.toString();

            if (progress < 1) {
                requestAnimationFrame(moveEcho);
            }
        }

        document.getElementById('container')?.appendChild(echo);
        moveEcho();

        // Remove the element after animation completes
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

        // Trigger animation
        requestAnimationFrame(() => {
            clickAnim.style.transform = 'translate(-50%, -50%) scale(1)';
            clickAnim.style.opacity = '0';
        });

        // Cleanup
        setTimeout(() => clickAnim.remove(), 300);
    };

    return (
        <div>
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
                        fontSize: '4rem',
                        cursor: 'pointer',
                        userSelect: 'none',
                        zIndex: 100,
                        overflow: 'hidden',
                    }}>
                    🪿
                </div>
            </div>
        </div>
    );
};
