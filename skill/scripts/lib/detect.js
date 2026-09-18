// detect.js — paste as a browser_evaluate function. Step-0 feasibility fingerprint.
// Returns stack, access walls, canvas/WebGL surfaces, scroll libs, cross-origin iframes,
// fonts, and a per-surface capability ceiling (mirror | extract | approximate | blocked).
// NOTE: modern three.js loads as an ES module (no window.THREE) — detect it via the network,
// not just the global, or you'll misjudge an extractable 3D scene as "sealed".
() => {
  const vw = innerWidth, vh = innerHeight, area = vw * vh;
  const has = k => { try { return !!window[k]; } catch { return false; } };
  const res = performance.getEntriesByType('resource').map(e => e.name);

  // stack
  const gen = (document.querySelector('meta[name="generator"]')||{}).content || '';
  const html = document.documentElement;
  const stack = {
    framer: /framer/i.test(gen) || !!document.querySelector('[src*="framerusercontent"],[href*="framerusercontent"]') || has('__framer_events'),
    next: has('__NEXT_DATA__') || !!document.getElementById('__next'),
    webflow: html.classList.contains('w-mod-js') || !!document.querySelector('[data-wf-page],[data-wf-site]'),
    react: has('React') || !!document.querySelector('[data-reactroot],#root'),
    generator: gen
  };

  // access walls
  const t = (document.title + ' ' + document.body.innerText.slice(0, 400)).toLowerCase();
  const walls = {
    challenge: /captcha|cloudflare|are you (a )?human|verify you are|access denied|attention required/.test(t),
    login: !!document.querySelector('input[type="password"]'),
    paywall: /subscribe to (read|continue)|create a free account to/.test(t)
  };

  // canvas / webgl surfaces
  const canvases = [...document.querySelectorAll('canvas')].map(c => {
    const r = c.getBoundingClientRect(); let type = '2d';
    try { if (c.getContext('webgl2') || c.getContext('webgl') || c.getContext('experimental-webgl')) type = 'webgl'; } catch {}
    return { type, w: Math.round(r.width), h: Math.round(r.height), coverage: +((r.width*r.height)/area).toFixed(2) };
  });
  // detect 3D libs via NETWORK (module builds) + globals; detect extractable public assets
  const threeNet = res.some(u => /three(\.module)?(\.min)?\.js|three@|\/build\/three|examples\/jsm\//i.test(u));
  const babylon = has('BABYLON') || res.some(u => /babylon(\.|@)/i.test(u));
  const models = res.filter(u => /\.(glb|gltf)(\?|$)/i.test(u));
  const isThree = has('THREE') || threeNet;
  const webgl = {
    present: canvases.some(c => c.type === 'webgl'),
    hero: canvases.some(c => c.type === 'webgl' && c.coverage > 0.25),
    lib: isThree ? 'three' : babylon ? 'babylon' : (canvases.some(c => c.type === 'webgl') ? 'unknown-webgl' : null),
    publicModels: models.length
  };

  // scroll / animation libs
  const scrollLibs = { gsap: has('gsap')||has('ScrollTrigger')||res.some(u=>/gsap|scrolltrigger/i.test(u)),
    lenis: has('Lenis')||has('__lenis')||!!document.querySelector('[data-lenis],.lenis')||res.some(u=>/@studio-freight|lenis/i.test(u)),
    locomotive: !!document.querySelector('[data-scroll-container]'), framerMotion: stack.framer };

  // cross-origin iframes (uninspectable)
  const iframes = [...document.querySelectorAll('iframe')].map(f => { try { void f.contentDocument; return null; } catch { return f.src; } }).filter(Boolean);

  // fonts
  const fams = new Set(); document.fonts.forEach(f => fams.add(f.family));
  const fonts = { families: [...fams].slice(0, 12), licensedHost: !!document.querySelector('link[href*="typekit"],link[href*="use.fontawesome"]') };

  // ceiling
  const ceiling = {};
  ceiling.dom_css = 'mirror';
  ceiling.motion = (scrollLibs.gsap || scrollLibs.framerMotion || scrollLibs.lenis) ? 'mirror-via-sampling' : 'mirror';
  ceiling.threeD = !webgl.hero ? 'n/a'
    : webgl.publicModels ? 'extract (public glTF → 30-webgl-3d.md / three-scene.mjs)'
    : isThree ? 'approximate (three; scene assets sealed)'
    : 'approximate (sealed webgl)';
  ceiling.access = (walls.challenge||walls.login||walls.paywall) ? 'blocked-partial (respect boundary; mirror public only)' : 'open';
  ceiling.iframes = iframes.length ? 'stand-in-only' : 'n/a';

  return { url: location.href, viewport: { vw, vh }, stack, walls, canvases, webgl, scrollLibs, iframes, fonts, ceiling };
}
