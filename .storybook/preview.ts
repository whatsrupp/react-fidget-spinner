import type {Preview} from '@storybook/react';

const preview: Preview = {
    parameters: {
        layout: 'centered',
        backgrounds: {
            default: 'light',
            values: [{name: 'light', value: '#F3D173'}],
        },
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
    },
};

export default preview;
