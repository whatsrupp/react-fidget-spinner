import * as v from 'valibot';

import {EasingSchema} from './toBezierEasing';
type ScaleConfigCallbacks = {
    onScaleChange: (scale: number) => void;
    onScaleStart: () => void;
    onScaleEnd: () => void;
};

export const ScaleConfigSchema = v.object({
    scale: v.pipe(v.number(), v.toMinValue(0)),
    scaleEasing: EasingSchema,
    scaleDurationMs: v.pipe(v.number(), v.toMinValue(0)),
    onScaleChange: v.function(),
    onScaleStart: v.function(),
    onScaleEnd: v.function(),
});

export type ScaleConfig = Omit<v.InferOutput<typeof ScaleConfigSchema>, keyof ScaleConfigCallbacks> &
    ScaleConfigCallbacks;

export const defaultScaleConfig: ScaleConfig = {
    scale: 1,
    scaleEasing: [0.25, -0.75, 0.8, 1.2],
    scaleDurationMs: 500,
    onScaleChange: () => {},
    onScaleStart: () => {},
    onScaleEnd: () => {},
};

export const buildScaleConfig = (scaleConfigOverrides: Partial<ScaleConfig> = {}) => {
    return v.parse(ScaleConfigSchema, {
        ...defaultScaleConfig,
        ...scaleConfigOverrides,
    });
};
