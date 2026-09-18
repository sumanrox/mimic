/* reveal.js — entry cascade on load + sequential scroll reveal. Dependency-free.
   Tune STEP to the stagger you measured (motion-sample.js). Respects reduced-motion. */
(function () {
  "use strict";
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var STEP = 95; // ms between siblings — the "pop" cadence
  var els = [].slice.call(document.querySelectorAll(".reveal"));
  if (reduce || !("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("in"); }); return; }

  var vh = innerHeight, load = [], rest = [];
  els.forEach(function (e) { (e.getBoundingClientRect().top < vh * 0.92 ? load : rest).push(e); });

  // on load: cascade above-the-fold in document order
  requestAnimationFrame(function () { requestAnimationFrame(function () {
    load.forEach(function (e, i) { e.style.transitionDelay = (i * STEP) + "ms"; e.classList.add("in"); clearDelay(e); });
  }); });

  // on scroll: stagger each item within its sibling group
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (x) { if (!x.isIntersecting) return; var e = x.target;
      var g = [].filter.call(e.parentElement.children, function (c) { return c.classList.contains("reveal") && !c.classList.contains("in"); });
      e.style.transitionDelay = (Math.max(0, g.indexOf(e)) * STEP) + "ms"; e.classList.add("in"); clearDelay(e); io.unobserve(e);
    });
  }, { rootMargin: "0px 0px -10% 0px", threshold: .15 });
  rest.forEach(function (e) { io.observe(e); });

  function clearDelay(e){ e.addEventListener("transitionend", function h(){ e.style.transitionDelay=""; e.removeEventListener("transitionend", h); }); }
})();
