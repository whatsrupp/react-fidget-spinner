import * as v from 'valibot';

import {VariationType, VariationUnit, type NumericControl, NumericControlSchema} from './NumericControl';

export const ClickConfigSchema = v.object({
    angularVelocityPerClick: NumericControlSchema,
    durationMs: NumericControlSchema,
    onSpawn: v.function(),
    onRemove: v.function(),
    active: v.boolean(),
});

export type ClickConfig = {
    durationMs: NumericControl;
    angularVelocityPerClick: NumericControl;
    onSpawn: () => void;
    onRemove: () => void;
    active: boolean;
};

export const defaultClickConfig: ClickConfig = {
    durationMs: {value: 300, variation: {type: VariationType.PlusMinus, unit: VariationUnit.Absolute, value: 100}},
    angularVelocityPerClick: Math.PI * 2,
    onSpawn: () => {},
    onRemove: () => {},
    active: true,
};

export const buildClickConfig = (clickConfigOverrides: Partial<ClickConfig> = {}) => {
    return v.parse(ClickConfigSchema, {
        ...defaultClickConfig,
        ...clickConfigOverrides,
    });
};
