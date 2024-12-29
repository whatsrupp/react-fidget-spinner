import type {Meta, StoryObj} from '@storybook/react';

import {Sparks} from './Sparks';
import {buildSparkConfig} from './SparkConfig';

const meta = {
    title: 'Particles/Sparks',
    component: Sparks,
} as Meta<typeof Sparks>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
    render: args => {
        return <Sparks {...args} />;
    },
    args: buildSparkConfig({active: true}),
};
