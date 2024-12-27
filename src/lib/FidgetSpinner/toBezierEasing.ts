import * as v from 'valibot';
import BezierEasing from 'bezier-easing';

export const EasingSchema = v.tuple([v.number(), v.number(), v.number(), v.number()]);

export type Easing = v.InferOutput<typeof EasingSchema>;

export const toBezierEasing = (easing: Easing) => {
    return BezierEasing(easing[0], easing[1], easing[2], easing[3]);
};
