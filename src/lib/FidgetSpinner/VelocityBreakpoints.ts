import * as v from 'valibot';

import type {BubbleConfig} from './BubbleConfig';
import {BubbleConfigSchema, buildBubbleConfig} from './BubbleConfig';
import type {SparkConfig} from './SparkConfig';
import {buildSparkConfig, SparkConfigSchema} from './SparkConfig';
import type {ScaleConfig} from './ScaleConfig';
import {buildScaleConfig, ScaleConfigSchema} from './ScaleConfig';
import type {ResetConfig} from './ResetConfig';
import {buildResetConfig, ResetConfigSchema} from './ResetConfig';

const VelocityBreakpointConfigSchema = v.object({
    scaleConfig: ScaleConfigSchema,
    bubbleConfig: BubbleConfigSchema,
    sparkConfig: SparkConfigSchema,
    resetConfig: ResetConfigSchema,
});

export const VelocityBreakpointSchema = v.object({
    breakpoint: v.pipe(v.number(), v.toMinValue(0), v.toMaxValue(1)),
    config: VelocityBreakpointConfigSchema,
});
export type VelocityBreakpointConfig = v.InferOutput<typeof VelocityBreakpointConfigSchema>;

export type VelocityBreakpoint = v.InferOutput<typeof VelocityBreakpointSchema>;

export const VelocityBreakpointConfigsSchema = v.array(VelocityBreakpointSchema);
export type VelocityBreakpoints = v.InferOutput<typeof VelocityBreakpointConfigsSchema>;

export const defaultVelocityBreakpoints: VelocityBreakpointInput[] = [
    {
        breakpoint: 0.9,
        config: {
            scaleConfig: {scale: 3},
        },
    },
    {
        breakpoint: 0.7,
        config: {
            scaleConfig: {scale: 2},
        },
    },
    {
        breakpoint: 0.3,
        config: {
            scaleConfig: {scale: 1.5},
        },
    },
];

type VelocityBreakpointConfigInput = {
    scaleConfig?: Partial<ScaleConfig>;
    bubbleConfig?: Partial<BubbleConfig>;
    sparkConfig?: Partial<SparkConfig>;
    resetConfig?: Partial<ResetConfig>;
};

type VelocityBreakpointInput = {
    breakpoint: number;
    config: VelocityBreakpointConfigInput;
};

export const buildVelocityBreakpoint = (breakpointInput: VelocityBreakpointInput) => {
    const {breakpoint, config} = breakpointInput;

    const {scaleConfig, bubbleConfig, sparkConfig, resetConfig} = config;

    return v.parse(VelocityBreakpointSchema, {
        breakpoint,
        config: {
            scaleConfig: buildScaleConfig(scaleConfig),
            bubbleConfig: buildBubbleConfig(bubbleConfig),
            sparkConfig: buildSparkConfig(sparkConfig),
            resetConfig: buildResetConfig(resetConfig),
        },
    });
};

export const buildVelocityBreakpoints = (
    breakpointInputs: VelocityBreakpointInput[] = defaultVelocityBreakpoints,
    baseConfig: VelocityBreakpointConfigInput
) => {
    const breakpoints = breakpointInputs.map(breakpointInput => {
        const breakpointInputConfig = breakpointInput.config;

        const mergedConfig = {
            scaleConfig: {
                ...baseConfig.scaleConfig,
                ...breakpointInputConfig.scaleConfig,
            },
            bubbleConfig: {
                ...baseConfig.bubbleConfig,
                ...breakpointInputConfig.bubbleConfig,
            },
            sparkConfig: {
                ...baseConfig.sparkConfig,
                ...breakpointInputConfig.sparkConfig,
            },
            resetConfig: {
                ...baseConfig.resetConfig,
                ...breakpointInputConfig.resetConfig,
            },
        };

        return buildVelocityBreakpoint({...breakpointInput, config: mergedConfig});
    });
    return v.parse(VelocityBreakpointConfigsSchema, breakpoints);
};
