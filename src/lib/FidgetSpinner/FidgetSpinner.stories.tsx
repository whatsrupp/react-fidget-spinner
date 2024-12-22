import type {Meta, StoryObj} from '@storybook/react';

import {FidgetSpinner} from './FidgetSpinner';
import {BubbleSpawner} from './Bubble';

const meta = {
    title: 'Example/FidgetSpinner',
    component: FidgetSpinner,
    parameters: {
        // More on how to position stories at: https://storybook.js.org/docs/react/configure/story-layout
        layout: 'fullscreen',
    },
} as Meta<typeof FidgetSpinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
    render: args => {
        return <FidgetSpinner {...args} />;
    },
    args: {},
};

export const WithCode: Story = {
    render: args => {
        // here comes the code
        return <FidgetSpinner {...args} />;
    },
};

export const BubbleSpawnerStory: Story = {
    render: args => {
        return (
            <div style={{width: 500, height: 500, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                <BubbleSpawner {...args} />
            </div>
        );
    },
};

WithCode.args = {};

WithCode.argTypes = {};

WithCode.parameters = {
    docs: {
        source: {
            language: 'tsx',
            type: 'code',
        },
    },
};
