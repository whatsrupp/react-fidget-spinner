import BezierEasing from 'bezier-easing';

export const toBezierEasing = (easing: readonly [number, number, number, number]) => {
    return BezierEasing(easing[0], easing[1], easing[2], easing[3]);
};
