// motion-probe.js — paste as browser_evaluate. Step 1 of motion capture: declared animations
// (CSS animation/transition + Web Animations API). If this returns [], the motion is rAF-driven
// (Framer Motion / GSAP) — use motion-sample.js. Never conclude "no animation" from [].
() => document.getAnimations().slice(0, 60).map(a => ({
  el: a.effect && a.effect.target && (a.effect.target.tagName + '.' + (a.effect.target.className||'').toString().slice(0,24)),
  state: a.playState, timing: a.effect && a.effect.getTiming(),
  keyframes: a.effect && a.effect.getKeyframes().map(k => ({ offset: k.computedOffset, opacity: k.opacity, transform: k.transform, easing: k.easing }))
}))
