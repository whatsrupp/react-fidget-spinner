import * as v from 'valibot';

import {type NumericControl, NumericControlSchema} from './NumericControl';

export const ClickConfigSchema = v.object({
    angularVelocityPerClick: NumericControlSchema,
    onSpawn: v.function(),
    onRemove: v.function(),
    active: v.boolean(),
});

export type ClickConfig = {
    angularVelocityPerClick: NumericControl;
    onSpawn: () => void;
    onRemove: () => void;
    active: boolean;
};

export const defaultClickConfig: ClickConfig = {
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
