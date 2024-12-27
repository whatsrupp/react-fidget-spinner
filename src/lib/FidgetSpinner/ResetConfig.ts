import * as v from 'valibot';

import {EasingSchema} from './toBezierEasing';

type ResetConfigCallbacks = {
    onResetStart: () => void;
    onResetEnd: () => void;
    onResetCancel: () => void;
};

export const ResetConfigSchema = v.object({
    durationMs: v.pipe(v.number(), v.toMinValue(0)),
    easing: EasingSchema,
    onResetStart: v.function(),
    onResetEnd: v.function(),
    onResetCancel: v.function(),
});

export type ResetConfig = Omit<v.InferOutput<typeof ResetConfigSchema>, keyof ResetConfigCallbacks> &
    ResetConfigCallbacks;

export const defaultResetConfig: ResetConfig = {
    durationMs: 200,
    easing: [0.25, -0.75, 0.8, 1.2],
    onResetStart: () => {},
    onResetEnd: () => {},
    onResetCancel: () => {},
};

export const buildResetConfig = (resetConfigOverrides: Partial<ResetConfig> = {}) => {
    return v.parse(ResetConfigSchema, {
        ...defaultResetConfig,
        ...resetConfigOverrides,
    });
};
