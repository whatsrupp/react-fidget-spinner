import type {PropsWithChildren} from 'react';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useDebounceCallback} from 'usehooks-ts';

import {scores} from './constants';
import {useAnimationFrame} from './useAnimationFrame';
import {toBezierEasing} from './toBezierEasing';

const bubbleConfig = {
    minSpawnInterval: 1000,
    maxSpawnInterval: 5000,
    components: scores,
    durationMs: 1500,
    durationMsRandomness: 1000,
    distance: 100,
    distanceRandomness: 200,
    velocityEasing: [0.25, -0.75, 0.8, 1.2],
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
    onSpawn: () => {
        console.log('bubble spawn');
    },
    onRemove: () => {
        console.log('bubble remove');
    },
    xWobble: ({timeMs}: {timeMs: number}) => {
        return Math.sin(timeMs * bubbleConfig.wobbleFrequency) * bubbleConfig.wobbleAmplitude;
    },
    yEasing: [0.25, -0.75, 0.8, 1.2],
} as const;

export const BubbleSpawner = () => {
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
    const spawnInterval = useRef(bubbleConfig.minSpawnInterval as number);
    const minSpawnInterval = bubbleConfig.minSpawnInterval;
    const maxSpawnInterval = bubbleConfig.maxSpawnInterval;

    const spawnLoop = () => {
        const time = performance.now();
        const elapsed = time - lastSpawnTime.current;

        if (elapsed > spawnInterval.current) {
            lastSpawnTime.current = time;

            const newInterval = minSpawnInterval + Math.random() * (maxSpawnInterval - minSpawnInterval);
            spawnInterval.current = newInterval;

            const amplitude =
                bubbleConfig.wobbleAmplitude +
                Math.random() * (bubbleConfig.wobbleAmplitudeRandomness - bubbleConfig.wobbleAmplitude);
            const frequency =
                bubbleConfig.wobbleFrequency +
                Math.random() * (bubbleConfig.wobbleFrequencyRandomness - bubbleConfig.wobbleFrequency);

            const xWobbleFunction = (timeMs: number) => {
                const timeS = timeMs / 1000;
                const wobbleX =
                    Math.sin(timeS * Math.PI * 2 * frequency) * amplitude * 0.6 +
                    Math.cos(timeS * Math.PI * 3.7 * frequency) * amplitude * 0.4 +
                    Math.sin(timeS * Math.PI * 5.3 * frequency) * amplitude * 0.2;

                return wobbleX;
            };

            const xStart = Math.random() * bubbleConfig.xOffsetRandomness;

            const durationMs = bubbleConfig.durationMs + Math.random() * bubbleConfig.durationMsRandomness;
            const scaleStart = bubbleConfig.startScale + Math.random() * bubbleConfig.startScaleRandomness;
            const scaleEnd = bubbleConfig.endScale + Math.random() * bubbleConfig.endScaleRandomness;
            const scaleEasing = toBezierEasing(bubbleConfig.scaleEasing);
            const opacityStart = bubbleConfig.opacityStart;
            const opacityEnd = bubbleConfig.opacityEnd;
            const opacityEasing = toBezierEasing(bubbleConfig.opacityEasing);
            const yStart = 0;
            const yEnd = -(bubbleConfig.distance + Math.random() * bubbleConfig.distanceRandomness);
            const yEasing = toBezierEasing(bubbleConfig.yEasing);

            const id = Math.random().toString(36).substring(2, 15);
            const Component = bubbleConfig.components[Math.floor(Math.random() * bubbleConfig.components.length)];

            const bubbleProps: BubbleProps = {
                id,
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
                cleanup: () => {
                    removeBubble(id);
                },
                children: Component,
            };

            addBubble(id, bubbleProps);
        }
    };

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
    frameRate?: number;
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
    frameRate = 60,
    children,
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
        bubbleConfig.onSpawn();

        return () => {
            bubbleConfig.onRemove();
        };
    }, []);

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
