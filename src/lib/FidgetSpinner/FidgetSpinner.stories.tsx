import type {Meta, StoryObj} from '@storybook/react';

import {FidgetSpinner} from './FidgetSpinner';
import {buildScaleConfig} from './ScaleConfig';
import {buildResetConfig} from './ResetConfig';
import {buildBubbleConfig} from './BubbleConfig';
import {buildSparkConfig} from './SparkConfig';
import {buildSpinnerConfig} from './SpinnerConfig';
import {buildVelocityBreakpointConfigs} from './VelocityBreakpoints';

const args = {
    scaleConfig: buildScaleConfig({}),
    resetConfig: buildResetConfig({}),
    bubbleConfig: buildBubbleConfig({}),
    sparkConfig: buildSparkConfig({}),
    spinnerConfig: buildSpinnerConfig({}),
    velocityBreakpoints: buildVelocityBreakpointConfigs(),
};

const meta = {
    title: 'Spinner/FidgetSpinner',
    component: FidgetSpinner,
} as Meta<typeof FidgetSpinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
    render: args => {
        return <FidgetSpinner {...args} />;
    },
    args,
};
