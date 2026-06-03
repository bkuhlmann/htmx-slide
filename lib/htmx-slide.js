"use strict";

(function() {
  const EXTENSION_SELECTOR = "[hx-ext*='slide']";

  const toggleFullScreen = (selector) => {
    const viewport = document.querySelector(selector);

    if (!viewport) return;

    if (!document.fullscreenElement) {
      if (viewport.requestFullscreen) {
        viewport.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
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
      const element = event.detail.elt;

      if (name === "htmx:beforeTransition") {
        const extension = htmx.find(EXTENSION_SELECTOR);
        const settings = extension.dataset;
        const slide = htmx.find(settings.slide || ".slide");

        if (!slide) return;

        const forward = settings.classesForward || "htmx-slide-push-forward";
        const backward = settings.classesBackward || "htmx-slide-push-backward";
        const direction = element.dataset.direction;

        htmx.removeClass(slide, forward);
        htmx.removeClass(slide, backward);

        if (direction === "forward") {
          htmx.addClass(slide, forward);
        } else if (direction === "backward") {
          htmx.addClass(slide, backward);
        };
      }
    }
  });
})();
