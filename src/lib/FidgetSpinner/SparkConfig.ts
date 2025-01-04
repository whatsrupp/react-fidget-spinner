import * as v from 'valibot';

import type {NumericControl} from './NumericControl';
import {NumericControlSchema, VariationType, VariationUnit} from './NumericControl';

export type SparkConfig = {
    /** Whether the spark spawner is active or not - setting the component as active will stop the animation loop */
    active: boolean;
    /** The components to use for the sparks - each spark will be a random component from this array */
    components: React.ReactNode[];
    /** The bezier curve definition which controls the distance of the spark over time */
    distanceEasing: [number, number, number, number];
    /** The starting distance of the spark */
    distanceStart: NumericControl;
    /** The ending distance of the spark */
    distanceEnd: NumericControl;
    /** The duration of the spark animation */
    durationMs: NumericControl;
    /** The frame rate of the animation */
    frameRate: NumericControl;
    /** The intensity of the spark */
    intensity: NumericControl;
    /** The callback function that is called when a spark is removed */
    onRemove: () => void;
    /** The callback function that is called when a spark is spawned */
    onSpawn: () => void;
    /** The bezier curve definition which controls the opacity of the spark over time */
    opacityEasing: [number, number, number, number];
    /** The ending opacity of the spark */
    opacityEnd: NumericControl;
    /** The starting opacity of the spark */
    opacityStart: NumericControl;
    /** The bezier curve definition which controls the scale of the spark over time */
    scaleEasing: [number, number, number, number];
    /** The ending scale of the spark */
    scaleEnd: NumericControl;
    /** The starting scale of the spark */
    scaleStart: NumericControl;
    /** The interval between spawning sparks */
    spawnIntervalMs: NumericControl;
};

export const SparkConfigSchema = v.object({
    active: v.boolean(),
    components: v.array(v.any()),
    distanceEasing: v.tuple([v.number(), v.number(), v.number(), v.number()]),
    distanceStart: NumericControlSchema,
    distanceEnd: NumericControlSchema,
    durationMs: NumericControlSchema,
    frameRate: NumericControlSchema,
    intensity: NumericControlSchema,
    onRemove: v.function(),
    onSpawn: v.function(),
    opacityEasing: v.tuple([v.number(), v.number(), v.number(), v.number()]),
    opacityEnd: NumericControlSchema,
    opacityStart: NumericControlSchema,
    scaleEasing: v.tuple([v.number(), v.number(), v.number(), v.number()]),
    scaleEnd: NumericControlSchema,
    scaleStart: NumericControlSchema,
    spawnIntervalMs: NumericControlSchema,
});

export const defaultSparkConfig: SparkConfig = {
    active: true,
    components: ['💸', '🔥'],
    distanceEasing: [0.25, 0, 0.8, 1.2],
    distanceStart: 0,
    durationMs: 1000,
    frameRate: 50,
    intensity: 1,
    distanceEnd: {value: 400, variation: {type: VariationType.PlusMinus, unit: VariationUnit.Percent, value: 50}},
    onRemove: () => {},
    onSpawn: () => {},
    opacityEasing: [0.25, 0, 0.8, 1.2],
    opacityEnd: 0,
    opacityStart: 1,
    scaleEasing: [0.25, 0, 0.8, 1.2],
    scaleEnd: 5,
    scaleStart: 0.5,
    spawnIntervalMs: {
        value: 500,
        variation: {
            type: VariationType.PlusMinus,
            unit: VariationUnit.Percent,
            value: 50,
        },
    },
};

export const buildSparkConfig = (sparkConfigOverrides: Partial<SparkConfig> = {}) => {
    return v.parse(SparkConfigSchema, {
        ...defaultSparkConfig,
        ...sparkConfigOverrides,
    });
};
