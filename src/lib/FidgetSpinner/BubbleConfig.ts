import * as v from 'valibot';

import {EasingSchema} from './toBezierEasing';

type BubbleConfigCallbacks = {
    onSpawn: () => void;
    onRemove: () => void;
};

export const BubbleConfigSchema = v.object({
    minSpawnInterval: v.pipe(v.number(), v.toMinValue(0)),
    maxSpawnInterval: v.pipe(v.number(), v.toMinValue(0)),
    components: v.array(v.string()),
    durationMs: v.pipe(v.number(), v.toMinValue(0)),
    durationMsRandomness: v.pipe(v.number(), v.toMinValue(0)),
    yEnd: v.number(),
    yRandomness: v.pipe(v.number(), v.toMinValue(0)),
    velocityEasing: EasingSchema,
    opacityEasing: EasingSchema,
    opacityStart: v.pipe(v.number(), v.toMinValue(0), v.toMaxValue(1)),
    opacityEnd: v.pipe(v.number(), v.toMinValue(0), v.toMaxValue(1)),
    startScale: v.pipe(v.number(), v.toMinValue(0)),
    startScaleRandomness: v.pipe(v.number(), v.toMinValue(0)),
    scaleEasing: EasingSchema,
    endScale: v.pipe(v.number(), v.toMinValue(0)),
    endScaleRandomness: v.pipe(v.number(), v.toMinValue(0)),
    wobbleFrequency: v.pipe(v.number(), v.toMinValue(0)),
    wobbleFrequencyRandomness: v.pipe(v.number(), v.toMinValue(0)),
    wobbleAmplitude: v.pipe(v.number(), v.toMinValue(0)),
    wobbleAmplitudeRandomness: v.pipe(v.number(), v.toMinValue(0)),
    xOffsetRandomness: v.pipe(v.number(), v.toMinValue(0)),
    yEasing: EasingSchema,
    yStart: v.number(),
    frameRate: v.pipe(v.number(), v.toMinValue(0)),
    active: v.boolean(),
    onSpawn: v.function(),
    onRemove: v.function(),
});

export type BubbleConfig = Omit<
    Omit<v.InferOutput<typeof BubbleConfigSchema>, keyof BubbleConfigCallbacks>,
    'components'
> & {
    components: readonly React.ReactNode[];
} & BubbleConfigCallbacks;

export const defaultBubbleConfig: BubbleConfig = {
    minSpawnInterval: 1000,
    maxSpawnInterval: 5000,
    components: ['💸', '🔥'],
    durationMs: 1500,
    durationMsRandomness: 1000,
    yEnd: 100,
    yRandomness: 200,
    velocityEasing: [0.25, 0, 0.8, 1.2],
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
    yEasing: [0.25, 0, 0.8, 1.2],
    yStart: 0,
    frameRate: 60,
    active: false,
    onSpawn: () => {},
    onRemove: () => {},
};

export const buildBubbleConfig = (bubbleConfigOverrides: Partial<BubbleConfig> = {}) => {
    return v.parse(BubbleConfigSchema, {
        ...defaultBubbleConfig,
        ...bubbleConfigOverrides,
    });
};
