<div align="center">

<img src="./assets/banner.svg" alt="MIMIC — reverse-engineer any website" width="100%" />

# MIMIC

**Reverse-engineer & mirror any website — layout, typography, motion, and WebGL/3D — to pixel fidelity.**
A [Claude Code](https://claude.com/claude-code) skill that treats a reference site as a *specification* and rebuilds it with independent, clean, test-verified code.

[![Claude Code skill](https://img.shields.io/badge/Claude_Code-skill-6c47ff)](https://claude.com/claude-code)
[![Playwright](https://img.shields.io/badge/recon-Playwright-2ead33)](https://playwright.dev)
[![TDD verified](https://img.shields.io/badge/build-TDD_verified-brightgreen)](#-tdd-the-build-is-tested-not-vibed)
[![node >=18](https://img.shields.io/badge/node-%3E%3D18-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-ff69b4.svg)](https://github.com/sumanrox/mimic/pulls)

</div>

---

## ✨ What it does

Point it at a URL and it doesn't just *look* similar — it **recovers the rules that produced the pixels**:
structure, layout mechanism, type scale, spacing system, color, components, responsive composition,
interaction states, and **motion** (scroll reveals, springs, staggers, pinned/scrubbed timelines, and
WebGL/3D). Then it reimplements them independently and **proves the match with an automated verifier**.

> Built with the browser as the source of truth. It **observes and measures** — it does not guess.

<div align="center">
<img src="./assets/demo-desktop.png" alt="A pixel-level mirror produced by mimic (demo reconstruction)" width="720" />
<br/><sub>A full mirror produced by the skill (demo reconstruction — placeholder assets).</sub>
</div>

## 🚀 Install

### Option A — one command (recommended)
```bash
# straight from the repo, no publish needed:
npx github:sumanrox/mimic

# …or, once published to npm:
npx mimic-skill
```
This installs the skill into `~/.claude/skills/mimic`. Then install the browser toolchain once:
```bash
cd ~/.claude/skills/mimic && bash scripts/preflight.sh --fix
```

### Option B — from the `.skill` bundle
Download [`mimic.skill`](./mimic.skill) and drop it into Claude Code (skills import), or unzip it into `~/.claude/skills/`.

### Option C — manual
```bash
git clone https://github.com/sumanrox/mimic.git
cp -r mimic/skill ~/.claude/skills/mimic
cd ~/.claude/skills/mimic && bash scripts/preflight.sh --fix
```

## 🧑‍💻 Usage

In Claude Code, just describe the job (the skill auto-triggers):
```
/mimic https://some-site.com          # full mirror
clone the hero + navbar from <url>    # section / component
extract the design system from <url>  # tokens only
recreate the scroll animation on <url># motion pattern
```
Modes: **A** full mirror · **B** section · **C** component (+states) · **D** design-system extraction ·
**E** pattern extraction · **F** redesign from DNA. It picks the narrowest fitting mode and tells you.

## 🔎 How it works — the pipeline

| # | Step | What happens |
|---|------|--------------|
| 0 | **Pre-flight** | `preflight.sh` checks Node, Playwright, Chromium, ImageMagick; `--fix` auto-installs. Won't start until green. |
| 1 | **Feasibility** | `detect.js` fingerprints the stack, anti-bot/auth, WebGL/3D, scroll libs, iframes, fonts → a **capability ceiling** reported up front. |
| 2 | **Capture** | `measure.js` records geometry/type/color per viewport → `reference.baseline.json` (the test's source of truth). |
| 2.5 | **Copy assets** | `copy-assets.mjs` mirrors **every** fetched asset (incl. `.glb/.gltf`) locally with a provenance manifest. |
| 3 | **Route** | each surface → mirror / motion-sampling / 3D-extract / respect-and-document. |
| 4 | **Build (TDD)** | one section per red→green slice against the baseline; start from the clean scaffold. |
| 5 | **Validate** | `verify.mjs` asserts computed styles + box metrics + pixel diff at **every** viewport; motion curves re-sampled. |
| 6 | **Report** | what was replicated / substituted / approximated, labelled OBSERVED / INFERRED / APPROXIMATE. |

## 🎞️ Motion, done properly

Most tools flatten a designed animation into a generic fade. Mimic **captures the real curve**:

- `getAnimations()` for declared CSS/WAAPI animations;
- a **MutationObserver sampler** when motion is rAF-driven (Framer Motion / GSAP) — recovers start
  transform (translate + scale), duration, **spring overshoot**, and per-item **stagger**;
- `scroll-scrub.js` for **pinned / scroll-scrubbed** timelines;
- reproduces both the **on-load entry cascade** and the **sequential scroll reveal**.

## 🧊 WebGL / 3D

Detects Three.js/Babylon (even module builds with no global), inventories the page's public 3D assets
(`.glb/.gltf/.hdr/.ktx2`, shaders), and **reloads them into a real Three.js scene** (`three-scene.mjs`)
for exact geometry/materials — with an honest *approximate* tier when a scene is sealed.

## ✅ TDD — the build is tested, not vibed

The reconstruction is driven red→green. The baseline is captured **from the reference** (independent
source of truth → no tautology); the seam under test is the built page's **public observables**.
The pure comparison core ships with unit tests:
```bash
npm test        # node --test skill/tests/compare.test.mjs  → 5/5
```
`verify.mjs` then asserts a built page against the baseline (green on match, **red on drift**).

## ⚠️ Honest limits

- **Sealed WebGL** (offscreen/obfuscated, no public assets) → high-fidelity *approximation*, not 1:1.
- **Auth / CAPTCHA / paywalls** → respected, never bypassed; public surface mirrored, gap documented.
- **Assets are copied for faithful mirroring** and flagged `license:"unknown"`; **keeping vs replacing**
  each asset is a separate decision. Well-known copyrighted characters / brand logos are replaced with
  original-style stand-ins of identical geometry — not redrawn.
- OS font rasterization, licensed fonts, and live data are uncontrollable diffs (labelled, not faked).

## 🗂️ Repo layout

```
skill/            the installable skill (SKILL.md, scripts/, references/, assets/scaffold, tests/)
mimic.skill       packaged bundle
bin/install.mjs   npx installer
demo/             a full mirror produced by the skill (linkspage reconstruction)
mimic.md          the underlying master prompt
assets/           banner + demo image
```

## 📜 License

[MIT](./LICENSE) © Suman Roy

<div align="center"><sub>Built with Claude Code. Recover the system, not just the pixels.</sub></div>
