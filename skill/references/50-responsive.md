# 50 · Responsive (a separate behavior model, not a shrink)

Inspect desktop / tablet / mobile independently (plus the ref's own breakpoints). Capture a baseline
per viewport. Reproduce **composition changes**, not a scaled-down desktop: nav, grid column counts,
type scale, spacing, section heights, image crop, ordering, visibility, sticky/overflow, mobile-only
controls, desktop-only decoration. Note which multi-column rows collapse and at what width. For
touch-specific interactions, emulate touch. Watch `svh/dvh` (mobile URL-bar resize) and container
queries. `verify.mjs` runs every baseline viewport — a pass means all of them match.
