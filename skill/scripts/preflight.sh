#!/usr/bin/env bash
# preflight.sh — verify the toolchain mimic needs BEFORE mirroring a site.
# Usage: preflight.sh [--fix] [--json] [--lenient]
#   --fix      auto-install user-space deps (playwright npm + chromium browser).
#              System packages (imagemagick) are reported with the exact command, not force-installed.
#   --json     machine-readable output.
#   --lenient  exit 0 even if RECOMMENDED tools are missing (REQUIRED still gate).
# Exit 0 = ready, 1 = something REQUIRED (or RECOMMENDED, unless --lenient) still missing.
set -uo pipefail
FIX=0; JSON=0; LENIENT=0
for a in "$@"; do case "$a" in --fix) FIX=1;; --json) JSON=1;; --lenient) LENIENT=1;; esac; done
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

have(){ command -v "$1" >/dev/null 2>&1; }
node_has(){ node -e "require.resolve('$1')" >/dev/null 2>&1; }
chromium_ok(){ node -e "const{chromium}=require('playwright');const p=chromium.executablePath();process.exit(p&&require('fs').existsSync(p)?0:1)" >/dev/null 2>&1; }

rows=(); hard_missing=0; soft_missing=0
# record NAME TIER STATUS HINT  (status: "ok …" | "installed" | "missing")
rec(){ rows+=("$1|$2|$3|$4"); case "$3" in missing) [ "$2" = required ] && hard_missing=1; [ "$2" = recommended ] && soft_missing=1;; esac; }

# REQUIRED
have node && rec node required "ok $(node -v)" "" || rec node required missing "install Node >=18"
have npm  && rec npm  required "ok $(npm -v)"  "" || rec npm  required missing "ships with Node"
have npx  && rec npx  required ok ""             || rec npx  required missing "ships with npm"

# RECOMMENDED — playwright (for standalone verify.mjs)
if ! node_has playwright && [ "$FIX" = 1 ]; then echo "[fix] npm i playwright…"; (cd "$HERE" && npm i playwright >/dev/null 2>&1); fi
node_has playwright && rec playwright recommended ok "" || rec playwright recommended missing "npm i playwright  (or preflight --fix)"
# RECOMMENDED — chromium browser
if node_has playwright && ! chromium_ok && [ "$FIX" = 1 ]; then echo "[fix] npx playwright install chromium…"; (cd "$HERE" && npx playwright install chromium >/dev/null 2>&1); fi
if node_has playwright && chromium_ok; then rec chromium recommended ok ""; else rec chromium recommended missing "npx playwright install chromium  (or preflight --fix)"; fi
# RECOMMENDED — perceptual diff
have compare && rec imagemagick recommended ok "" || rec imagemagick recommended missing "apt install imagemagick / brew install imagemagick"

# OPTIONAL
have jq      && rec jq optional ok ""      || rec jq optional missing "apt install jq"
have python3 && rec python3 optional ok "" || rec python3 optional missing "(node serve.mjs is the fallback server)"

ready=$([ $hard_missing = 0 ] && { [ $soft_missing = 0 ] || [ $LENIENT = 1 ]; } && echo true || echo false)

if [ "$JSON" = 1 ]; then
  printf '{"ready":%s,"tools":[' "$ready"
  for i in "${!rows[@]}"; do IFS='|' read -r n t s h <<< "${rows[$i]}"; printf '%s{"name":"%s","tier":"%s","status":"%s","hint":"%s"}' "$([ $i = 0 ] || echo ,)" "$n" "$t" "$s" "$h"; done
  echo ']}'
else
  echo "── mimic preflight ─────────────────────────────"
  for r in "${rows[@]}"; do IFS='|' read -r n t s h <<< "$r"
    [ "${s:0:2}" = ok ] || [ "$s" = installed ] && printf "✅  %-12s %-11s %s\n" "$n" "$t" "$s" \
                                                 || printf "❌  %-12s %-11s MISSING — %s\n" "$n" "$t" "$h"
  done
  echo "────────────────────────────────────────────────"
fi

if [ $hard_missing = 1 ]; then [ "$JSON" = 1 ] || echo "REQUIRED tools missing — cannot proceed."; exit 1; fi
if [ $soft_missing = 1 ] && [ $LENIENT = 0 ]; then
  [ "$JSON" = 1 ] || { echo "Recommended tools missing. Run:  scripts/preflight.sh --fix   (installs playwright+chromium);";
    echo "install imagemagick via your package manager, or pass --lenient to skip standalone verify."; }
  exit 1
fi
[ "$JSON" = 1 ] || echo "Ready to mirror."; exit 0
