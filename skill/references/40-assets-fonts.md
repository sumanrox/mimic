# 40 · Assets, fonts, iframes

## Copy everything by default (mirroring)
A mirror copies the assets the page actually fetches — you usually cannot tell which are licensed and
which are free, and labels are rare. So **copy all of them locally by default**, then decide keep-vs-
replace separately. Run:

  node scripts/copy-assets.mjs --url <ref> --out <buildDir>

It downloads media + 3D + fonts (images, svg, video, audio, glb/gltf, hdr/exr, ktx2/basis, woff/woff2/
ttf/otf, lottie) into `<buildDir>/assets/`, preserving paths, and writes `assets/manifest.json` with
`{ url, local, type, bytes, license:"unknown" }` per asset (`--all` also grabs js/css). Wire the build
to the LOCAL copies. This includes 3D artifacts: a public `.glb/.gltf` is copied and reloaded via
`three-scene.mjs` — verified working.

## Keep vs replace (a SEPARATE, later decision)
Copying ≠ shipping. For each asset in the manifest decide: keep the original (user authorized / it's
open), or replace by geometry. When replacing, preserve aspect ratio, rendered size, crop, object-
position, focal weight, and any overlay/mask/blur. Do not present a well-known copyrighted character or
brand logo as your own work — replace those with original-style stand-ins of identical geometry. Flag
anything whose license you couldn't verify (`license:"unknown"` stays until confirmed).

## Fonts
Identify via `document.fonts`. Open families (Google Fonts) → use directly. Licensed (Typekit/Adobe/
custom) → the copier still pulls the woff2 for fidelity, but for redistribution substitute the closest
family and compensate metrics (size, weight, letter-spacing, line-height, container width) so wrapping
and block geometry match. Match rendered geometry, not the name. Flag the substitution.

## Cross-origin iframes/embeds
Contents are uninspectable (maps, video players, checkout widgets). Reproduce the frame's box + a
stand-in; document that the embed itself isn't mirrored.
