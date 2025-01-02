import type {Meta, StoryObj} from '@storybook/react';

import {FidgetSpinner} from './FidgetSpinner';
import {buildScaleConfig} from './ScaleConfig';
import {buildResetConfig} from './ResetConfig';
import {buildBubbleConfig} from './BubbleConfig';
import {buildSparkConfig} from './SparkConfig';
import {buildSpinnerConfig} from './SpinnerConfig';
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
        bubbleConfig: {
            ...baseConfig.bubbleConfig,
            components: ['ooh ooh', 'ah ah', 'oh oh', 'oo oo', 'ee oo', 'ee ee'],
            scaleEnd: 0,
            scaleStart: 1,
            durationMs: 1000,
        },
        sparkConfig: {
            ...baseConfig.sparkConfig,
            components: ['🍌', '🥜'],
            scaleEnd: 2,
            scaleStart: 0.2,
            durationMs: 2000,
            maxDistancePx: 500,
        },
        velocityBreakpoints: [],
    },
    parameters: {
        backgrounds: {
            default: 'purple',
        },
    },
    render: args => {
        return (
            <FidgetSpinner {...args}>
                <Text>🦧</Text>
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

export const VelocityBreakpoints: Story = {
    args: {
        bubbleConfig: {
            components: ['vroom', 'beep beep', 'zoom', 'nyoom'],
        },
        sparkConfig: {
            components: ['🏁', '🚥', '⛽', '🔰', '🛣️', '💨'],
        },
        velocityBreakpoints: [
            {
                breakpoint: 0.9,
                config: {
                    scaleConfig: {scale: 4},
                },
            },
            {
                breakpoint: 0.6,
                config: {
                    scaleConfig: {scale: 2},
                },
            },
            {
                breakpoint: 0.3,
                config: {
                    scaleConfig: {scale: 0.5},
                },
            },
        ],
    },
    parameters: {
        backgrounds: {
            default: 'red',
        },
    },

    render: args => {
        return (
            <FidgetSpinner {...args}>
                <Text>🏎️</Text>
            </FidgetSpinner>
        );
    },
};
