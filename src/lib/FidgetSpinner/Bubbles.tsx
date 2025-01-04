import type {PropsWithChildren} from 'react';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useDebounceCallback} from 'usehooks-ts';

import {useAnimationFrame} from './useAnimationFrame';
import {toBezierEasing} from './toBezierEasing';
import type {BubbleConfig} from './BubbleConfig';
import {buildBubbleConfig} from './BubbleConfig';
import {createId} from './createId';
import classes from './Bubbles.module.css';
import {toNumber} from './NumericControl';

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
 *
 * const MyBubbles = () => {
 *
 *   return (
 *     <Bubbles components={['💸', "Bubble", <ComplexBubble /> ]} />
 *   )
 * }
 *
 * ```
 *
 */
export const Bubbles = (config: Partial<BubbleConfig>) => {
    const {
        spawnIntervalMs,
        // minSpawnIntervalMs,
        // maxSpawnIntervalMs,
        components,
        durationMs,
        // durationMsRandomness,
        opacityEasing,
        opacityStart,
        opacityEnd,
        scaleStart,
        // scaleStartRandomness,
        scaleEasing,
        scaleEnd,
        // scaleEndRandomness,
        wobbleFrequency,
        // wobbleFrequencyRandomness,
        wobbleAmplitude,
        // wobbleAmplitudeRandomness,
        // xOffsetRandomness,
        onSpawn,
        onRemove,
        yEasing,
        frameRate,
        yStart,
        yEnd,
        xStart,
        // yRandomness,
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
    const spawnInterval = useRef(toNumber(spawnIntervalMs));

    const spawnLoop = useCallback(() => {
        const time = performance.now();
        const elapsed = time - lastSpawnTime.current;

        if (elapsed > spawnInterval.current) {
            lastSpawnTime.current = time;

            const newInterval = toNumber(spawnIntervalMs);
            spawnInterval.current = newInterval;

            const amplitude = toNumber(wobbleAmplitude);
            const frequency = toNumber(wobbleFrequency);

            const wobbleDirection = Math.random() < 0.5 ? -1 : 1;

            const xWobbleFunction = (timeMs: number) => {
                const timeS = timeMs / 1000;
                const wobbleX =
                    Math.sin(timeS * Math.PI * 2 * frequency) * amplitude * 0.6 +
                    Math.cos(timeS * Math.PI * 3.7 * frequency) * amplitude * 0.4 +
                    Math.sin(timeS * Math.PI * 5.3 * frequency) * amplitude * 0.2;

                return wobbleDirection * wobbleX;
            };

            const duration = toNumber(durationMs);

            const yMax = -toNumber(yEnd);

            const id = createId();
            const Component = components[Math.floor(Math.random() * components.length)];

            const bubbleProps: BubbleProps = {
                id,
                durationMs: duration,
                scaleStart: toNumber(scaleStart),
                scaleEnd: toNumber(scaleEnd),
                scaleEasing: toBezierEasing(scaleEasing),
                opacityStart: toNumber(opacityStart),
                opacityEnd: toNumber(opacityEnd),
                opacityEasing: toBezierEasing(opacityEasing),
                yStart: toNumber(yStart),
                yEnd: yMax,
                yEasing: toBezierEasing(yEasing),
                xStart: toNumber(xStart),
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
        wobbleAmplitude,
        wobbleFrequency,
        durationMs,
        scaleStart,
        scaleEnd,
        scaleEasing,
        opacityEasing,
        opacityStart,
        opacityEnd,
        yEnd,
        yEasing,
        yStart,
        components,
        frameRate,
        onSpawn,
        onRemove,
        addBubble,
        removeBubble,
        xStart,
        spawnIntervalMs,
    ]);

    useAnimationFrame(spawnLoop, active);

    return (
        <div className={classes.bubbles}>
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
            className={classes.bubble}
            style={{
                scale: bubbleState.scale,
                opacity: bubbleState.opacity.toString(),
                transform: `translate(calc(${bubbleState.x}px - 50%), calc(${bubbleState.y}px - 50%)) scale(${bubbleState.scale})`,
            }}>
            {children}
        </div>
    );
};

export default Bubbles;
