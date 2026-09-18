#!/usr/bin/env node
// verify.mjs --url <builtPageUrl> --baseline <reference.baseline.json> [--out <dir>]
// Renders the built page at each baseline viewport, reads the SAME observables the
// baseline captured from the reference (computed styles + box metrics), compares them
// with the pure core (compare.mjs), and optionally pixel-diffs each viewport against the
// reference screenshot via ImageMagick `compare`. Exit 0 = all green, 1 = any drift.
//
// The baseline is captured FROM THE REFERENCE (independent source of truth) — never from
// this build — so a pass means the build matches the reference, not itself.
import { readFile, mkdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { compareMetric, compareColor, compareCurve, compareReport } from './lib/compare.mjs';

const args = Object.fromEntries(process.argv.slice(2).reduce((a, v, i, arr) =>
  v.startsWith('--') ? [...a, [v.slice(2), arr[i + 1]]] : a, []));
if (!args.url || !args.baseline) { console.error('usage: verify.mjs --url <url> --baseline <json> [--out dir]'); process.exit(2); }

let chromium;
try { ({ chromium } = await import('playwright')); }
catch { console.error('playwright not installed — run scripts/preflight.sh --fix'); process.exit(2); }

const base = JSON.parse(await readFile(args.baseline, 'utf8'));
const out = args.out || '/tmp/mimic-verify';
await mkdir(out, { recursive: true });

const browser = await chromium.launch();
const results = [];
let pixelNote = [];

for (const [vp, spec] of Object.entries(base.viewports)) {
  const page = await browser.newPage({ viewport: { width: spec.width, height: spec.height || 900 } });
  await page.goto(args.url, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts && document.fonts.ready).catch(() => {});
  await page.waitForTimeout(400);

  for (const probe of spec.probes || []) {
    const got = await page.evaluate((sel) => {
      const el = document.querySelector(sel); if (!el) return null;
      const cs = getComputedStyle(el); const r = el.getBoundingClientRect();
      return { w: Math.round(r.width), h: Math.round(r.height),
        color: cs.color, background: cs.backgroundColor, fontSize: cs.fontSize,
        fontWeight: cs.fontWeight, lineHeight: cs.lineHeight, borderRadius: cs.borderRadius };
    }, probe.selector);
    const tag = `${vp} ${probe.selector}`;
    if (!got) { results.push({ label: `${tag} present`, passed: false, ref: 'exists', got: 'missing' }); continue; }
    const m = probe.metrics || {};
    if (m.w != null) results.push(compareMetric(m.w, got.w, probe.tol ?? 3, `${tag} width`));
    if (m.h != null) results.push(compareMetric(m.h, got.h, probe.tol ?? 3, `${tag} height`));
    if (probe.color) results.push(compareColor(probe.color, got.color, `${tag} color`));
    if (probe.background) results.push(compareColor(probe.background, got.background, `${tag} bg`));
    if (probe.fontSize) results.push(compareMetric(parseFloat(probe.fontSize), parseFloat(got.fontSize), 1, `${tag} font-size`));
  }

  if (spec.screenshot) {
    const shot = `${out}/${vp}.png`;
    await page.screenshot({ path: shot, fullPage: !!spec.fullPage });
    const diff = spawnSync('compare', ['-metric', 'AE', '-fuzz', '4%', shot, spec.screenshot, `${out}/${vp}.diff.png`], { encoding: 'utf8' });
    const ae = parseInt((diff.stderr || '0').trim(), 10) || 0;
    const px = (spec.width * (spec.height || 900));
    const ratio = ae / px;
    const thr = spec.diffThreshold ?? 0.06;
    results.push({ label: `${vp} pixel-diff`, ref: `<=${thr}`, got: ratio.toFixed(4), passed: ratio <= thr });
    pixelNote.push(`${vp}: ${(ratio * 100).toFixed(2)}% differing px`);
  }
  await page.close();
}
await browser.close();

const report = compareReport(results);
for (const r of results) console.log(`${r.passed ? 'PASS' : 'FAIL'}  ${r.label}${r.passed ? '' : `  (ref=${r.ref} got=${r.got}${r.delta!=null?` Δ${r.delta}>${r.tol}`:''})`}`);
if (pixelNote.length) console.log('pixel:', pixelNote.join(' | '));
console.log(`\n${report.passed ? 'GREEN' : 'RED'} — ${results.length - report.failures.length}/${results.length} passed`);
process.exit(report.passed ? 0 : 1);
