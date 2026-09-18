# 90 · Clean, human-auditable output

- **Tokens** for every repeated value (color, spacing, type, radius, motion duration/easing,
  breakpoints) in `:root`. No unexplained magic numbers — if a number is measured, name it.
- **Semantic class names** tied to the visual system, not the element (`.social-card`, not `.div12`).
- **Small, focused files**; componentize by reusable behavior/visual system, not per element.
- **Comment the why**, especially any value derived from measurement or any spring/easing choice.
- Minimal specificity, predictable stacking, explicit motion; avoid deep nesting, `!important`,
  duplicated rules, JS for layout CSS can own.
- **No needless dependencies** — add one only when the observed effect (e.g. real 3D) justifies it.
- Respect the target project's stack/conventions; don't rewrite a working architecture.
- Accessibility: semantic elements, keyboard + visible focus, alt/labels, `prefers-reduced-motion`.
