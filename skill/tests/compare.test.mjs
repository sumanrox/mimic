import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compareMetric, compareColor, compareCurve, compareReport } from '../scripts/lib/compare.mjs';

// Seam: pure comparison of a reconstructed page's observables against the reference baseline.
// Source of truth = hand-authored fixtures with known-correct verdicts (never derived from the code).

test('compareMetric: within tolerance passes', () => {
  assert.equal(compareMetric(600, 602, 4).passed, true);   // 2px drift, tol 4 → pass
});
test('compareMetric: outside tolerance fails', () => {
  assert.equal(compareMetric(600, 610, 4).passed, false);  // 10px drift, tol 4 → fail
});
test('compareColor: identical passes, different fails', () => {
  assert.equal(compareColor('rgb(18,18,18)', 'rgb(18, 18, 18)').passed, true);  // whitespace-insensitive
  assert.equal(compareColor('#121212', 'rgb(18,18,18)').passed, true);          // hex vs rgb equal
  assert.equal(compareColor('#121212', '#131313').passed, false);
});
test('compareCurve: reveal params within tolerance pass; missing scale fails', () => {
  const ref = { opacityFrom: 0, translateFrom: 12, scaleFrom: 0.94, durationMs: 680, overshoot: true };
  const good = { opacityFrom: 0, translateFrom: 14, scaleFrom: 0.945, durationMs: 700, overshoot: true };
  const flat = { opacityFrom: 0, translateFrom: 0,  scaleFrom: 1,     durationMs: 300, overshoot: false };
  assert.equal(compareCurve(ref, good).passed, true);
  assert.equal(compareCurve(ref, flat).passed, false); // flat fade must fail against a scale+overshoot reveal
});
test('compareReport: all-pass true; any-fail false, and lists failures', () => {
  const ok  = compareReport([compareMetric(100,101,3), compareColor('#000','#000')]);
  const bad = compareReport([compareMetric(100,120,3), compareColor('#000','#fff')]);
  assert.equal(ok.passed, true);
  assert.equal(bad.passed, false);
  assert.equal(bad.failures.length, 2);
});
