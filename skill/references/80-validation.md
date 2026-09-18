# 80 · Validation loop & gates

OBSERVE → MEASURE → IMPLEMENT → RENDER → COMPARE → FIX → repeat. Never stop at the first render or the
first viewport — drift accumulates below the fold; inspect the whole document.

Gates (all must pass, verified — not by eye):
1 Structural · 2 Geometric · 3 Typographic · 4 Visual · 5 Responsive · 6 Interaction ·
7 Motion (captured-curve match: property set, duration, overshoot, stagger) · 8 Stability ·
9 Engineering (clean, `90-clean-code.md`) · 10 Visual diff (`verify.mjs` pixel gate green at every viewport).

Tools: `verify.mjs` for computed-style + pixel assertions; `motion-sample.js` re-run on the build for
motion. Document uncontrollable diffs (OS font rasterization, missing licensed media, live data) as
OBSERVED / INFERRED / APPROXIMATE / UNVERIFIABLE — don't claim pixel identity where it isn't real.
