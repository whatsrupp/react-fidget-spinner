import type {Preview} from '@storybook/react';

const preview: Preview = {
    tags: ['autodocs'],
    parameters: {
        deepControls: {enabled: true},
        layout: 'centered',
        backgrounds: {
            default: 'yellow',
            values: [
                {name: 'yellow', value: '#F3D173'},
                {name: 'gray', value: '#CBCBCB'},
                {name: 'blue', value: '#7395f3'},
                {name: 'red', value: '#f39173'},
                {name: 'lime', value: '#d5f373'},
                {name: 'purple', value: '#d173f3'},
                {name: 'teal', value: '#73f3d1'},
            ],
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
