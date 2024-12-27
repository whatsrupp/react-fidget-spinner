import * as v from 'valibot';

type SpinnerConfigCallbacks = {
    onMaxAngularVelocity: () => void;
    onClick: () => void;
};

export const SpinnerConfig = v.object({
    dampingCoefficient: v.pipe(v.number(), v.toMinValue(0), v.toMaxValue(1)),
    initialAngle: v.pipe(v.number(), v.toMinValue(0), v.toMaxValue(Math.PI * 2)),
    initialAngularVelocity: v.pipe(v.number(), v.toMinValue(0)),
    maxAngularVelocity: v.pipe(v.number(), v.toMinValue(0)),
    onMaxAngularVelocity: v.function(),
    onClick: v.function(),
    direction: v.union([v.literal('clockwise'), v.literal('counterclockwise')]),
});

export type SpinnerConfig = Omit<v.InferOutput<typeof SpinnerConfig>, keyof SpinnerConfigCallbacks> &
    SpinnerConfigCallbacks;

export const defaultSpinnerConfig: SpinnerConfig = {
    dampingCoefficient: 0.5,
    initialAngle: 0,
    initialAngularVelocity: 0,
    maxAngularVelocity: Math.PI * 20,
    onMaxAngularVelocity: () => {},
    onClick: () => {},
    direction: 'clockwise',
};

export const buildSpinnerConfig = (spinnerConfigOverrides: Partial<SpinnerConfig> = {}) => {
    return v.parse(SpinnerConfig, {
        ...defaultSpinnerConfig,
        ...spinnerConfigOverrides,
    });
};
