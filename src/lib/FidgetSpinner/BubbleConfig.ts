import * as v from 'valibot';

import {EasingSchema} from './toBezierEasing';

export type BubbleConfig = {
    /** Whether the bubble spawner is active or not - setting the component as active will stop the animation loop */
    active: boolean;
    /** The components to use for the bubbles - each bubble will be a random component from this array */
    components: React.ReactNode[];
    /** The duration of the bubble animation */
    durationMs: number;
    /** The randomness in the duration of the bubble animation */
    durationMsRandomness: number;
    /** The ending scale of the bubble */
    scaleEnd: number;
    /** The randomness in the ending scale of the bubble */
    scaleEndRandomness: number;
    /** The frame rate of the animation */
    frameRate: number;
    /** The maximum time between spawning bubbles */
    maxSpawnIntervalMs: number;
    /** The minimum time between spawning bubbles */
    minSpawnIntervalMs: number;
    /** The callback function that is called when a bubble is removed */
    onRemove: () => void;
    /** The callback function that is called when a bubble is spawned */
    onSpawn: () => void;
    /** The ending opacity of the bubble */
    opacityEnd: number;
    /** The bezier curve definition which controls the opacity of the bubble over time */
    opacityEasing: [number, number, number, number];
    /** The starting opacity of the bubble */
    opacityStart: number;
    /** The bezier curve definition which controls the scale of the bubble over time */
    scaleEasing: [number, number, number, number];
    /** The starting scale of the bubble */
    scaleStart: number;
    /** The randomness in the starting scale of the bubble */
    scaleStartRandomness: number;
    /** The amplitude of the wobble animation */
    wobbleAmplitude: number;
    /** The randomness in the amplitude of the wobble animation */
    wobbleAmplitudeRandomness: number;
    /** The frequency of the wobble animation */
    wobbleFrequency: number;
    /** The randomness in the frequency of the wobble animation */
    wobbleFrequencyRandomness: number;
    /** The randomness in the x position of the bubble */
    xOffsetRandomness: number;
    /** The bezier curve definition which controls the y position of the bubble over time */
    yEasing: [number, number, number, number];
    /** The y position of the bubble when it reaches the end of its animation - nb: +ve `y` is up (which is the opposite of the html definition of positive y) */
    yEnd: number;
    /** The randomness in the y position of the bubble when it reaches the end of its animation */
    yRandomness: number;
    /** The starting y position of the bubble */
    yStart: number;
};

export const BubbleConfigSchema = v.object({
    active: v.boolean(),
    components: v.array(v.string()),
    durationMs: v.pipe(v.number(), v.toMinValue(0)),
    durationMsRandomness: v.pipe(v.number(), v.toMinValue(0)),
    scaleEnd: v.pipe(v.number(), v.toMinValue(0)),
    scaleEndRandomness: v.pipe(v.number(), v.toMinValue(0)),
    frameRate: v.pipe(v.number(), v.toMinValue(0)),
    maxSpawnIntervalMs: v.pipe(v.number(), v.toMinValue(0)),
    minSpawnIntervalMs: v.pipe(v.number(), v.toMinValue(0)),
    onRemove: v.function(),
    onSpawn: v.function(),
    opacityEasing: EasingSchema,
    opacityEnd: v.pipe(v.number(), v.toMinValue(0), v.toMaxValue(1)),
    opacityStart: v.pipe(v.number(), v.toMinValue(0), v.toMaxValue(1)),
    scaleEasing: EasingSchema,
    scaleStart: v.pipe(v.number(), v.toMinValue(0)),
    scaleStartRandomness: v.pipe(v.number(), v.toMinValue(0)),
    wobbleAmplitude: v.pipe(v.number(), v.toMinValue(0)),
    wobbleAmplitudeRandomness: v.pipe(v.number(), v.toMinValue(0)),
    wobbleFrequency: v.pipe(v.number(), v.toMinValue(0)),
    wobbleFrequencyRandomness: v.pipe(v.number(), v.toMinValue(0)),
    xOffsetRandomness: v.pipe(v.number(), v.toMinValue(0)),
    yEasing: EasingSchema,
    yEnd: v.number(),
    yRandomness: v.pipe(v.number(), v.toMinValue(0)),
    yStart: v.number(),
});

export const defaultBubbleConfig: BubbleConfig = {
    active: false,
    components: ['💸', '🔥'],
    durationMs: 1500,
    durationMsRandomness: 1000,
    scaleEnd: 2,
    scaleEndRandomness: 0.2,
    frameRate: 60,
    maxSpawnIntervalMs: 1000,
    minSpawnIntervalMs: 200,
    onRemove: () => {},
    onSpawn: () => {},
    opacityEasing: [0.25, -0.75, 0.8, 1.2],
    opacityEnd: 0,
    opacityStart: 1,
    scaleEasing: [0.25, -0.75, 0.8, 1.2],
    scaleStart: 1,
    scaleStartRandomness: 0.5,
    wobbleAmplitude: 1,
    wobbleAmplitudeRandomness: 40,
    wobbleFrequency: 0.1,
    wobbleFrequencyRandomness: 0.5,
    xOffsetRandomness: 100,
    yEasing: [0.25, 0, 0.8, 1.2],
    yEnd: 100,
    yRandomness: 200,
    yStart: 0,
};

export const buildBubbleConfig = (bubbleConfigOverrides: Partial<BubbleConfig> = {}) => {
    const input = {
        ...defaultBubbleConfig,
        ...bubbleConfigOverrides,
    };
    return v.parse(BubbleConfigSchema, input);
};
