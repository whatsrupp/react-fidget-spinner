import * as v from 'valibot';

export enum VariationType {
    Plus = 'Plus',
    Minus = 'Minus',
    PlusMinus = 'PlusMinus',
}

export enum VariationUnit {
    Percent = 'Percent',
    Absolute = 'Absolute',
}

export type VariationConfig = {
    type: VariationType;
    unit: VariationUnit;
    value: number;
};

type NumericControlWithVariation = {
    value: number;
    variation?: VariationConfig;
};

export const NumericVariationSchema = v.object({
    type: v.union([v.literal(VariationType.Plus), v.literal(VariationType.Minus), v.literal(VariationType.PlusMinus)]),
    unit: v.union([v.literal(VariationUnit.Percent), v.literal(VariationUnit.Absolute)]),
    value: v.number(),
});

export const NumberWithVariationSchema = v.object({
    value: v.number(),
    variation: v.optional(NumericVariationSchema),
});

export const NumericControlSchema = v.union([
    v.number(),
    v.object({
        value: v.number(),
        variation: v.optional(NumericVariationSchema),
    }),
]);

export type NumericControl = NumericControlWithVariation | number;

export const toNumber = (numericControl: NumericControl) => {
    if (typeof numericControl === 'number') {
        return numericControl;
    }

    if (!numericControl.variation) {
        return numericControl.value;
    }

    const {variation, value: baseValue} = numericControl;

    const centredRandom = Math.random() * 2 - 1;

    if (variation.unit === VariationUnit.Absolute) {
        if (variation.type === VariationType.Plus) {
            return baseValue + Math.random() * variation.value;
        } else if (variation.type === VariationType.Minus) {
            return baseValue - Math.random() * variation.value;
        } else if (variation.type === VariationType.PlusMinus) {
            return baseValue + centredRandom * variation.value;
        }

        throw new Error('Invalid variation type');
    } else if (variation.unit === VariationUnit.Percent) {
        const percentage = variation.value / 100;

        if (variation.type === VariationType.Plus) {
            return baseValue + baseValue * Math.random() * percentage;
        } else if (variation.type === VariationType.Minus) {
            return baseValue - baseValue * Math.random() * percentage;
        } else if (variation.type === VariationType.PlusMinus) {
            return baseValue + baseValue * centredRandom * percentage;
        }
        throw new Error('Invalid variation type');
    } else {
        throw new Error('Invalid variation unit');
    }
};
