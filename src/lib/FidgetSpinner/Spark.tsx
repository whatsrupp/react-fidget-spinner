import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useDebounceCallback} from 'usehooks-ts';

import {useAnimationFrame} from './useAnimationFrame';
import {toBezierEasing} from './toBezierEasing';

const FireEmoji = () => {
    return <div>🔥</div>;
};

const RainbowEmoji = () => {
    return <div>🌈</div>;
};

const sparkConfig = {
    components: [FireEmoji, RainbowEmoji],
    minSpawnIntervalMs: 50,
    maxSpawnIntervalMs: 500,
    durationMs: 1000,
    maxDistancePx: 600,
    minDistancePx: 200,
    distanceEasing: [0.25, 0, 0.8, 1.2],
    opacityEasing: [0.25, 0, 0.8, 1.2],
    opacityStart: 1,
    opacityEnd: 0,
    scaleEasing: [0.25, 0, 0.8, 1.2],
    scaleStart: 0.5,
    scaleEnd: 5,
    onSpawn: () => {
        console.log('spark spawn');
    },
    onRemove: () => {
        console.log('spark remove');
    },
    frameRate: 24,
    xStart: 0,
    yStart: 0,
} as const;

export const SparkSpawner = () => {
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
    const spawnInterval = useRef(sparkConfig.minSpawnIntervalMs as number);
    const minSpawnInterval = sparkConfig.minSpawnIntervalMs;
    const maxSpawnInterval = sparkConfig.maxSpawnIntervalMs;

    const spawnLoop = useCallback(() => {
        const time = performance.now();
        const elapsed = time - lastSpawnTime.current;

        if (elapsed > spawnInterval.current) {
            lastSpawnTime.current = time;

            const newInterval = minSpawnInterval + Math.random() * (maxSpawnInterval - minSpawnInterval);
            spawnInterval.current = newInterval;

            const id = Math.random().toString(36).substring(2, 15);
            const SparkComponent = sparkConfig.components[Math.floor(Math.random() * sparkConfig.components.length)];
            const angleRadians = Math.random() * 2 * Math.PI;

            const sparkProps: SparkProps = {
                id,
                durationMs: sparkConfig.durationMs,
                frameRate: sparkConfig.frameRate,
                opacityStart: sparkConfig.opacityStart,
                opacityEnd: sparkConfig.opacityEnd,
                opacityEasing: toBezierEasing(sparkConfig.opacityEasing),
                distanceStart: 0,
                distanceEnd: sparkConfig.maxDistancePx,
                distanceEasing: toBezierEasing(sparkConfig.distanceEasing),
                onSpawn: () => {
                    sparkConfig.onSpawn();
                },
                onRemove: () => {
                    sparkConfig.onRemove();
                },
                cleanup: () => {
                    removeSpark(id);
                },
                xStart: 0,
                yStart: 0,
                angleRadians,
                scaleStart: sparkConfig.scaleStart,
                scaleEnd: sparkConfig.scaleEnd,
                scaleEasing: toBezierEasing(sparkConfig.scaleEasing),
                Component: <SparkComponent />,
            };

            addSpark(id, sparkProps);
        }
    }, [lastSpawnTime, addSpark, removeSpark, minSpawnInterval, maxSpawnInterval]);

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
    xStart: number;
    yStart: number;
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
    xStart,
    yStart,
    Component,
}: SparkProps) => {
    const startTimestamp = useRef(performance.now());
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
