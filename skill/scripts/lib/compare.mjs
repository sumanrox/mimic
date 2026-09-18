// compare.mjs — pure comparison of a reconstructed page's observables against the
// reference baseline. No I/O, no browser: given values in, verdicts out. This is the
// seam the reconstruction is tested at (see references/70-tdd.md).

/** Normalise a CSS color (hex or rg[b]a()) to an "r,g,b" string for exact comparison. */
export function normColor(c) {
  if (c == null) return '';
  const s = String(c).trim().toLowerCase();
  const hex = s.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/);
  if (hex) {
    let h = hex[1];
    if (h.length === 3) h = h.split('').map(x => x + x).join('');
    return `${parseInt(h.slice(0,2),16)},${parseInt(h.slice(2,4),16)},${parseInt(h.slice(4,6),16)}`;
  }
  const m = s.match(/rgba?\(([^)]+)\)/);
  if (m) { const p = m[1].split(',').map(x => parseFloat(x.trim())); return `${p[0]|0},${p[1]|0},${p[2]|0}`; }
  return s; // named colors etc. — compared verbatim
}

/** A numeric metric (px, ms) matches when |ref - got| <= tol. */
export function compareMetric(ref, got, tol = 2, label = 'metric') {
  const delta = Math.abs(ref - got);
  return { label, ref, got, delta, tol, passed: delta <= tol };
}

/** Colors match when their canonical rgb triples are identical. */
export function compareColor(ref, got, label = 'color') {
  const a = normColor(ref), b = normColor(got);
  return { label, ref, got, passed: a === b && a !== '' };
}

/**
 * A reveal/scroll motion curve matches when its shape matches, not just its endpoints:
 * opacity/translate/scale start values within tolerance, duration within tolerance,
 * and the overshoot (spring) flag equal. A flat fade can never satisfy a scale+overshoot ref.
 */
export function compareCurve(ref, got, tol = { translate: 8, scale: 0.06, durationMs: 250 }, label = 'motion-curve') {
  const checks = [
    Math.abs((ref.opacityFrom ?? 0) - (got.opacityFrom ?? 0)) <= 0.15,
    Math.abs((ref.translateFrom ?? 0) - (got.translateFrom ?? 0)) <= tol.translate,
    Math.abs((ref.scaleFrom ?? 1) - (got.scaleFrom ?? 1)) <= tol.scale,
    Math.abs((ref.durationMs ?? 0) - (got.durationMs ?? 0)) <= tol.durationMs,
    Boolean(ref.overshoot) === Boolean(got.overshoot),
  ];
  return { label, ref, got, passed: checks.every(Boolean) };
}

/** Aggregate individual results into one verdict, keeping the list of failures. */
export function compareReport(results) {
  const failures = results.filter(r => !r.passed);
  return { passed: failures.length === 0, total: results.length, failures };
}
