import type {Meta, StoryObj} from '@storybook/react';

import {Bubbles} from './Bubbles';
import {buildBubbleConfig} from './BubbleConfig';

const meta = {
    title: 'Particles/Bubbles',
    component: Bubbles,
    args: buildBubbleConfig({active: true}),
} satisfies Meta<typeof Bubbles>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
    render: args => {
        return <Bubbles {...args} />;
    },
};
