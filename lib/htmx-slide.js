"use strict";

(function() {
  const EXTENSION_SELECTOR = "[hx-ext*='slide']";
  let direction;

  const toggleFullScreen = (selector) => {
    const viewport = document.querySelector(selector);

    if (!viewport) return;

    if (!document.fullscreenElement && viewport.requestFullscreen) {
      viewport.requestFullscreen();
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  };

  htmx.defineExtension("slide", {
    init: () => {
      const addTrigger = (event) => {
        const extension = htmx.find(EXTENSION_SELECTOR);

        if (!extension) return;

        const settings = extension.dataset;
        const fullscreenSelector = settings.fullscreenTrigger || "[data-fullscreen-trigger]";
        const fullscreenTrigger = htmx.find(fullscreenSelector);

        if (!fullscreenTrigger) return;

        const targetSelector = fullscreenTrigger.dataset.fullscreenTarget || ".viewport";

        if (event.type === "keydown") {
          const fullscreenKey = settings.fullscreenKey || "f";

          if (event.key === fullscreenKey) {
            toggleFullScreen(targetSelector);
          }
        }
        else if (event.type === "click") {
          const target = event.target;

          if (target.matches(fullscreenSelector) || target.closest(fullscreenSelector)) {
            toggleFullScreen(targetSelector);
          }
        }
      };

      const body = document.body;

      body.addEventListener("click", addTrigger);
      body.addEventListener("keydown", addTrigger);
    },

    onEvent: (name, event) => {
      if (name !== "htmx:beforeTransition" && name !== "htmx:oobBeforeSwap") return;

      const element = event.detail.elt;
      const extension = htmx.find(EXTENSION_SELECTOR);
      const settings = extension.dataset || {};
      const forward = settings.classesForward || "htmx-slide-push-forward";
      const backward = settings.classesBackward || "htmx-slide-push-backward";

      if (name === "htmx:beforeTransition") {
        direction = element.dataset.direction;
        const slide = htmx.find(settings.slide || ".slide");

        if (!slide || !direction) return;

        htmx.removeClass(slide, forward);
        htmx.removeClass(slide, backward);
        htmx.addClass(slide, direction === "forward" ? forward : backward);
        return;
      }

      if (name === "htmx:oobBeforeSwap" ) {
        const slideFragment = event.detail.fragment.querySelector(settings.slide || ".slide");

        if (!slideFragment || !direction || direction === "forward") return;

        htmx.addClass(slideFragment, direction === "forward" ? forward : backward);
      }
    }
  });
})();
