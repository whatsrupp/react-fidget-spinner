import type {Meta, StoryObj} from '@storybook/react';

import {FidgetSpinner} from './FidgetSpinner';
import {buildScaleConfig} from './ScaleConfig';
import {buildResetConfig} from './ResetConfig';
import {buildBubbleConfig} from './BubbleConfig';
import {buildSparkConfig} from './SparkConfig';
import {buildSpinnerConfig} from './SpinnerConfig';
import {buildVelocityBreakpoints} from './VelocityBreakpoints';
import {SillyGoose} from './SillyGoose';
import {Text} from './Text';
import {ItalianEmojis, positiveItalianExpressions} from './constants';

const meta = {
    title: 'Spinners/FidgetSpinner',
    component: FidgetSpinner,
} satisfies Meta<typeof FidgetSpinner>;

export default meta;
type Story = StoryObj<typeof meta>;

const baseConfig = {
    scaleConfig: buildScaleConfig(),
    resetConfig: buildResetConfig(),
    bubbleConfig: buildBubbleConfig(),
    sparkConfig: buildSparkConfig(),
    spinnerConfig: buildSpinnerConfig(),
};

export const Primary: Story = {
    render: args => {
        return (
            <FidgetSpinner {...args}>
                <SillyGoose />
            </FidgetSpinner>
        );
    },
};

export const FullConfiguration: Story = {
    args: {
        ...baseConfig,
        velocityBreakpoints: buildVelocityBreakpoints(undefined, baseConfig),
    },
    render: args => {
        return (
            <FidgetSpinner {...args}>
                <SillyGoose />
            </FidgetSpinner>
        );
    },
};

export const TasteOfItaly: Story = {
    args: {
        bubbleConfig: {
            components: ItalianEmojis,
        },
        sparkConfig: {
            components: positiveItalianExpressions,
        },
    },
    parameters: {
        backgrounds: {
            default: 'blue',
        },
    },
    render: args => {
        return (
            <FidgetSpinner {...args}>
                <Text>🤌</Text>
            </FidgetSpinner>
        );
    },
};
