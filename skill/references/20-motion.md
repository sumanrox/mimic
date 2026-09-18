# 20 · Motion (never guess — capture the curve)

**Order:** `lib/motion-probe.js` (declared CSS/WAAPI animations) → if it returns `[]`, the motion is
rAF-driven, use `lib/motion-sample.js` (MutationObserver curve) → for pinned/scrubbed sections use
`lib/scroll-scrub.js` → last resort, frame-by-frame screenshots for timing.

From the sample, extract per element: start transform (translateY + scale), opacity range, duration
(first change → settle), **overshoot** (scale passes 1 then settles = spring, "pop from behind"),
and **stagger** (Δt between siblings = the sequential cadence).

**Two triggers, reproduce both:** (a) on **load**, above-the-fold cascades top-to-bottom; (b) on
**scroll**, each item reveals on entry. `assets/scaffold/reveal.js` implements both; set `STEP` to the
measured stagger and the CSS `--spring` to match/flatten the overshoot.

**Scrub/pin:** `scroll-scrub.js` returns transform vs scroll progress. Reproduce with a scroll-linked
handler (or CSS scroll-driven animations) mapping the same progress→transform, not a one-shot reveal.

**Never** ship a flat `opacity` fade for a reveal that scales/translates/overshoots/staggers, and
never conclude "no animation" from an empty `getAnimations()` (that means rAF). Validate motion by
re-sampling YOUR build and comparing curves (`70-tdd.md`, `compareCurve`).
