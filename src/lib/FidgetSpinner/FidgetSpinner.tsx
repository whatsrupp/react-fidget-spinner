import {useCallback, useMemo, useRef, useState} from 'react';

import {useAnimationFrame} from './useAnimationFrame';
import {toBezierEasing} from './toBezierEasing';
import {BubbleSpawner} from './Bubble';
import {SparkSpawner} from './Spark';
import type {SpinnerConfig} from './SpinnerConfig';
import {buildSpinnerConfig} from './SpinnerConfig';
import type {ScaleConfig} from './ScaleConfig';
import {buildScaleConfig} from './ScaleConfig';
import type {ResetConfig} from './ResetConfig';
import {buildResetConfig} from './ResetConfig';
import type {BubbleConfig} from './BubbleConfig';
import {buildBubbleConfig} from './BubbleConfig';
import type {SparkConfig} from './SparkConfig';
import {buildSparkConfig} from './SparkConfig';
import type {VelocityBreakpointConfigs} from './VelocityBreakpoints';
import {buildVelocityBreakpointConfigs} from './VelocityBreakpoints';

type FidgetSpinnerProps = {
    velocityBreakpoints?: VelocityBreakpointConfigs;
    containerId?: string;
    scaleConfig?: Partial<ScaleConfig>;
    resetConfig?: Partial<ResetConfig>;
    bubbleConfig?: Partial<BubbleConfig>;
    sparkConfig?: Partial<SparkConfig>;
    spinnerConfig?: Partial<SpinnerConfig>;
};

export const FidgetSpinner = ({
    scaleConfig: scaleConfigOverrides,
    resetConfig: resetConfigOverrides,
    bubbleConfig: bubbleConfigOverrides,
    sparkConfig: sparkConfigOverrides,
    containerId = 'fidget-spinner-container',
    spinnerConfig: spinnerConfigOverrides,
    velocityBreakpoints: velocityBreakpointsOverrides,
}: FidgetSpinnerProps) => {
    const spinnerConfig = buildSpinnerConfig(spinnerConfigOverrides);
    const defaultScaleConfig = buildScaleConfig(scaleConfigOverrides);
    const defaultResetConfig = buildResetConfig(resetConfigOverrides);
    const defaultBubbleConfig = buildBubbleConfig(bubbleConfigOverrides);
    const defaultSparkConfig = buildSparkConfig(sparkConfigOverrides);

    const velocityBreakpoints: VelocityBreakpointConfigs = buildVelocityBreakpointConfigs(velocityBreakpointsOverrides);

    const [scaleConfig, setScaleConfig] = useState(defaultScaleConfig);
    const [resetConfig, setResetConfig] = useState(defaultResetConfig);
    const [bubbleConfig, setBubbleConfig] = useState(defaultBubbleConfig);
    const [sparkConfig, setSparkConfig] = useState(defaultSparkConfig);

    const [angleRadians, setAngleRadians] = useState(spinnerConfig.initialAngle);
    const angleRadiansRef = useRef(spinnerConfig.initialAngle);
    const angularVelocityRef = useRef(spinnerConfig.initialAngularVelocity);
    const isResettingRef = useRef(false);
    const resetStartTimeRef = useRef<number | null>(null);
    const resetStartAngleRef = useRef<number | null>(null);

    const scalingStartTimeRef = useRef<number | null>(null);
    const initialScaleRef = useRef<number | null>(null);
    const targetScaleRef = useRef<number | null>(null);
    const isScalingRef = useRef(false);
    const scaleRef = useRef(defaultScaleConfig.scale);
    const currentBreakpointConfigRef = useRef<number | null>(null);

    const [scale, setScale] = useState(defaultScaleConfig.scale);
    const [isActive, setIsActive] = useState(false);

    const sortedBreakpoints = useMemo(() => {
        return [...velocityBreakpoints].sort((a, b) => b.breakpoint - a.breakpoint);
    }, [velocityBreakpoints]);

    const getCurrentBreakpoint = useCallback(() => {
        const velocityPercentage = Math.abs(angularVelocityRef.current) / spinnerConfig.maxAngularVelocity;

        const breakpoint = sortedBreakpoints.find(breakpoint => velocityPercentage >= breakpoint.breakpoint);

        return breakpoint || null;
    }, [sortedBreakpoints, spinnerConfig.maxAngularVelocity]);

    const resetConfigs = useCallback(() => {
        setSparkConfig(defaultSparkConfig);
        setBubbleConfig(defaultBubbleConfig);
        setScaleConfig(defaultScaleConfig);
        setResetConfig(defaultResetConfig);
    }, [defaultSparkConfig, defaultBubbleConfig, defaultScaleConfig, defaultResetConfig]);

    const startScaling = useCallback(
        ({newScale = 1}: {newScale?: number}) => {
            scalingStartTimeRef.current = performance.now();
            initialScaleRef.current = scaleRef.current;
            targetScaleRef.current = newScale;
            isScalingRef.current = true;
            scaleConfig.onScaleStart();
            scaleConfig.onScaleChange(newScale);
        },
        [scaleConfig]
    );

    const endScaling = useCallback(() => {
        scalingStartTimeRef.current = null;
        initialScaleRef.current = null;
        targetScaleRef.current = null;
        isScalingRef.current = false;
        scaleConfig.onScaleEnd();
    }, [scaleConfig]);

    const scaleAnimation = useCallback(() => {
        const scaleTransitionTime = scaleConfig.scaleDurationMs;

        const scaleStartTime = scalingStartTimeRef.current;
        const scaleStartScale = initialScaleRef.current;
        const targetScale = targetScaleRef.current;

        if (!scaleStartTime || !scaleStartScale || !targetScale) {
            return;
        }
        const elapsedTime = performance.now() - scaleStartTime;
        const timeProgress = Math.min(elapsedTime / scaleTransitionTime, 1);
        const easing = toBezierEasing(scaleConfig.scaleEasing);
        const easedProgress = easing(timeProgress);

        const newScale = scaleStartScale + (targetScale - scaleStartScale) * easedProgress;
        scaleRef.current = newScale;
        setScale(newScale);

        if (timeProgress >= 1) {
            endScaling();
        }
    }, [setScale, endScaling, scaleConfig.scaleDurationMs, scaleConfig.scaleEasing]);

    const resetState = useCallback(() => {
        setAngleRadians(spinnerConfig.initialAngle);
        angleRadiansRef.current = spinnerConfig.initialAngle;
        angularVelocityRef.current = spinnerConfig.initialAngularVelocity;
        isResettingRef.current = false;
        resetStartTimeRef.current = null;
        resetStartAngleRef.current = null;
        currentBreakpointConfigRef.current = null;
    }, [spinnerConfig.initialAngle, spinnerConfig.initialAngularVelocity]);

    const beginReset = useCallback(() => {
        resetConfig.onResetStart();
        isResettingRef.current = true;
        resetStartTimeRef.current = performance.now();
        resetStartAngleRef.current = angleRadiansRef.current;
    }, [resetConfig]);

    const cancelReset = useCallback(() => {
        isResettingRef.current = false;
        resetStartTimeRef.current = null;
        resetStartAngleRef.current = null;
        resetConfig.onResetCancel();
    }, [resetConfig]);

    const rotationAnimation = useCallback(
        (deltaTime: number) => {
            if (isResettingRef.current) {
                if (resetStartTimeRef.current === null) {
                    resetStartTimeRef.current = performance.now();
                }
                const elapsedTime = performance.now() - resetStartTimeRef.current;
                const timeProgress = Math.min(elapsedTime / resetConfig.durationMs, 1);
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

            const damping =
                angularVelocityRef.current < 15
                    ? spinnerConfig.dampingCoefficient * 6
                    : spinnerConfig.dampingCoefficient;
            const newVelocity = Math.min(
                angularVelocityRef.current * Math.exp(-damping * dtSeconds),
                spinnerConfig.maxAngularVelocity
            );

            if (newVelocity === spinnerConfig.maxAngularVelocity) {
                spinnerConfig.onMaxAngularVelocity();
            }

            const currentBreakpoint = getCurrentBreakpoint();
            if (currentBreakpoint && currentBreakpoint.breakpoint !== currentBreakpointConfigRef.current) {
                console.log('updating breakpoint');
                currentBreakpointConfigRef.current = currentBreakpoint?.breakpoint;
                const newScaleConfig = currentBreakpoint?.config.scaleConfig;
                if (newScaleConfig) {
                    setScaleConfig(newScaleConfig);
                    startScaling({newScale: newScaleConfig.scale});
                }

                const newBubbleConfig = currentBreakpoint?.config.bubbleConfig;
                if (newBubbleConfig) {
                    setBubbleConfig(newBubbleConfig);
                }

                const newSparkConfig = currentBreakpoint?.config.sparkConfig;
                if (newSparkConfig) {
                    setSparkConfig(newSparkConfig);
                }

                const newResetConfig = currentBreakpoint?.config.resetConfig;
                if (newResetConfig) {
                    setResetConfig(newResetConfig);
                }
            } else if (!currentBreakpoint && currentBreakpointConfigRef.current !== null) {
                currentBreakpointConfigRef.current = null;
                startScaling({newScale: defaultScaleConfig.scale});
                resetConfigs();
            }

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
            beginReset,
            resetState,
            startScaling,
            spinnerConfig,
            resetConfig,
            getCurrentBreakpoint,
            resetConfigs,
            defaultScaleConfig,
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

    return (
        <div
            id={containerId}
            style={{
                position: 'relative',
                cursor: 'pointer',
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
                <BubbleSpawner {...bubbleConfig} active={isActive} />
                <SparkSpawner {...sparkConfig} active={isActive} />
            </div>
        </div>
    );
};

const Goose = () => {
    return <div style={{userSelect: 'none', fontSize: '4rem'}}>🪿</div>;
};

const clickConfig = {
    component: null,
    durationMs: 300,
    onClickSpawn: () => {},
    onClickRemove: () => {},
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
