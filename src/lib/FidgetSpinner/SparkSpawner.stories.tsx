import type {Meta, StoryObj} from '@storybook/react';

import {SparkSpawner} from './Sparks';
import {buildSparkConfig} from './SparkConfig';

const meta = {
    title: 'Sparks/SparkSpawner',
    component: SparkSpawner,
} as Meta<typeof SparkSpawner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
    render: args => {
        return <SparkSpawner {...args} />;
    },
    args: buildSparkConfig({active: true}),
};
