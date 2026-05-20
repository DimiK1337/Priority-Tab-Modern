//Prioritab_source_code/src/utils/dom.js

window.PrioritabDom = {
  qs(selector, root = document) {
    return root.querySelector(selector);
  },

  qsa(selector, root = document) {
    return [...root.querySelectorAll(selector)];
  },

  on(element, eventName, selectorOrHandler, maybeHandler) {
    if (!element) return;

    if (typeof selectorOrHandler === "function") {
      element.addEventListener(eventName, selectorOrHandler);
      return;
    }

    const selector = selectorOrHandler;
    const handler = maybeHandler;

    element.addEventListener(eventName, (event) => {
      const target = event.target.closest(selector);

      if (!target || !element.contains(target)) {
        return;
      }

      handler(event, target);
    });
  },

  hide(element) {
    if (!element) return;
    element.style.display = "none";
  },

  show(element, display = "block") {
    if (!element) return;
    element.style.display = display;
  },

  isVisible(element) {
    return !element ? false : getComputedStyle(element).display !== "none";
  },

  fadeIn(element, duration = 200, display = "block", onComplete = null) {
    if (!element) return;

    element.style.opacity = "0";
    element.style.display = display;

    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);

      element.style.opacity = String(progress);

      if (progress < 1) {
        requestAnimationFrame(tick);
        return;
      }

      element.style.opacity = "";

      if (typeof onComplete === "function") {
        onComplete();
      }
    }

    requestAnimationFrame(tick);
  },

  fadeOut(element, duration = 200, onComplete = null) {
    if (!element) return;

    element.style.opacity = "1";

    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);

      element.style.opacity = String(1 - progress);

      if (progress < 1) {
        requestAnimationFrame(tick);
        return;
      }

      element.style.opacity = "";
      element.style.display = "none";

      if (typeof onComplete === "function") {
        onComplete();
      }
    }

    requestAnimationFrame(tick);
  }
};