import type {PropsWithChildren} from 'react';
import {useCallback, useMemo, useRef, useState} from 'react';

import {useAnimationFrame} from './useAnimationFrame';
import {toBezierEasing} from './toBezierEasing';
import {Bubbles} from './Bubbles';
import {Sparks} from './Sparks';
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
import type {VelocityBreakpointsInput, VelocityBreakpoints} from './VelocityBreakpoints';
import {buildVelocityBreakpoints} from './VelocityBreakpoints';
import {useConfig} from './useConfig';
import type {ClickConfig} from './ClickConfig';
import {buildClickConfig} from './ClickConfig';
const containerId = 'fidget-spinner-container';
import {toNumber} from './NumericControl';

export type FidgetSpinnerProps = {
    /** Configuration that gets passed to the underlying `Bubbles` particle spawner component*/
    bubbleConfig?: Partial<BubbleConfig>;

    /** Configuration for the resetting animation */
    resetConfig?: Partial<ResetConfig>;
    /** Configuration for the animation that happens when the FidgetSpinner changes in size */
    scaleConfig?: Partial<ScaleConfig>;
    /** Configuration that gets passed to the underlying `Sparks` particle spawner component*/
    sparkConfig?: Partial<SparkConfig>;
    /** Configuration for the flywheel physics of the `FidgetSpinner` */
    spinnerConfig?: Partial<SpinnerConfig>;
    /** An array of configuration changes that trigger when the velocity of the fidget spinner gets to `x%` of its `maxAngularVelocity` */
    velocityBreakpoints?: VelocityBreakpointsInput;
    /** Configuration for the mouse click animation */
    clickConfig?: Partial<ClickConfig>;
};

/**
 *
 * ## Basic Usage
 * Turns `children` into a clickable interactive fidget spinner:
 *
 * - Each click adds energy which makes it spin faster
 * - It will then slow down and eventually trigger a reset animation.
 *
 *
 * ```tsx
 * <FidgetSpinner>
 *     <YourComponent />
 * </FidgetSpinner>
 * ```
 *
 *
 * ## Config Overrides
 * Any props passed through to the `FidgetSpinner` will **shallow merge** with the default values.
 *
 * ```tsx
 * <FidgetSpinner scaleConfig={{scale: 2}}>
 *     <YourComponent />
 * </FidgetSpinner>
 * ```
 *
 *
 * ## Complex Configuration
 * config builder functions are exported at the top level to help build out more complex configuration. Eg, when using velocity breakpoints.
 *
 *
 * ```tsx
 * // eg for scale config which controls the size of the spinner
 * import { buildScaleConfig } from './react-fidget-spinnner';
 * ```
 *
 * ## What are the default configuration values?
 * Each `control` visible in storybook is the `default` value for that prop.
 */
export const FidgetSpinner = ({
    bubbleConfig: bubbleConfigOverrides,
    children,
    resetConfig: resetConfigOverrides,
    scaleConfig: scaleConfigOverrides,
    sparkConfig: sparkConfigOverrides,
    spinnerConfig: spinnerConfigOverrides,
    velocityBreakpoints: velocityBreakpointsOverrides,
    clickConfig: clickConfigOverrides,
}: PropsWithChildren<FidgetSpinnerProps>) => {
    const [scaleConfig, setScaleConfig, baseScaleConfig, resetScaleConfig] = useConfig(
        scaleConfigOverrides,
        buildScaleConfig
    );
    const [resetConfig, setResetConfig, baseResetConfig, resetResetConfig] = useConfig(
        resetConfigOverrides,
        buildResetConfig
    );
    const [sparkConfig, setSparkConfig, baseSparkConfig, resetSparkConfig] = useConfig(
        sparkConfigOverrides,
        buildSparkConfig
    );
    const [spinnerConfig, setSpinnerConfig, baseSpinnerConfig, resetSpinnerConfig] = useConfig(
        spinnerConfigOverrides,
        buildSpinnerConfig
    );
    const [bubbleConfig, setBubbleConfig, baseBubbleConfig, resetBubbleConfig] = useConfig(
        bubbleConfigOverrides,
        buildBubbleConfig
    );

    const [clickConfig, setClickConfig, baseClickConfig, resetClickConfig] = useConfig(
        clickConfigOverrides,
        buildClickConfig
    );

    const baseConfig = {
        scaleConfig: baseScaleConfig,
        resetConfig: baseResetConfig,
        bubbleConfig: baseBubbleConfig,
        sparkConfig: baseSparkConfig,
        spinnerConfig: baseSpinnerConfig,
        clickConfig: baseClickConfig,
    };

    const velocityBreakpoints: VelocityBreakpoints = buildVelocityBreakpoints(velocityBreakpointsOverrides, baseConfig);

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
    const scaleRef = useRef(baseScaleConfig.scale);
    const currentBreakpointConfigRef = useRef<number | null>(null);

    const [scale, setScale] = useState(baseScaleConfig.scale);
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
        resetSparkConfig();
        resetBubbleConfig();
        resetScaleConfig();
        resetResetConfig();
        resetSpinnerConfig();
        resetClickConfig();
    }, [resetSparkConfig, resetBubbleConfig, resetScaleConfig, resetResetConfig, resetSpinnerConfig, resetClickConfig]);

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

                const newSpinnerConfig = currentBreakpoint?.config.spinnerConfig;
                if (newSpinnerConfig) {
                    setSpinnerConfig(newSpinnerConfig);
                }

                const newClickConfig = currentBreakpoint?.config.clickConfig;
                if (newClickConfig) {
                    setClickConfig(newClickConfig);
                }
            } else if (!currentBreakpoint && currentBreakpointConfigRef.current !== null) {
                currentBreakpointConfigRef.current = null;
                startScaling({newScale: baseScaleConfig.scale});
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
            baseScaleConfig,
            setScaleConfig,
            setBubbleConfig,
            setSparkConfig,
            setResetConfig,
            setSpinnerConfig,
            setClickConfig,
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
        angularVelocityRef.current = angularVelocityRef.current + toNumber(clickConfig.angularVelocityPerClick);
    }, [cancelReset, clickConfig]);

    useAnimationFrame(animation);

    const directionAdjustedAngle = spinnerConfig.direction === 'clockwise' ? angleRadians : -angleRadians;

    return (
        <div
            id={containerId}
            style={{
                position: 'relative',
                userSelect: 'none',
                MozUserSelect: 'none',
                WebkitUserSelect: 'none',
            }}>
            <div
                onClick={e => {
                    addEnergy();
                    if (clickConfig.active) {
                        triggerMouseClickAnimation(e, clickConfig);
                    }
                }}
                style={{
                    cursor: 'pointer',
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    userSelect: 'none',
                    MozUserSelect: 'none',
                    WebkitUserSelect: 'none',
                    WebkitTapHighlightColor: 'transparent',
                    transform: `translate(-50%, -50%) rotate(${directionAdjustedAngle}rad) scale(${scale})`,
                    zIndex: 100,
                }}>
                {children}
            </div>
            <div style={{position: 'relative', left: '50%', top: '50%'}}>
                <Bubbles {...bubbleConfig} active={isActive} />
                <Sparks {...sparkConfig} active={isActive} />
            </div>
        </div>
    );
};

function triggerMouseClickAnimation(e: React.MouseEvent<HTMLDivElement>, clickConfig: ClickConfig) {
    const explosion = document.createElement('div');
    explosion.style.left = `${e.pageX}px`;
    explosion.style.top = `${e.pageY}px`;
    explosion.style.zIndex = '200';
    explosion.style.background = 'rgb(255 0 0 / 80%)';
    explosion.style.borderRadius = '50%';
    explosion.style.height = '40px';
    explosion.style.pointerEvents = 'none';
    explosion.style.position = 'absolute';
    explosion.style.transform = 'translate(-50%, -50%) scale(0)';
    explosion.style.transition = 'all 300ms ease-out';
    explosion.style.width = '40px';
    explosion.style.zIndex = '200';
    const durationMs = 300;

    document.body.appendChild(explosion);
    clickConfig.onSpawn();
    requestAnimationFrame(() => {
        explosion.style.transform = 'translate(-50%, -50%) scale(1)';
        explosion.style.opacity = '0';
    });

    setTimeout(() => {
        explosion.remove();
        clickConfig.onRemove();
    }, durationMs);
}
