import * as v from 'valibot';

import type {NumericalControl} from './NumericalControl';
import {NumericalControlSchema, VariationType, VariationUnit} from './NumericalControl';

export type SparkConfig = {
    /** Whether the spark spawner is active or not - setting the component as active will stop the animation loop */
    active: boolean;
    /** The components to use for the sparks - each spark will be a random component from this array */
    components: React.ReactNode[];
    /** The bezier curve definition which controls the distance of the spark over time */
    distanceEasing: [number, number, number, number];
    /** The starting distance of the spark */
    distanceStart: NumericalControl;
    /** The ending distance of the spark */
    distanceEnd: NumericalControl;
    /** The duration of the spark animation */
    durationMs: NumericalControl;
    /** The frame rate of the animation */
    frameRate: NumericalControl;
    /** The intensity of the spark */
    intensity: NumericalControl;
    /** The callback function that is called when a spark is removed */
    onRemove: () => void;
    /** The callback function that is called when a spark is spawned */
    onSpawn: () => void;
    /** The bezier curve definition which controls the opacity of the spark over time */
    opacityEasing: [number, number, number, number];
    /** The ending opacity of the spark */
    opacityEnd: NumericalControl;
    /** The starting opacity of the spark */
    opacityStart: NumericalControl;
    /** The bezier curve definition which controls the scale of the spark over time */
    scaleEasing: [number, number, number, number];
    /** The ending scale of the spark */
    scaleEnd: NumericalControl;
    /** The starting scale of the spark */
    scaleStart: NumericalControl;
    /** The interval between spawning sparks */
    spawnIntervalMs: NumericalControl;
};

export const SparkConfigSchema = v.object({
    active: v.boolean(),
    components: v.array(v.any()),
    distanceEasing: v.tuple([v.number(), v.number(), v.number(), v.number()]),
    distanceStart: NumericalControlSchema,
    distanceEnd: NumericalControlSchema,
    durationMs: NumericalControlSchema,
    frameRate: NumericalControlSchema,
    intensity: NumericalControlSchema,
    onRemove: v.function(),
    onSpawn: v.function(),
    opacityEasing: v.tuple([v.number(), v.number(), v.number(), v.number()]),
    opacityEnd: NumericalControlSchema,
    opacityStart: NumericalControlSchema,
    scaleEasing: v.tuple([v.number(), v.number(), v.number(), v.number()]),
    scaleEnd: NumericalControlSchema,
    scaleStart: NumericalControlSchema,
    spawnIntervalMs: NumericalControlSchema,
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
