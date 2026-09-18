---
name: mimic
description: >-
  Reverse-engineer and reconstruct a reference website's design and behavior to
  mirror-level fidelity. Use this whenever the user wants to clone, copy, mirror,
  replicate, recreate, rebuild, or "make mine look like" another site, page,
  section, component, hero, navbar, footer, or landing page — or wants to extract
  a site's design system, isolate one interaction/animation/scroll pattern, or
  reverse-engineer its layout, typography, spacing, color, responsive behavior, or
  motion (including scroll, reveal, spring, and WebGL/3D motion). Trigger even when
  the user just pastes a URL and says "copy this", "rebuild this", "recreate this
  animation", "steal this design", "match this layout", or "reverse engineer this"
  without naming a mode. Treat the reference as a specification and recover the
  rules behind the pixels, not just the pixels. Do not trigger for building an
  original design from scratch with no reference, for pure visual QA of an existing
  build, or for backend/API work.
---

# MIMIC — Website Reverse-Engineering, Replication & Motion Reconstruction

You reverse engineer the *observable* design system of a reference site — structure, layout,
typography, spacing, color, components, responsive behavior, interaction, motion, and (where present)
3D — and independently reimplement it to mirror-level fidelity. Treat the reference as a specification.
Recover the rules that produced the pixels, not the pixels. The live browser is the source of truth:
**observe and measure before implementing; never guess a value the browser can give you.**

This skill is **test-driven**: you capture the reference into a baseline, then build until an automated
verifier proves the build matches that baseline. Ship clean, human-auditable code.

## Bundled files (use them — don't reinvent)
```
scripts/preflight.sh        tool prereq check + auto-install (run FIRST)
scripts/serve.mjs           static server on first free port
scripts/copy-assets.mjs     mirror ALL fetched assets locally (+ manifest, license flags)
scripts/verify.mjs          TDD runner: assert build vs reference baseline (computed styles + pixel diff)
scripts/lib/compare.mjs     pure comparison core (unit-tested)
scripts/lib/detect.js       browser_evaluate payload: stack/walls/webgl/scroll-libs/ceiling
scripts/lib/measure.js      browser_evaluate payload: geometry/type/color/asset baseline
scripts/lib/motion-probe.js browser_evaluate payload: declared animations (CSS/WAAPI)
scripts/lib/motion-sample.js browser_evaluate payload: recover rAF-driven reveal curve
scripts/lib/scroll-scrub.js browser_evaluate payload: scroll→transform mapping (pin/scrub)
scripts/lib/canvas-capture.js browser_evaluate payload: canvas/WebGL + public 3D asset inventory
assets/scaffold/            clean starter: index.html, styles.css, reveal.js, three-scene.mjs
tests/                      unit tests (node --test) + baseline fixture
references/00..90           one focused guide per problem domain (read the relevant one before that step)
```
Browser payloads (`lib/*.js`) are pasted into `browser_evaluate` (Playwright MCP:
`mcp__plugin_playwright_playwright__browser_*`). Node scripts run via Bash.

## The pipeline (follow in order)
**0 · Pre-flight — do this before anything else.** `bash scripts/preflight.sh`; if red, `--fix`
(installs playwright+chromium; names system pkgs like imagemagick for the user). If a required tool
can't be installed, tell the user exactly what's missing and stop. → `references/00-feasibility.md`

**1 · Feasibility + capability ceiling.** Open the reference, wait for load, paste `lib/detect.js`.
Report per-surface ceiling to the user up front (mirror / mirror-via-sampling / approximate / blocked).
Route each surface to its tier. → `references/00-feasibility.md`

**2 · Capture the baseline (TDD source of truth).** Per viewport (desktop/tablet/mobile + the ref's
own breakpoints) paste `lib/measure.js`; save probes + a reference screenshot into
`reference.baseline.json`. Capture motion curves (step 4). → `references/10-capture.md`

**2.5 · Copy the assets (mirroring copies everything).** `node scripts/copy-assets.mjs --url <ref>
--out <build>` pulls all fetched media/3D/fonts (incl. `.glb/.gltf`) into `<build>/assets/` with a
provenance `manifest.json` (`license:"unknown"` until verified). Wire the build to the local copies.
Keep-vs-replace each asset is a SEPARATE later decision. → `references/40-assets-fonts.md`

**3 · Route each surface:**
- DOM/CSS/text/img/CSS-anim → mirror (`10-capture.md`, `20-motion.md`)
- rAF motion (Framer/GSAP/Lenis) → capture the curve (`20-motion.md`)
- pinned/scroll-scrubbed → `scroll-scrub.js` (`20-motion.md`)
- WebGL/Three/canvas hero → extract assets or approximate (`30-webgl-3d.md`)
- media/fonts/iframes → geometry replacement / substitution / stand-in (`40-assets-fonts.md`)
- auth/captcha/paywall → respect boundary, mirror public only (`60-access-walls.md`)

**4 · Build test-driven, one section per vertical slice.** RED: add the section's probes to the
baseline, run `verify.mjs` (fails). GREEN: implement that section until its assertions pass. Capture &
match its motion curve. Repeat per section. → `references/70-tdd.md`, `references/20-motion.md`.
Start from `assets/scaffold/` (tokens + the validated reveal in `reveal.js`).

**5 · Validate the whole document, every viewport.** `node scripts/verify.mjs --url <build>
--baseline reference.baseline.json` must be GREEN (geometry, color, font metrics, pixel diff). Re-sample
motion on the build and compare curves. Don't stop at the hero. → `references/80-validation.md`

**6 · Report** what was replicated / substituted / reconstructed / approximated, per OBSERVED /
INFERRED / APPROXIMATE / UNVERIFIABLE. Never claim pixel identity or "motion matched" without the diff.

## Modes (detect from the request; default = FULL MIRROR)
- **A Full mirror** (default): the whole accessible page, no redesign/improve/add/remove.
- **B Section** · **C Component** (+ all states) · **D Design-system extraction** ·
  **E Pattern extraction** (isolate one mechanism) · **F Redesign from DNA** (preserve only requested
  traits; separate observed/preserved/modified/new).
Ambiguous "copy this <thing>" → narrowest mode covering it; state the assumption.

## Legal & asset boundary
Reconstruct visual/layout/spacing/motion/component behavior. Do NOT: copy proprietary source verbatim;
copy secrets/credentials/tokens/private data; bypass auth/CAPTCHA/paywall/bot protection; exfiltrate
private resources; reproduce real people's photos, brand logos, or licensed media/fonts (replace by
geometry). Inspect source only to understand the model, then reimplement independently. Blocked
resource → mirror the accessible design and document the gap. → `references/60-access-walls.md`

## Non-negotiables
- **Pre-flight before mirroring.** No capture until the toolchain is green (or `--lenient` chosen knowingly).
- **State the capability ceiling up front**, not after hitting a wall.
- **Never guess motion** — capture the curve; empty `getAnimations()` means rAF (use `motion-sample.js`),
  not "no animation." Never ship a flat fade for a scale/translate/overshoot/stagger reveal.
- **TDD:** baseline from the reference (not your build); red→green per section; verify at every viewport.
- **Clean, human-auditable code:** tokens, semantic names, small files, comment the why, no magic
  numbers, no needless deps. → `references/90-clean-code.md`
- **Full mirror ⇒ maximum fidelity**, static and dynamic; no simplification unless technically impossible;
  document every APPROXIMATE with the reason.

## Operating principle
Every reference is a design system hiding inside a rendered surface. Recover the rules, the hierarchy,
the states, the timelines, the responsive compositions, and the 3D where present — then reproduce them
through clean, independent, test-verified implementation. The bar is not "similar": structurally,
visually, responsively, behaviorally, motion, and 3D faithful; engineering-sound; repeatably validated.
Do not guess when you can inspect. Do not approximate when you can measure. Do not stop when it merely
looks close.
