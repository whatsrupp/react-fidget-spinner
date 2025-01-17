import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useDebounceCallback} from 'usehooks-ts';

import {useAnimationFrame} from './useAnimationFrame';
import {toBezierEasing} from './toBezierEasing';
import type {SparkConfig} from './SparkConfig';
import {buildSparkConfig} from './SparkConfig';
import {createId} from './createId';
import {toNumber} from './NumericControl';

/**
 * `Sparks` is a standalone particle spawner component
 * 
 * The `Spark` particles spawn within an origin area and then radiate outwards at a fixed angle from their start point.
 * 
 * Particles can be any valid `ReactNode` - we've used emojis by default.
 * 
 * You can pass an array of your own `components` to render. The spawner will then pick one at random.
 * We recommend that we recommend that you keep the components simple to render for performance

 * ## Usage
 *
 * ```jsx
 *
 * import { Sparks } from "react-fidget-spinner"
 *
 *
 * const MySparks = () => {
 *
 *   return (
 *     <Sparks components={['💸', "Spark", <ComplexSpark /> ]} />
 *   )
 * }
 *
 * ```
 */
export const Sparks = (config: Partial<SparkConfig>) => {
    const {
        components,
        durationMs,
        distanceStart,
        distanceEnd,
        distanceEasing,
        opacityEasing,
        opacityStart,
        opacityEnd,
        scaleEasing,
        scaleStart,
        scaleEnd,
        onSpawn,
        onRemove,
        frameRate,
        active,
        spawnIntervalMs,
    } = buildSparkConfig(config);

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
    const spawnInterval = useRef(toNumber(spawnIntervalMs));

    const spawnLoop = useCallback(() => {
        const time = performance.now();
        const elapsed = time - lastSpawnTime.current;

        if (elapsed > spawnInterval.current) {
            lastSpawnTime.current = time;

            spawnInterval.current = toNumber(spawnIntervalMs);

            const id = createId();
            const SparkComponent = components[Math.floor(Math.random() * components.length)];
            const angleRadians = Math.random() * 2 * Math.PI;

            const sparkProps: SparkProps = {
                id,
                durationMs: toNumber(durationMs),
                frameRate: toNumber(frameRate),
                opacityStart: toNumber(opacityStart),
                opacityEnd: toNumber(opacityEnd),
                opacityEasing,
                distanceStart: toNumber(distanceStart),
                distanceEnd: toNumber(distanceEnd),
                distanceEasing,
                onSpawn,
                onRemove,
                cleanup: () => {
                    removeSpark(id);
                },
                angleRadians,
                scaleStart: toNumber(scaleStart),
                scaleEnd: toNumber(scaleEnd),
                scaleEasing,
                Component: SparkComponent,
            };

            addSpark(id, sparkProps);
        }
    }, [
        lastSpawnTime,
        addSpark,
        removeSpark,
        components,
        durationMs,
        frameRate,
        opacityStart,
        opacityEnd,
        opacityEasing,
        distanceEasing,
        onSpawn,
        onRemove,
        scaleStart,
        scaleEnd,
        scaleEasing,
        distanceStart,
        spawnIntervalMs,
        distanceEnd,
    ]);

    useAnimationFrame(spawnLoop, active);

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
    scaleEasing: [number, number, number, number];
    opacityStart: number;
    opacityEnd: number;
    opacityEasing: [number, number, number, number];
    distanceStart: number;
    distanceEnd: number;
    distanceEasing: [number, number, number, number];
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

        const opacityProgress = toBezierEasing(opacityEasing)(progress);
        opacity.current = opacityStart + (opacityEnd - opacityStart) * opacityProgress;

        const scaleProgress = toBezierEasing(scaleEasing)(progress);
        scale.current = scaleStart + (scaleEnd - scaleStart) * scaleProgress;

        const distanceProgress = toBezierEasing(distanceEasing)(progress);
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
                left: '50%',
                top: '50%',
                position: 'absolute',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                opacity: sparkState.opacity,
                transform: `translate(calc(${sparkState.x}px - 50%), calc(${sparkState.y}px - 50%)) scale(${sparkState.scale})`,
            }}>
            {Component}
        </div>
    );
};
