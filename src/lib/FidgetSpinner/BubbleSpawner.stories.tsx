import type {Meta, StoryObj} from '@storybook/react';

import {BubbleSpawner} from './Bubble';
import {buildBubbleConfig} from './BubbleConfig';

const meta = {
    title: 'Bubbles/BubbleSpawner',
    component: BubbleSpawner,
} as Meta<typeof BubbleSpawner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
    render: args => {
        return <BubbleSpawner {...args} />;
    },
    args: buildBubbleConfig({active: true}),
};
