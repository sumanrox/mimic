/* MIMIC · LinksPage — entry + scroll-reveal motion (Framer appear: rise + scale pop, spring, staggered) */
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var STAGGER = 95; // ms between siblings — the sequential "pop" cadence
  var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

  if (reduce || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("in"); });
    wireTop();
    return;
  }

  var vh = window.innerHeight || document.documentElement.clientHeight;

  // ENTRY: elements already in the first viewport cascade in document order on load.
  var onload = [], deferred = [];
  reveals.forEach(function (el) {
    (el.getBoundingClientRect().top < vh * 0.92 ? onload : deferred).push(el);
  });
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      onload.forEach(function (el, i) {
        el.style.transitionDelay = (i * STAGGER) + "ms";
        el.classList.add("in");
      });
    });
  });
  // clear the load delay afterwards so hover/other transitions aren't delayed
  onload.forEach(function (el) {
    el.addEventListener("transitionend", function clr() { el.style.transitionDelay = ""; el.removeEventListener("transitionend", clr); });
  });

  // SCROLL: reveal each item as it enters, staggered within its sibling group so rows/lists pop sequentially.
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      var group = Array.prototype.filter.call(el.parentElement.children, function (c) {
        return c.classList.contains("reveal") && !c.classList.contains("in");
      });
      var idx = Math.max(0, group.indexOf(el));
      el.style.transitionDelay = (idx * STAGGER) + "ms";
      el.classList.add("in");
      el.addEventListener("transitionend", function clr() { el.style.transitionDelay = ""; el.removeEventListener("transitionend", clr); });
      io.unobserve(el);
    });
  }, { rootMargin: "0px 0px -10% 0px", threshold: 0.15 });
  deferred.forEach(function (el) { io.observe(el); });

  wireTop();

  function wireTop() {
    var toTop = document.getElementById("toTop");
    if (toTop) toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    });
  }
})();
