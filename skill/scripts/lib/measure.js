// measure.js — paste as a browser_evaluate function. Captures the reference baseline for the
// CURRENT viewport: doc dims, palette, fonts, and per-element geometry/type/color probes.
// Feed the `probes` (with selectors you choose) into reference.baseline.json for verify.mjs.
(selectors) => {
  const R = el => { const r = el.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y+scrollY), w: Math.round(r.width), h: Math.round(r.height) }; };
  const out = { viewport: { w: innerWidth, h: innerHeight }, doc: { w: document.documentElement.scrollWidth, h: document.documentElement.scrollHeight } };
  const fams = new Set(); document.fonts.forEach(f => f.status==='loaded' && fams.add(`${f.family} ${f.weight} ${f.style}`));
  out.fonts = [...fams];
  const cols = new Set(), bgs = new Set(), radii = new Set();
  document.querySelectorAll('*').forEach(el => { const cs = getComputedStyle(el);
    if (cs.color) cols.add(cs.color);
    if (cs.backgroundColor && cs.backgroundColor !== 'rgba(0, 0, 0, 0)') bgs.add(cs.backgroundColor);
    if (cs.borderRadius && cs.borderRadius !== '0px') radii.add(cs.borderRadius); });
  out.palette = { colors: [...cols].slice(0,20), backgrounds: [...bgs].slice(0,20), radii: [...radii].slice(0,12) };
  const list = selectors && selectors.length ? selectors : ['body','h1','h2','h3','header','footer','main'];
  out.probes = list.map(sel => { const el = document.querySelector(sel); if (!el) return { selector: sel, missing: true };
    const cs = getComputedStyle(el);
    return { selector: sel, ...R(el), metrics: { w: R(el).w, h: R(el).h },
      color: cs.color, background: cs.backgroundColor, fontFamily: cs.fontFamily.split(',')[0],
      fontSize: cs.fontSize, fontWeight: cs.fontWeight, lineHeight: cs.lineHeight, letterSpacing: cs.letterSpacing,
      borderRadius: cs.borderRadius, display: cs.display, position: cs.position }; });
  return out;
}
