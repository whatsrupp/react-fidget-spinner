import * as v from 'valibot';

export type SparkConfig = {
    /** Whether the spark spawner is active or not - setting the component as active will stop the animation loop */
    active: boolean;
    /** The components to use for the sparks - each spark will be a random component from this array */
    components: React.ReactNode[];
    /** The bezier curve definition which controls the distance of the spark over time */
    distanceEasing: [number, number, number, number];
    /** The starting distance of the spark */
    distanceStart: number;
    /** The duration of the spark animation */
    durationMs: number;
    /** The frame rate of the animation */
    frameRate: number;
    /** The intensity of the spark */
    intensity: number;
    /** The maximum distance of the spark */
    maxDistancePx: number;
    /** The maximum time between spawning sparks */
    maxSpawnIntervalMs: number;
    /** The minimum distance of the spark */
    minDistancePx: number;
    /** The minimum time between spawning sparks */
    minSpawnIntervalMs: number;
    /** The callback function that is called when a spark is removed */
    onRemove: () => void;
    /** The callback function that is called when a spark is spawned */
    onSpawn: () => void;
    /** The bezier curve definition which controls the opacity of the spark over time */
    opacityEasing: [number, number, number, number];
    /** The ending opacity of the spark */
    opacityEnd: number;
    /** The starting opacity of the spark */
    opacityStart: number;
    /** The bezier curve definition which controls the scale of the spark over time */
    scaleEasing: [number, number, number, number];
    /** The ending scale of the spark */
    scaleEnd: number;
    /** The starting scale of the spark */
    scaleStart: number;
};

export const SparkConfigSchema = v.object({
    active: v.boolean(),
    components: v.array(v.any()),
    distanceEasing: v.tuple([v.number(), v.number(), v.number(), v.number()]),
    distanceStart: v.number(),
    durationMs: v.pipe(v.number(), v.toMinValue(0)),
    frameRate: v.pipe(v.number(), v.toMinValue(0)),
    intensity: v.pipe(v.number(), v.toMinValue(0)),
    maxDistancePx: v.pipe(v.number(), v.toMinValue(0)),
    maxSpawnIntervalMs: v.pipe(v.number(), v.toMinValue(0)),
    minDistancePx: v.pipe(v.number(), v.toMinValue(0)),
    minSpawnIntervalMs: v.pipe(v.number(), v.toMinValue(0)),
    onRemove: v.function(),
    onSpawn: v.function(),
    opacityEasing: v.tuple([v.number(), v.number(), v.number(), v.number()]),
    opacityEnd: v.pipe(v.number(), v.toMinValue(0), v.toMaxValue(1)),
    opacityStart: v.pipe(v.number(), v.toMinValue(0), v.toMaxValue(1)),
    scaleEasing: v.tuple([v.number(), v.number(), v.number(), v.number()]),
    scaleEnd: v.pipe(v.number(), v.toMinValue(0)),
    scaleStart: v.pipe(v.number(), v.toMinValue(0)),
});

export const defaultSparkConfig: SparkConfig = {
    active: true,
    components: ['💸', '🔥'],
    distanceEasing: [0.25, 0, 0.8, 1.2],
    distanceStart: 0,
    durationMs: 1000,
    frameRate: 50,
    intensity: 1,
    maxDistancePx: 600,
    maxSpawnIntervalMs: 500,
    minDistancePx: 200,
    minSpawnIntervalMs: 50,
    onRemove: () => {},
    onSpawn: () => {},
    opacityEasing: [0.25, 0, 0.8, 1.2],
    opacityEnd: 0,
    opacityStart: 1,
    scaleEasing: [0.25, 0, 0.8, 1.2],
    scaleEnd: 5,
    scaleStart: 0.5,
};

export const buildSparkConfig = (sparkConfigOverrides: Partial<SparkConfig> = {}) => {
    return v.parse(SparkConfigSchema, {
        ...defaultSparkConfig,
        ...sparkConfigOverrides,
    });
};
