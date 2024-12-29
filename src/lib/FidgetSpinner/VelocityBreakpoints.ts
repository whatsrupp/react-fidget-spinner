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
            bubbleConfig: {},
            sparkConfig: {},
            resetConfig: {},
        },
    },
    {
        breakpoint: 0.7,
        config: {
            scaleConfig: {scale: 2},
            bubbleConfig: {},
            sparkConfig: {},
            resetConfig: {},
        },
    },
    {
        breakpoint: 0.3,
        config: {
            scaleConfig: {scale: 1.5},
            bubbleConfig: {},
            sparkConfig: {},
            resetConfig: {},
        },
    },
];

type VelocityBreakpointConfigInput = {
    scaleConfig: Partial<ScaleConfig>;
    bubbleConfig: Partial<BubbleConfig>;
    sparkConfig: Partial<SparkConfig>;
    resetConfig: Partial<ResetConfig>;
};

type VelocityBreakpointInput = {
    breakpoint: number;
    config: Partial<VelocityBreakpointConfigInput>;
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

export const buildVelocityBreakpoints = (breakpointInputs: VelocityBreakpointInput[] = defaultVelocityBreakpoints) => {
    const breakpoints = breakpointInputs.map(breakpointInput => buildVelocityBreakpoint(breakpointInput));
    return v.parse(VelocityBreakpointConfigsSchema, breakpoints);
};
