import type {PropsWithChildren} from 'react';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useDebounceCallback} from 'usehooks-ts';

import {scores} from './constants';
import {useAnimationFrame} from './useAnimationFrame';
import {toBezierEasing} from './toBezierEasing';

type BubbleSpawnerProps = {
    minSpawnInterval: number;
    maxSpawnInterval: number;
    components: readonly string[];
    durationMs: number;
    durationMsRandomness: number;
    yEnd: number;
    yRandomness: number;
    velocityEasing: readonly [number, number, number, number];
    opacityEasing: readonly [number, number, number, number];
    opacityStart: number;
    opacityEnd: number;
    startScale: number;
    startScaleRandomness: number;
    scaleEasing: readonly [number, number, number, number];
    endScale: number;
    endScaleRandomness: number;
    wobbleFrequency: number;
    wobbleFrequencyRandomness: number;
    wobbleAmplitude: number;
    wobbleAmplitudeRandomness: number;
    xOffsetRandomness: number;
    onSpawn: () => void;
    onRemove: () => void;
    yEasing: readonly [number, number, number, number];
    yStart: number;
    frameRate: number;
};

const defaultBubbleConfig = {
    minSpawnInterval: 1000,
    maxSpawnInterval: 5000,
    components: scores,
    durationMs: 1500,
    durationMsRandomness: 1000,
    yEnd: 100,
    yRandomness: 200,
    velocityEasing: [0.25, 0, 0.8, 1.2],
    opacityEasing: [0.25, -0.75, 0.8, 1.2],
    opacityStart: 1,
    opacityEnd: 0,
    startScale: 0.5,
    startScaleRandomness: 0.5,
    scaleEasing: [0.25, -0.75, 0.8, 1.2],
    endScale: 1,
    endScaleRandomness: 0.2,
    wobbleFrequency: 0.1,
    wobbleFrequencyRandomness: 0.5,
    wobbleAmplitude: 1,
    wobbleAmplitudeRandomness: 40,
    xOffsetRandomness: 100,
    onSpawn: () => {},
    onRemove: () => {},
    yEasing: [0.25, 0, 0.8, 1.2],
    yStart: 0,
    frameRate: 60,
} as const;

export const BubbleSpawner = ({
    minSpawnInterval = defaultBubbleConfig.minSpawnInterval,
    maxSpawnInterval = defaultBubbleConfig.maxSpawnInterval,
    components = defaultBubbleConfig.components,
    durationMs = defaultBubbleConfig.durationMs,
    durationMsRandomness = defaultBubbleConfig.durationMsRandomness,
    opacityEasing = defaultBubbleConfig.opacityEasing,
    opacityStart = defaultBubbleConfig.opacityStart,
    opacityEnd = defaultBubbleConfig.opacityEnd,
    startScale = defaultBubbleConfig.startScale,
    startScaleRandomness = defaultBubbleConfig.startScaleRandomness,
    scaleEasing = defaultBubbleConfig.scaleEasing,
    endScale = defaultBubbleConfig.endScale,
    endScaleRandomness = defaultBubbleConfig.endScaleRandomness,
    wobbleFrequency = defaultBubbleConfig.wobbleFrequency,
    wobbleFrequencyRandomness = defaultBubbleConfig.wobbleFrequencyRandomness,
    wobbleAmplitude = defaultBubbleConfig.wobbleAmplitude,
    wobbleAmplitudeRandomness = defaultBubbleConfig.wobbleAmplitudeRandomness,
    xOffsetRandomness = defaultBubbleConfig.xOffsetRandomness,
    onSpawn = defaultBubbleConfig.onSpawn,
    onRemove = defaultBubbleConfig.onRemove,
    yEasing = defaultBubbleConfig.yEasing,
    frameRate = defaultBubbleConfig.frameRate,
    yStart = defaultBubbleConfig.yStart,
    yEnd = defaultBubbleConfig.yEnd,
    yRandomness = defaultBubbleConfig.yRandomness,
}: Partial<BubbleSpawnerProps>) => {
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
    const spawnInterval = useRef(minSpawnInterval);

    const spawnLoop = useCallback(() => {
        const time = performance.now();
        const elapsed = time - lastSpawnTime.current;

        if (elapsed > spawnInterval.current) {
            lastSpawnTime.current = time;

            const newInterval = minSpawnInterval + Math.random() * (maxSpawnInterval - minSpawnInterval);
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

            const id = Math.random().toString(36).substring(2, 15);
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
        minSpawnInterval,
        maxSpawnInterval,
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

    useAnimationFrame(spawnLoop, true);

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

export default BubbleSpawner;
