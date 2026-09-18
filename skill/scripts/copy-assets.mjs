#!/usr/bin/env node
// copy-assets.mjs --url <ref> --out <dir> [--all] [--include js,css]
// Mirrors the assets a page actually fetches into <out>/assets/, preserving path structure, and
// writes <out>/assets/manifest.json with { url, local, type, bytes, license:"unknown" } per asset.
// Default set = media + 3D + fonts (images, svg, video, audio, glb/gltf, hdr/exr, ktx2/basis,
// woff/woff2/ttf/otf, lottie .json). Add --all (or --include ext,ext) for scripts/styles/etc.
// Rationale: mirroring copies everything by default — you cannot infer licensing, so copy + flag
// (license:"unknown"); keeping vs replacing an asset is a SEPARATE downstream decision.
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const args = Object.fromEntries(process.argv.slice(2).reduce((a,v,i,r)=>v.startsWith('--')?[...a,[v.slice(2), r[i+1]&&!r[i+1].startsWith('--')?r[i+1]:true]]:a,[]));
if (!args.url) { console.error('usage: copy-assets.mjs --url <ref> --out <dir> [--all] [--include js,css]'); process.exit(2); }
const out = args.out || './mirror';
let chromium; try { ({ chromium } = await import('playwright')); }
catch { console.error('playwright missing — run scripts/preflight.sh --fix'); process.exit(2); }

const MEDIA = ['png','jpg','jpeg','webp','avif','gif','svg','ico','mp4','webm','mov','ogg','mp3','wav',
  'glb','gltf','hdr','exr','ktx2','ktx','basis','bin','woff2','woff','ttf','otf','json','lottie'];
const extra = typeof args.include === 'string' ? args.include.split(',') : [];
const wanted = new Set([...MEDIA, ...extra]);
const extOf = u => (u.split('?')[0].split('#')[0].match(/\.([a-z0-9]+)$/i)||[,''])[1].toLowerCase();

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const urls = new Set();
page.on('response', r => { const u = r.url(); if (u.startsWith('http')) urls.add(u); });
await page.goto(args.url, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts && document.fonts.ready).catch(()=>{});
// nudge lazy assets: scroll the page once
await page.evaluate(async () => { for (let y=0; y<=document.body.scrollHeight; y+=800){ scrollTo(0,y); await new Promise(r=>setTimeout(r,120)); } scrollTo(0,0); });
await page.waitForTimeout(600);
await browser.close();

const list = [...urls].filter(u => args.all ? true : wanted.has(extOf(u)));
const manifest = [];
let ok = 0, fail = 0;
for (const u of list) {
  try {
    const res = await fetch(u); if (!res.ok) throw new Error('HTTP ' + res.status);
    const buf = Buffer.from(await res.arrayBuffer());
    const url = new URL(u);
    let rel = join(url.hostname, url.pathname); if (rel.endsWith('/') || !extOf(rel)) rel = join(rel, 'index.' + (extOf(u)||'bin'));
    const local = join(out, 'assets', rel);
    await mkdir(dirname(local), { recursive: true });
    await writeFile(local, buf);
    manifest.push({ url: u, local: join('assets', rel), type: extOf(u) || '?', bytes: buf.length, license: 'unknown' });
    ok++;
  } catch (e) { manifest.push({ url: u, error: String(e.message||e), license: 'unknown' }); fail++; }
}
await mkdir(join(out, 'assets'), { recursive: true });
await writeFile(join(out, 'assets', 'manifest.json'), JSON.stringify({
  source: args.url, generated: new Date().toISOString(),
  note: 'All assets copied for faithful mirroring. license:"unknown" unless verified. Keeping vs replacing each asset is a separate decision — see references/40-assets-fonts.md.',
  count: ok, failed: fail, assets: manifest }, null, 2));
console.log(`copied ${ok} assets (${fail} failed) → ${join(out,'assets')}/  · manifest.json written`);
process.exit(0);
