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

type NumericalControlWithVariation = {
    value: number;
    variation?: VariationConfig;
};

export const NumericalVariationSchema = v.object({
    type: v.union([v.literal(VariationType.Plus), v.literal(VariationType.Minus), v.literal(VariationType.PlusMinus)]),
    unit: v.union([v.literal(VariationUnit.Percent), v.literal(VariationUnit.Absolute)]),
    value: v.number(),
});

export const NumberWithVariationSchema = v.object({
    value: v.number(),
    variation: v.optional(NumericalVariationSchema),
});

export const NumericalControlSchema = v.union([
    v.number(),
    v.object({
        value: v.number(),
        variation: v.optional(NumericalVariationSchema),
    }),
]);

export type NumericalControl = NumericalControlWithVariation | number;

export const toNumber = (numericalControl: NumericalControl) => {
    if (typeof numericalControl === 'number') {
        return numericalControl;
    }

    if (!numericalControl.variation) {
        return numericalControl.value;
    }

    const {variation, value: baseValue} = numericalControl;

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
