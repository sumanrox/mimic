// scroll-scrub.js — paste as ASYNC browser_evaluate. For PINNED / SCROLL-SCRUBBED sections
// (GSAP ScrollTrigger, Framer scroll transforms): recovers the mapping from scroll progress to
// an element's transform/opacity, so you can reproduce a scrubbed timeline (not a one-shot reveal).
// Returns samples [{progress, y, transform, opacity}] across the section's scroll range.
async (selector, startY, endY) => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const el = document.querySelector(selector); if (!el) return { error: 'selector not found' };
  const samples = []; const steps = 16;
  for (let i = 0; i <= steps; i++) {
    const y = Math.round(startY + (endY - startY) * (i / steps));
    window.scrollTo(0, y); await sleep(90);
    const cs = getComputedStyle(el);
    samples.push({ progress: +(i / steps).toFixed(3), y, transform: cs.transform, opacity: cs.opacity });
  }
  return { selector, startY, endY, samples };
}
