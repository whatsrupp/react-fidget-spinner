# React Fidget Spinner

[![CI](https://github.com/whatsrupp/react-fidget-spinner/actions/workflows/merge-jobs.yml/badge.svg)](https://github.com/morewings/react-library-template/actions/workflows/merge-jobs.yml)
[![Storybook deploy](https://github.com/whatsrupp/react-fidget-spinner/actions/workflows/pages.yml/badge.svg)](https://github.com/whatsrupp/react-fidget-spinner/actions/workflows/pages.yml)
[![Storybook](https://cdn.jsdelivr.net/gh/storybookjs/brand@main/badge/badge-storybook.svg)](https://whatsrupp.github.io/react-fidget-spinner/?path=/docs/spinners-fidgetspinner--welcome)
[![npm version](https://img.shields.io/npm/v/react-fidget-spinner.svg)](https://www.npmjs.com/package/react-fidget-spinner)
Turn any react component into a fun clickable fidget spinner.

[![a silly goose](https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExMXFtdWc1eDVxcGd6dzMzbTI2ejV5bm1nbXZqa2w2cDRlM3VnZDZzeSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/p00fPNBjCUAKqogAyr/giphy.gif)](https://whatsrupp.github.io/react-fidget-spinner)

*not just this goose* 🪿


## Quickstart

```bash
npm i react-fidget-spinner
```

```jsx
import {FidgetSpinner} from "react-fidget-spinner"


const MyFidgetSpinner = () => {
    return (
        <FidgetSpinner>
            <MyComponent>
        </FidgetSpinner>
    )
}
```

## Where are the full docs?

Interactive examples and full documentation can be found on [Storybook](https://whatsrupp.github.io/react-fidget-spinner/?path=/docs/spinners-fidgetspinner--welcome).

## Features

- 🎡 Physics-based flywheel spinner animation and interaction
- ✨ Spark Particles
- 🫧 Bubble Particles
- 💥 Click Animation
- 🦣 Scaling Animation
- 🏎️ Velocity Breakpoints - Change your configuration based on the velocity of the spinner.
- 🎨 Highly customisable animations with full defaults to get you started
- 🔫 Callback triggers for all key events

## Context

Adding fun easter eggs into projects is often overlooked - It's often hard to justify the time investment from a business (or even personal) perspective.

But Users often _love_, remember and share these little interactions. There's always a bit of joy in finding something hidden.

I thought it could be a nice to spend a bit of time over the holiday season building something light and interactive that other people could use to quickly sprinkle a bit of fun around their existing comopnents. So, here it is... A silly component that turns whatever you want into a clickable spinning interactive widget.

I also took this as a nice opportunity to publish my first public npm package and learn a bit more about storybook (which I really enjoyed, especially given how the entire value of the component comes from interacting with the spinner live)

## Shoutouts

- [react-library-template](https://github.com/morewings/react-library-template) - I used this as a starting point for this project. It was a really painless way of publishing an npm package that was backed by good docs with storybook. Thank you [morewings](https://github.com/morewings)
- [react-confetti](https://www.npmjs.com/package/react-confetti) - A package that made fun and excitement quick and easy to add into another project and inspired this one. Really fun.

## Contibuting

I would love to hear any ideas or feedback from you. If you have made anything with this, let me know - it will make my day.

Feel free to open issues, send me a message or submit a PR and I will try and respond ❤️

## Roadmap

Further work on this project could include things like:

- Throttling of animations
- Make it clearer that the component is interactive, maybe a shake?
- Linear scaling of effects based on speeds instead of breakpoints
- Validation of inputs properly
- Scoring
- Exposing things like current speed via refs
- Explosions at max speed

## Breaking Changes

I will try and avoid breaking changes but if there are early signs or feedback that the interfaces could be clearer then I will likely change them.
