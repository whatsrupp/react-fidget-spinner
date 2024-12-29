import type {Meta, StoryObj} from '@storybook/react';

import {FidgetSpinner} from './FidgetSpinner';
import {buildScaleConfig} from './ScaleConfig';
import {buildResetConfig} from './ResetConfig';
import {buildBubbleConfig} from './BubbleConfig';
import {buildSparkConfig} from './SparkConfig';
import {buildSpinnerConfig} from './SpinnerConfig';
import {buildVelocityBreakpoints} from './VelocityBreakpoints';

const meta = {
    title: 'Spinner/FidgetSpinner',
    component: FidgetSpinner,
} satisfies Meta<typeof FidgetSpinner>;

export default meta;
type Story = StoryObj<typeof meta>;

const SillyGoose = () => {
    return <div style={{userSelect: 'none', fontSize: '4rem'}}>🪿</div>;
};

export const Primary: Story = {
    args: {
        bubbleConfig: buildBubbleConfig(),
        resetConfig: buildResetConfig(),
        scaleConfig: buildScaleConfig(),
        sparkConfig: buildSparkConfig(),
        spinnerConfig: buildSpinnerConfig(),
        velocityBreakpoints: buildVelocityBreakpoints(),
    },
    render: args => {
        return (
            <FidgetSpinner {...args}>
                <SillyGoose />
            </FidgetSpinner>
        );
    },
};
