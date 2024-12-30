import type {PropsWithChildren} from 'react';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useDebounceCallback} from 'usehooks-ts';

import {useAnimationFrame} from './useAnimationFrame';
import {toBezierEasing} from './toBezierEasing';
import type {BubbleConfig} from './BubbleConfig';
import {buildBubbleConfig} from './BubbleConfig';
import {createId} from './createId';

/**
 * `Bubbles` is a standalone particle spawner component.
 *
 * The `Bubble` particles spawn at an origin point and then float upwards using a randomised cos/sin wave `wobble` function.
 *
 * Particles can be any valid `ReactNode` - we've used emojis by default.
 *
 * You can pass an array of your own `components` to render. The spawner will then pick one at random.
 *
 * We recommend that we recommend that you keep the components simple to render for performance
 *
 * ## Usage
 *
 * ```jsx
 *
 * import { Bubbles } from "react-fidget-spinner"
 *
 * const SimpleBubble = '🔥'
 *
 * const ComplexBubble = () => {
 *    // Ok - it's not that complex, but you can use any react component
 *   return (
 *     <div>💸</div>
 *   )
 * }
 *
 * const MyBubbles = () => {
 *
 *   return (
 *     <Bubbles components={['💸', SimpleBubble, <ComplexBubble /> ]} />
 *   )
 * }
 *
 * ```
 *
 */
export const Bubbles = (config: Partial<BubbleConfig>) => {
    const {
        minSpawnIntervalMs,
        maxSpawnIntervalMs,
        components,
        durationMs,
        durationMsRandomness,
        opacityEasing,
        opacityStart,
        opacityEnd,
        startScale,
        startScaleRandomness,
        scaleEasing,
        endScale,
        endScaleRandomness,
        wobbleFrequency,
        wobbleFrequencyRandomness,
        wobbleAmplitude,
        wobbleAmplitudeRandomness,
        xOffsetRandomness,
        onSpawn,
        onRemove,
        yEasing,
        frameRate,
        yStart,
        yEnd,
        yRandomness,
        active,
    } = buildBubbleConfig(config);

    const [bubbleMap, setBubbleMap] = useState<Record<string, BubbleProps>>({});

    const bubbles = useMemo(() => {
        return Object.values(bubbleMap);
    }, [bubbleMap]);

    const addBubble = useCallback(
        (id: string, bubbleProps: BubbleProps) => {
            setBubbleMap(prevBubbleMap => ({...prevBubbleMap, [id]: bubbleProps}));
        },
        [setBubbleMap]
    );

    const removeBubble = useCallback(
        (id: string) => {
            setBubbleMap(prevBubbleMap => {
                const newBubbleMap = {...prevBubbleMap};
                delete newBubbleMap[id];
                return newBubbleMap;
            });
        },
        [setBubbleMap]
    );

    const lastSpawnTime = useRef(performance.now());
    const spawnInterval = useRef(minSpawnIntervalMs);

    const spawnLoop = useCallback(() => {
        const time = performance.now();
        const elapsed = time - lastSpawnTime.current;

        if (elapsed > spawnInterval.current) {
            lastSpawnTime.current = time;

            const newInterval = minSpawnIntervalMs + Math.random() * (maxSpawnIntervalMs - minSpawnIntervalMs);
            spawnInterval.current = newInterval;

            const amplitude = wobbleAmplitude + Math.random() * (wobbleAmplitudeRandomness - wobbleAmplitude);
            const frequency = wobbleFrequency + Math.random() * (wobbleFrequencyRandomness - wobbleFrequency);

            const xWobbleFunction = (timeMs: number) => {
                const timeS = timeMs / 1000;
                const wobbleX =
                    Math.sin(timeS * Math.PI * 2 * frequency) * amplitude * 0.6 +
                    Math.cos(timeS * Math.PI * 3.7 * frequency) * amplitude * 0.4 +
                    Math.sin(timeS * Math.PI * 5.3 * frequency) * amplitude * 0.2;

                return wobbleX;
            };

            const xStart = Math.random() * xOffsetRandomness;

            const duration = durationMs + Math.random() * durationMsRandomness;
            const scaleStart = startScale + Math.random() * startScaleRandomness;
            const scaleEnd = endScale + Math.random() * endScaleRandomness;
            const scaleEasingFn = toBezierEasing(scaleEasing);
            const opacityEasingFn = toBezierEasing(opacityEasing);
            const yMax = -(yEnd + Math.random() * yRandomness);
            const yEasingFn = toBezierEasing(yEasing);

            const id = createId();
            const Component = components[Math.floor(Math.random() * components.length)];

            const bubbleProps: BubbleProps = {
                id,
                durationMs: duration,
                scaleStart,
                scaleEnd,
                scaleEasing: scaleEasingFn,
                opacityStart,
                opacityEnd,
                opacityEasing: opacityEasingFn,
                yStart,
                yEnd: yMax,
                yEasing: yEasingFn,
                xStart,
                xWobbleFunction,
                cleanup: () => {
                    removeBubble(id);
                },
                children: Component,
                frameRate,
                onSpawn,
                onRemove,
            };

            addBubble(id, bubbleProps);
        }
    }, [
        minSpawnIntervalMs,
        maxSpawnIntervalMs,
        wobbleAmplitude,
        wobbleAmplitudeRandomness,
        wobbleFrequency,
        wobbleFrequencyRandomness,
        xOffsetRandomness,
        durationMs,
        durationMsRandomness,
        startScale,
        startScaleRandomness,
        endScale,
        endScaleRandomness,
        scaleEasing,
        opacityEasing,
        opacityStart,
        opacityEnd,
        yEnd,
        yRandomness,
        yEasing,
        yStart,
        components,
        frameRate,
        onSpawn,
        onRemove,
        addBubble,
        removeBubble,
    ]);

    useAnimationFrame(spawnLoop, active);

    return (
        <div style={{position: 'relative'}}>
            {bubbles.map(bubbleProps => (
                <Bubble key={bubbleProps.id} {...bubbleProps} />
            ))}
        </div>
    );
};

type BubbleProps = PropsWithChildren<{
    id: string;
    durationMs: number;
    scaleStart: number;
    scaleEnd: number;
    scaleEasing: (timeMs: number) => number;
    opacityStart: number;
    opacityEnd: number;
    opacityEasing: (timeMs: number) => number;
    yStart: number;
    yEnd: number;
    yEasing: (timeMs: number) => number;
    xStart: number;
    xWobbleFunction: (timeMs: number) => number;
    cleanup: () => void;
    frameRate: number;
    onSpawn: () => void;
    onRemove: () => void;
}>;

export const Bubble = ({
    durationMs,
    scaleStart,
    scaleEnd,
    scaleEasing,
    opacityStart,
    opacityEnd,
    opacityEasing,
    yStart,
    yEnd,
    yEasing,
    xStart,
    xWobbleFunction,
    cleanup,
    frameRate,
    children,
    onSpawn,
    onRemove,
}: PropsWithChildren<BubbleProps>) => {
    const startTimestamp = useRef(performance.now());
    const scale = useRef(scaleStart);
    const opacity = useRef(opacityStart);
    const x = useRef(xStart);
    const y = useRef(yStart);

    const [bubbleState, setBubbleState] = useState<{x: number; y: number; scale: number; opacity: number}>({
        x: xStart,
        y: yStart,
        scale: scaleStart,
        opacity: opacityStart,
    });

    const throttleTime = 1000 / frameRate;

    const debouncedSetBubbleState = useDebounceCallback(setBubbleState, throttleTime, {maxWait: throttleTime});

    const [active, setActive] = useState(true);

    useEffect(() => {
        onSpawn();

        return () => {
            onRemove();
        };
    }, [onSpawn, onRemove]);

    const animation = useCallback(() => {
        const elapsed = performance.now() - startTimestamp.current;
        const progress = Math.min(elapsed / durationMs, 1);

        const opacityProgress = opacityEasing(progress);
        opacity.current = opacityStart + (opacityEnd - opacityStart) * opacityProgress;

        const yProgress = yEasing(progress);
        y.current = yStart + yProgress * (yEnd - yStart);

        const scaleProgress = scaleEasing(progress);
        scale.current = scaleStart + (scaleEnd - scaleStart) * scaleProgress;

        const wobbleX = xWobbleFunction(elapsed) + xStart;
        x.current = wobbleX;

        debouncedSetBubbleState({x: wobbleX, y: y.current, scale: scale.current, opacity: opacity.current});

        if (progress >= 1) {
            setActive(false);
            cleanup();
        }
    }, [
        opacityStart,
        opacityEnd,
        yStart,
        yEnd,
        xWobbleFunction,
        scaleStart,
        scaleEnd,
        opacityEasing,
        yEasing,
        scaleEasing,
        xStart,
        durationMs,
        cleanup,
        debouncedSetBubbleState,
    ]);

    useAnimationFrame(animation, active);

    if (!active) {
        return null;
    }

    return (
        <div
            style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                scale: bubbleState.scale,
                opacity: bubbleState.opacity.toString(),
                transform: `translate(calc(${bubbleState.x}px - 50%), calc(${bubbleState.y}px - 50%)) scale(${bubbleState.scale})`,
            }}>
            {children}
        </div>
    );
};

export default Bubbles;
