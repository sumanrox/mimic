# 70 · TDD for reconstruction (red → green, per section)

The reconstruction is driven by tests, not vibes. The seam under test is the **built page's public
observables** — computed styles, box metrics, motion curve, per-section pixel diff — never internals.
The source of truth is `reference.baseline.json`, captured FROM THE REFERENCE, so a pass proves the
build matches the reference, not itself (no tautology).

Loop (one **vertical slice per section**, e.g. hero, then cards, then footer):
1. **RED** — add that section's probes/screenshot to the baseline; run
   `node scripts/verify.mjs --url <build> --baseline reference.baseline.json`. It fails (section absent).
2. **GREEN** — implement just that section until its assertions pass (geometry ±tol, colors exact,
   font metrics, motion curve via `compareCurve`, pixel diff under threshold).
3. Move to the next section. Refactor (clean-up) only after green — not inside the loop (`90-clean-code.md`).

The comparison core (`scripts/lib/compare.mjs`) is unit-tested (`tests/compare.test.mjs`,
`node --test tests/compare.test.mjs`). Motion is validated by re-sampling the build (`20-motion.md`) and comparing curves.
Don't declare done until every section is green at every viewport.
