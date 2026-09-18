# 00 · Feasibility pre-flight (do this FIRST — before any mirroring)

1. **Toolchain.** Run `scripts/preflight.sh`. If it exits non-zero, run `scripts/preflight.sh --fix`
   (installs playwright + chromium). System packages (imagemagick) it names but does not force —
   tell the user the exact command. Do not start capture until preflight is green (or `--lenient`
   was chosen knowingly, which disables standalone `verify.mjs`).
2. **Fingerprint the page.** Open the reference, wait for load, paste `lib/detect.js` into
   `browser_evaluate`. It returns stack, access walls, canvas/WebGL surfaces, scroll libs,
   cross-origin iframes, fonts, and a per-surface **capability ceiling**.
3. **State the ceiling to the user up front.** For each surface say mirror / mirror-via-sampling /
   approximate / blocked, e.g. "hero is sealed WebGL → approximate; everything else → mirror."
   Never discover a wall mid-build and surprise them.
4. **Route each surface** to its tier:
   - DOM/CSS/text/img/CSS-anim  → `10-capture.md` + `20-motion.md` (mirror)
   - rAF motion (Framer/GSAP/Lenis) → `20-motion.md` (sample the curve)
   - WebGL/Three/canvas hero    → `30-webgl-3d.md` (extract assets or approximate)
   - auth/captcha/paywall       → `60-access-walls.md` (respect; mirror public only)
   - cross-origin iframe/embed  → `40-assets-fonts.md` (stand-in)
5. **Set the baseline** for TDD: capture reference measurements now (`10-capture.md`) → they become
   the source of truth `verify.mjs` asserts against (`70-tdd.md`).
