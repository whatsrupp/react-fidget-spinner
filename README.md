# React Fidget Spinner

[![CI](https://github.com/whatsrupp/react-fidget-spinner/actions/workflows/merge-jobs.yml/badge.svg)](https://github.com/morewings/react-library-template/actions/workflows/merge-jobs.yml)
[![Storybook deploy](https://github.com/whatsrupp/react-fidget-spinner/actions/workflows/pages.yml/badge.svg)](https://github.com/whatsrupp/react-fidget-spinner/actions/workflows/pages.yml)

Turn any react component into a clickable fidget spinner.

[![a silly goose](https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExMXFtdWc1eDVxcGd6dzMzbTI2ejV5bm1nbXZqa2w2cDRlM3VnZDZzeSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/p00fPNBjCUAKqogAyr/giphy.gif)](#)

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

Full docs and, more importantly(!), *interactive and clickable* examples on [Storybook](https://whatsrupp.github.io/react-fidget-spinner).

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

Adding fun or little easter eggs into projects is often overlooked and can often not perceived to be worth the time investment from a business (or even personal) perspective.

But Users often _love_ and sometimes remember these little interactions.

Inspired by [react-confetti](https://www.npmjs.com/package/react-confetti) which made fun easy for me, I thought it could be a nice short project to build something light and interactive that other people might be able to use. So, here it is a silly component that turns whatever you want into a spinning interactive widget.

I also took this as a nice opportunity to publish my first public npm package and learn a bit more about storybook (which I really enjoyed, especially given how the entire value of the component comes from interacting with the spinner live)

## Shoutouts

- [react-library-template](https://github.com/morewings/react-library-template) - I used this as a starting point for this project. It was a really painless way of publishing an npm package that was backed by good docs with storybook. Thank you [morewings](https://github.com/morewings)
- [react-confetti](https://www.npmjs.com/package/react-confetti)

## Contibuting

- Feel free to open issues, send me a message or submit a PR and I will try and respond ❤️

## Roadmap

Further work into this project could include things like but I'll only do these if there's interest in the project:

- [ ] Explore testing with animations
- [ ] Throttling of animations
- [ ] Make it clearer that the component is interactive, maybe a shake?
- [ ] Linear scaling of effects based on speeds instead of breakpoints
- [ ] Validation of inputs properly
- [ ] Scoring
- [ ] Exposing things like current speed via refs
- [ ] Explosions at max speed
