import * as v from 'valibot';

type SparkConfigCallbacks = {
    onSpawn: () => void;
    onRemove: () => void;
};

export const SparkConfigSchema = v.object({
    components: v.array(v.any()),
    minSpawnIntervalMs: v.pipe(v.number(), v.toMinValue(0)),
    maxSpawnIntervalMs: v.pipe(v.number(), v.toMinValue(0)),
    durationMs: v.pipe(v.number(), v.toMinValue(0)),
    maxDistancePx: v.pipe(v.number(), v.toMinValue(0)),
    minDistancePx: v.pipe(v.number(), v.toMinValue(0)),
    distanceStart: v.number(),
    distanceEasing: v.tuple([v.number(), v.number(), v.number(), v.number()]),
    opacityEasing: v.tuple([v.number(), v.number(), v.number(), v.number()]),
    opacityStart: v.pipe(v.number(), v.toMinValue(0), v.toMaxValue(1)),
    opacityEnd: v.pipe(v.number(), v.toMinValue(0), v.toMaxValue(1)),
    scaleEasing: v.tuple([v.number(), v.number(), v.number(), v.number()]),
    scaleStart: v.pipe(v.number(), v.toMinValue(0)),
    scaleEnd: v.pipe(v.number(), v.toMinValue(0)),
    frameRate: v.pipe(v.number(), v.toMinValue(0)),
    active: v.boolean(),
    intensity: v.pipe(v.number(), v.toMinValue(0)),
    onSpawn: v.function(),
    onRemove: v.function(),
});

export type SparkConfig = Omit<
    Omit<v.InferOutput<typeof SparkConfigSchema>, keyof SparkConfigCallbacks>,
    'components'
> & {
    components: readonly React.ReactNode[];
} & SparkConfigCallbacks;

export const defaultSparkConfig: SparkConfig = {
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
    frameRate: 50,
    active: false,
    intensity: 1,
    onSpawn: () => {},
    onRemove: () => {},
};

export const buildSparkConfig = (sparkConfigOverrides: Partial<SparkConfig> = {}) => {
    return v.parse(SparkConfigSchema, {
        ...defaultSparkConfig,
        ...sparkConfigOverrides,
    });
};
