import * as v from 'valibot';

import {EasingSchema} from './toBezierEasing';
import {VariationType, VariationUnit, type NumericControl, NumericControlSchema} from './NumericControl';

export type BubbleConfig = {
    /** Whether the bubble spawner is active or not - setting the component as active will stop the animation loop */
    active: boolean;
    /** The components to use for the bubbles - each bubble will be a random component from this array */
    components: React.ReactNode[];
    /** The duration of the bubble animation */
    durationMs: NumericControl;
    /** The ending scale of the bubble */
    scaleEnd: NumericControl;
    /** The frame rate of the animation */
    frameRate: number;
    /** The callback function that is called when a bubble is removed */
    onRemove: () => void;
    /** The callback function that is called when a bubble is spawned */
    onSpawn: () => void;
    /** The ending opacity of the bubble */
    opacityEnd: NumericControl;
    /** The bezier curve definition which controls the opacity of the bubble over time */
    opacityEasing: [number, number, number, number];
    /** The starting opacity of the bubble */
    opacityStart: NumericControl;
    /** The bezier curve definition which controls the scale of the bubble over time */
    scaleEasing: [number, number, number, number];
    /** The starting scale of the bubble */
    scaleStart: NumericControl;
    /** The amplitude of the wobble animation */
    wobbleAmplitude: NumericControl;
    /** The frequency of the wobble animation */
    wobbleFrequency: NumericControl;
    /** The randomness in the x position of the bubble */
    xStart: NumericControl;
    /** The bezier curve definition which controls the y position of the bubble over time */
    yEasing: [number, number, number, number];
    /** The y position of the bubble when it reaches the end of its animation - nb: +ve `y` is up (which is the opposite of the html definition of positive y) */
    yEnd: NumericControl;
    /** The starting y position of the bubble */
    yStart: NumericControl;
    /** The interval between spawns */
    spawnIntervalMs: NumericControl;
};

export const BubbleConfigSchema = v.object({
    active: v.boolean(),
    components: v.array(v.string()),
    durationMs: NumericControlSchema,
    // durationMsRandomness: v.pipe(v.number(), v.toMinValue(0)),
    scaleEnd: NumericControlSchema,
    // scaleEndRandomness: v.pipe(v.number(), v.toMinValue(0)),
    frameRate: v.pipe(v.number(), v.toMinValue(0)),
    spawnIntervalMs: NumericControlSchema,
    // maxSpawnIntervalMs: v.pipe(v.number(), v.toMinValue(0)),
    // minSpawnIntervalMs: v.pipe(v.number(), v.toMinValue(0)),
    onRemove: v.function(),
    onSpawn: v.function(),
    opacityEasing: EasingSchema,
    opacityEnd: NumericControlSchema,
    opacityStart: NumericControlSchema,
    scaleEasing: EasingSchema,
    scaleStart: NumericControlSchema,
    // scaleStartRandomness: v.pipe(v.number(), v.toMinValue(0)),
    wobbleAmplitude: NumericControlSchema,
    // wobbleAmplitudeRandomness: v.pipe(v.number(), v.toMinValue(0)),
    wobbleFrequency: NumericControlSchema,
    // wobbleFrequencyRandomness: v.pipe(v.number(), v.toMinValue(0)),
    // xOffsetRandomness: v.pipe(v.number(), v.toMinValue(0)),
    yEasing: EasingSchema,
    yEnd: NumericControlSchema,
    // yRandomness: v.pipe(v.number(), v.toMinValue(0)),
    yStart: NumericControlSchema,
    xStart: NumericControlSchema,
});

export const defaultBubbleConfig: BubbleConfig = {
    active: false,
    components: ['💸', '🔥'],
    durationMs: {
        value: 1000,
        variation: {type: VariationType.Plus, unit: VariationUnit.Absolute, value: 1000},
    },
    scaleEnd: {
        value: 2,
        variation: {type: VariationType.PlusMinus, unit: VariationUnit.Percent, value: 20},
    },
    frameRate: 60,
    spawnIntervalMs: {
        value: 600,
        variation: {type: VariationType.PlusMinus, unit: VariationUnit.Absolute, value: 400},
    },
    onRemove: () => {},
    onSpawn: () => {},
    opacityEasing: [0.25, -0.75, 0.8, 1.2],
    opacityEnd: 0,
    opacityStart: 1,
    scaleEasing: [0.25, -0.75, 0.8, 1.2],
    scaleStart: {
        value: 1,
        variation: {type: VariationType.PlusMinus, unit: VariationUnit.Percent, value: 50},
    },
    wobbleAmplitude: {
        value: 1,
        variation: {type: VariationType.Plus, unit: VariationUnit.Absolute, value: 40},
    },
    wobbleFrequency: {
        value: 0.1,
        variation: {type: VariationType.Plus, unit: VariationUnit.Absolute, value: 0.4},
    },
    yEasing: [0.25, 0, 0.8, 1.2],
    yEnd: {
        value: 100,
        variation: {type: VariationType.Plus, unit: VariationUnit.Absolute, value: 200},
    },
    yStart: 0,
    xStart: {
        value: 0,
        variation: {type: VariationType.PlusMinus, unit: VariationUnit.Absolute, value: 100},
    },
};

export const buildBubbleConfig = (bubbleConfigOverrides: Partial<BubbleConfig> = {}) => {
    const input = {
        ...defaultBubbleConfig,
        ...bubbleConfigOverrides,
    };
    return v.parse(BubbleConfigSchema, input);
};
