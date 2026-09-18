#!/usr/bin/env node
// Installs the `mimic` skill into a Claude skills directory.
//   npx mimic-skill            → installs to ~/.claude/skills/mimic
//   npx mimic-skill --dir X    → installs to X/mimic
//   npx github:sumanrox/mimic  → same, straight from the repo
import { cp, mkdir, rm, readdir, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { homedir } from 'node:os';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'skill');
const args = process.argv.slice(2);
const dirFlag = args.indexOf('--dir');
const base = dirFlag !== -1 ? resolve(args[dirFlag + 1]) : join(homedir(), '.claude', 'skills');
const dest = join(base, 'mimic');

try { await access(join(src, 'SKILL.md')); }
catch { console.error('✖ skill source not found (expected ./skill/SKILL.md). Reinstall the package.'); process.exit(1); }

console.log(`\n  mimic → installing to ${dest}`);
await mkdir(base, { recursive: true });
await rm(dest, { recursive: true, force: true });
await cp(src, dest, { recursive: true });
const files = (await readdir(dest, { recursive: true })).filter(Boolean).length;
console.log(`  ✓ installed ${files} files\n`);
console.log('  Next:');
console.log(`    cd ${dest} && bash scripts/preflight.sh --fix   # install Playwright + Chromium`);
console.log('    then, in Claude Code:  /mimic  (or just paste a URL and say "clone this")\n');
