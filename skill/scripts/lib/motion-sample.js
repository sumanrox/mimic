// motion-sample.js — paste as an ASYNC browser_evaluate function. Step 2: recover a rAF-driven
// reveal curve. Set START_Y just ABOVE the target (so it mounts but stays hidden) and END_Y past it.
// Read from the log: start transform (translateY+scale), opacity 0→1, duration (first change→settle),
// whether scale passes 1 then settles back (=spring overshoot), and Δt between siblings (=stagger).
async () => {
  const START_Y = 1400, END_Y = 3100;                     // <-- set to your target section
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  window.scrollTo(0, START_Y); await sleep(400);
  const log = [], t0 = performance.now();
  const mo = new MutationObserver(muts => { const t = Math.round(performance.now() - t0);
    for (const m of muts) { const el = m.target; if (!el || el.nodeType !== 1) continue;
      const s = el.getAttribute('style') || ''; if (!/opacity|transform/.test(s)) continue;
      log.push([t, (el.textContent||'').trim().slice(0,18),
        (s.match(/opacity:\s*([\d.]+)/)||[])[1], (s.match(/transform:\s*([^;]+)/)||[])[1]]); } });
  mo.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['style'] });
  for (let y = START_Y; y <= END_Y; y += 100) { window.scrollTo(0, y); await sleep(70); }
  await sleep(500); mo.disconnect();
  return log.slice(0, 160);
}
