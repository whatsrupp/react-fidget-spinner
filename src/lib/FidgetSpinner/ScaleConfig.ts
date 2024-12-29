import * as v from 'valibot';

import {EasingSchema} from './toBezierEasing';
type ScaleConfigCallbacks = {
    onScaleChange: (scale: number) => void;
    onScaleEnd: () => void;
    onScaleStart: () => void;
};

export const ScaleConfigSchema = v.object({
    onScaleChange: v.function(),
    onScaleEnd: v.function(),
    onScaleStart: v.function(),
    scale: v.pipe(v.number(), v.toMinValue(0)),
    scaleDurationMs: v.pipe(v.number(), v.toMinValue(0)),
    scaleEasing: EasingSchema,
});

export type ScaleConfig = Omit<v.InferOutput<typeof ScaleConfigSchema>, keyof ScaleConfigCallbacks> &
    ScaleConfigCallbacks;

export const defaultScaleConfig: ScaleConfig = {
    onScaleChange: () => {},
    onScaleEnd: () => {},
    onScaleStart: () => {},
    scale: 1,
    scaleDurationMs: 500,
    scaleEasing: [0.25, -0.75, 0.8, 1.2],
};

export const buildScaleConfig = (scaleConfigOverrides: Partial<ScaleConfig> = {}) => {
    return v.parse(ScaleConfigSchema, {
        ...defaultScaleConfig,
        ...scaleConfigOverrides,
    });
};
