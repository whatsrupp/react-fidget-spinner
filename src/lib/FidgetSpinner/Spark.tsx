import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useDebounceCallback} from 'usehooks-ts';

import {useAnimationFrame} from './useAnimationFrame';
import {toBezierEasing} from './toBezierEasing';

type SparkSpawnerProps = {
    components: readonly React.ReactNode[];
    minSpawnIntervalMs: number;
    maxSpawnIntervalMs: number;
    durationMs: number;
    maxDistancePx: number;
    minDistancePx: number;
    distanceStart: number;
    distanceEasing: readonly [number, number, number, number];
    opacityEasing: readonly [number, number, number, number];
    opacityStart: number;
    opacityEnd: number;
    scaleEasing: readonly [number, number, number, number];
    scaleStart: number;
    scaleEnd: number;
    onSpawn: () => void;
    onRemove: () => void;
    frameRate: number;
};

const defaultSparkConfig: SparkSpawnerProps = {
    components: ['💸', '🔥'],
    minSpawnIntervalMs: 50,
    maxSpawnIntervalMs: 500,
    durationMs: 1000,
    maxDistancePx: 600,
    minDistancePx: 200,
    distanceStart: 0,
    distanceEasing: [0.25, 0, 0.8, 1.2],
    opacityEasing: [0.25, 0, 0.8, 1.2],
    opacityStart: 1,
    opacityEnd: 0,
    scaleEasing: [0.25, 0, 0.8, 1.2],
    scaleStart: 0.5,
    scaleEnd: 5,
    onSpawn: () => {},
    onRemove: () => {},
    frameRate: 50,
};

export const SparkSpawner = ({
    components = defaultSparkConfig.components,
    minSpawnIntervalMs = defaultSparkConfig.minSpawnIntervalMs,
    maxSpawnIntervalMs = defaultSparkConfig.maxSpawnIntervalMs,
    durationMs = defaultSparkConfig.durationMs,
    distanceStart = defaultSparkConfig.distanceStart,
    maxDistancePx = defaultSparkConfig.maxDistancePx,
    minDistancePx = defaultSparkConfig.minDistancePx,
    distanceEasing = defaultSparkConfig.distanceEasing,
    opacityEasing = defaultSparkConfig.opacityEasing,
    opacityStart = defaultSparkConfig.opacityStart,
    opacityEnd = defaultSparkConfig.opacityEnd,
    scaleEasing = defaultSparkConfig.scaleEasing,
    scaleStart = defaultSparkConfig.scaleStart,
    scaleEnd = defaultSparkConfig.scaleEnd,
    onSpawn = defaultSparkConfig.onSpawn,
    onRemove = defaultSparkConfig.onRemove,
    frameRate = defaultSparkConfig.frameRate,
}: Partial<SparkSpawnerProps>) => {
    const [sparkMap, setSparkMap] = useState<Record<string, SparkProps>>({});

    const sparks = useMemo(() => {
        return Object.values(sparkMap);
    }, [sparkMap]);

    const addSpark = useCallback(
        (id: string, sparkProps: SparkProps) => {
            setSparkMap(prevSparkMap => ({...prevSparkMap, [id]: sparkProps}));
        },
        [setSparkMap]
    );

    const removeSpark = useCallback(
        (id: string) => {
            setSparkMap(prevSparkMap => {
                const newSparkMap = {...prevSparkMap};
                delete newSparkMap[id];
                return newSparkMap;
            });
        },
        [setSparkMap]
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

            const id = Math.random().toString(36).substring(2, 15);
            const SparkComponent = components[Math.floor(Math.random() * components.length)];
            const angleRadians = Math.random() * 2 * Math.PI;

            const distanceEnd = distanceStart + Math.random() * (maxDistancePx - minDistancePx);

            const sparkProps: SparkProps = {
                id,
                durationMs,
                frameRate,
                opacityStart,
                opacityEnd,
                opacityEasing: toBezierEasing(opacityEasing),
                distanceStart,
                distanceEnd,
                distanceEasing: toBezierEasing(distanceEasing),
                onSpawn,
                onRemove,
                cleanup: () => {
                    removeSpark(id);
                },
                angleRadians,
                scaleStart,
                scaleEnd,
                scaleEasing: toBezierEasing(scaleEasing),
                Component: SparkComponent,
            };

            addSpark(id, sparkProps);
        }
    }, [
        lastSpawnTime,
        addSpark,
        removeSpark,
        minSpawnIntervalMs,
        maxSpawnIntervalMs,
        components,
        durationMs,
        frameRate,
        opacityStart,
        opacityEnd,
        opacityEasing,
        maxDistancePx,
        distanceEasing,
        onSpawn,
        onRemove,
        scaleStart,
        scaleEnd,
        scaleEasing,
        distanceStart,
        minDistancePx,
    ]);

    useAnimationFrame(spawnLoop, true);

    return (
        <div style={{position: 'relative'}}>
            {sparks.map(sparkProps => (
                <Spark key={sparkProps.id} {...sparkProps} />
            ))}
        </div>
    );
};

type SparkProps = {
    id: string;
    durationMs: number;
    frameRate: number;
    angleRadians: number;
    scaleStart: number;
    scaleEnd: number;
    scaleEasing: (timeMs: number) => number;
    opacityStart: number;
    opacityEnd: number;
    opacityEasing: (timeMs: number) => number;
    distanceStart: number;
    distanceEnd: number;
    distanceEasing: (timeMs: number) => number;
    onSpawn: () => void;
    onRemove: () => void;
    cleanup: () => void;
    Component: React.ReactNode;
};

export const Spark = ({
    durationMs,
    frameRate,
    angleRadians,
    scaleStart,
    scaleEnd,
    scaleEasing,
    opacityStart,
    opacityEnd,
    opacityEasing,
    distanceStart,
    distanceEnd,
    distanceEasing,
    onSpawn,
    onRemove,
    cleanup,
    Component,
}: SparkProps) => {
    const startTimestamp = useRef(performance.now());

    const xStart = Math.cos(angleRadians) * distanceStart;
    const yStart = Math.sin(angleRadians) * distanceStart;

    const x = useRef(xStart);
    const y = useRef(yStart);
    const scale = useRef(scaleStart);
    const opacity = useRef(opacityStart);

    const [active, setActive] = useState(true);

    useEffect(() => {
        onSpawn();

        return () => {
            onRemove();
        };
    }, [onSpawn, onRemove]);

    const [sparkState, setSparkState] = useState<{x: number; y: number; scale: number; opacity: number}>({
        x: xStart,
        y: yStart,
        scale: scaleStart,
        opacity: opacityStart,
    });

    const throttleTime = 1000 / frameRate;

    const debouncedSetSparkState = useDebounceCallback(setSparkState, throttleTime, {maxWait: throttleTime});

    const animation = useCallback(() => {
        const elapsed = performance.now() - startTimestamp.current;
        const progress = Math.min(elapsed / durationMs, 1);

        const opacityProgress = opacityEasing(progress);
        opacity.current = opacityStart + (opacityEnd - opacityStart) * opacityProgress;

        const scaleProgress = scaleEasing(progress);
        scale.current = scaleStart + (scaleEnd - scaleStart) * scaleProgress;

        const distanceProgress = distanceEasing(progress);
        const distancePx = distanceStart + (distanceEnd - distanceStart) * distanceProgress;

        const angle = angleRadians;
        x.current = Math.cos(angle) * distancePx;
        y.current = Math.sin(angle) * distancePx;

        debouncedSetSparkState({x: x.current, y: y.current, opacity: opacity.current, scale: scale.current});

        if (progress >= 1) {
            setActive(false);
            cleanup();
        }
    }, [
        debouncedSetSparkState,
        cleanup,
        distanceStart,
        distanceEnd,
        distanceEasing,
        opacityStart,
        opacityEnd,
        opacityEasing,
        scaleStart,
        scaleEnd,
        scaleEasing,
        angleRadians,
        durationMs,
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
                opacity: sparkState.opacity,
                transform: `translate(calc(${sparkState.x}px - 50%), calc(${sparkState.y}px - 50%)) scale(${sparkState.scale})`,
            }}>
            {Component}
        </div>
    );
};
