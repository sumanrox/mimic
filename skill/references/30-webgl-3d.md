# 30 · WebGL / Three.js / canvas (the hard tier — extract, then approximate)

WebGL pixels are not in the DOM; computed styles/geometry are blind. Work the ladder, stop at the
first rung that yields fidelity, and label the result OBSERVED / EXTRACTED / APPROXIMATE.

1. **Extract public assets (best 1:1).** `lib/canvas-capture.js` lists fetched `.glb/.gltf/.hdr/.ktx2`
   /textures/shaders. If a glTF is public, reload it into `assets/scaffold/three-scene.mjs` — exact
   geometry/materials/env, your own code. Match canvas CSS size + `devicePixelRatio` + the camera.
2. **Recover the camera/animation path.** Sample the canvas over scroll/time (`scroll-scrub.js` on the
   canvas + screenshots) to reproduce camera moves / scroll-driven 3D.
3. **Shader source.** If `.glsl/.vert/.frag` are served, reuse the effect; else approximate with a
   matching material.
4. **Sealed scene (offscreen/obfuscated, no assets).** You cannot recover geometry. Reproduce a
   high-fidelity visual approximation with a matching lib and **say so** — do not claim mirror.

Only add `three` when the reference is genuinely 3D. Keep 2D-canvas effects: hook
`CanvasRenderingContext2D` calls to learn the draw ops, then reimplement.
