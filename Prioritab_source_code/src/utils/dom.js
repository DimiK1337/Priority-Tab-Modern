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
  }
};