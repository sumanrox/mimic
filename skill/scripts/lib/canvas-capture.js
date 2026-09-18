// canvas-capture.js — paste as browser_evaluate. Inventories canvas/WebGL/3D surfaces and lists
// the public 3D assets the page fetched (glTF/GLB/HDR/KTX2/basis/textures/shaders) plus the 3D
// library build URLs, so you can reload them into a real Three.js scene (references/30-webgl-3d.md).
// Detects three via the network (module builds have no window.THREE). Bypasses nothing.
() => {
  const res = performance.getEntriesByType('resource').map(e => e.name);
  const assets = {
    models:  res.filter(u => /\.(glb|gltf)(\?|$)/i.test(u)),
    envmaps: res.filter(u => /\.(hdr|exr)(\?|$)/i.test(u)),
    ktx:     res.filter(u => /\.(ktx2?|basis)(\?|$)/i.test(u)),
    textures:res.filter(u => /\.(png|jpe?g|webp|avif)(\?|$)/i.test(u)).slice(0, 40),
    shaders: res.filter(u => /\.(glsl|vert|frag|wgsl)(\?|$)/i.test(u))
  };
  const libUrls = res.filter(u => /three(\.module)?(\.min)?\.js|three@|\/build\/three|examples\/jsm\/|babylon(\.|@)/i.test(u)).slice(0, 8);
  const canvases = [...document.querySelectorAll('canvas')].map(c => { const r = c.getBoundingClientRect();
    let type = '2d'; try { if (c.getContext('webgl2')||c.getContext('webgl')) type = 'webgl'; } catch {}
    return { type, w: Math.round(r.width), h: Math.round(r.height), dpr: devicePixelRatio }; });
  let three = null; try { if (window.THREE) three = { version: THREE.REVISION, source: 'global' }; } catch {}
  if (!three && libUrls.some(u => /three/i.test(u))) three = { version: 'module', source: 'network' };
  return { canvases, three, libUrls, assets, hint: assets.models.length
    ? 'Public glTF found — reload into three-scene.mjs for exact geometry/materials.'
    : 'No public 3D assets exposed — capture camera path via frames + approximate (document as APPROXIMATE).' };
}
