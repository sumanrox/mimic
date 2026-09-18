# 10 · Capture (build the reference baseline = TDD source of truth)

Per viewport (desktop 1440, tablet 810, mobile 390, plus the ref's own breakpoints):
- Paste `lib/measure.js` (optionally pass an array of selectors). It returns doc dims, palette,
  fonts, and per-element geometry/type/color probes.
- Save probes into `reference.baseline.json` shaped for `verify.mjs`:
  `{ viewports: { desktop: { width, height, probes: [ {selector, metrics:{w,h}, color, background, fontSize, tol} ], screenshot?, diffThreshold? } } }`
- Also capture a reference screenshot per viewport (Playwright full-page) for the pixel-diff gate.

Rules:
- Measure computed values; never eyeball. Detect the spacing scale from repeated gaps.
- Premium pages run **several container widths at once** (e.g. 600 outer / 510 inner) — capture each,
  don't collapse to one max-width.
- Type: record family, size, weight, line-height, letter-spacing; watch for `text-transform`
  (raw text may be lowercase but rendered capitalized).
