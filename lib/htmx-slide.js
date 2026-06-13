"use strict";

(function() {
  const EXTENSION_SELECTOR = "[hx-ext*='slide']";

  let direction;

  htmx.defineExtension("slide", {
    init() {
      const extension = htmx.find(EXTENSION_SELECTOR);

      if (!extension) return;

      const addTrigger = (event) => {
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
      body.addEventListener("click", removeViewTransitionName.bind(null, extension));
      body.addEventListener("keydown", removeViewTransitionName.bind(null, extension));
    },

    onEvent(name, event) {
      if (name !== "htmx:beforeTransition" && name !== "htmx:oobBeforeSwap") return;

      const element = event.detail.elt;
      const extension = htmx.find(EXTENSION_SELECTOR);
      const slideID = loadSlideID(extension);
      const slide = htmx.find(slideID);

      if (name === "htmx:beforeTransition") {
        direction = element.dataset.direction;

        if (!slide || !direction) return;

        const [forwardTransition, backwardTransition] = buildTransitions(extension, slide);
        const transitionName = direction === "forward" ? forwardTransition : backwardTransition;

        slide.style.viewTransitionName = transitionName;
        return;
      }

      if (name === "htmx:oobBeforeSwap" ) {
        const slideFragment = event.detail.fragment.querySelector(slideID);

        if (!slideFragment || !direction || direction === "forward") return;

        const [, backwardTransition] = buildTransitions(extension, slide);

        slideFragment.style.viewTransitionName = backwardTransition;
      }
    }
  });

  function toggleFullScreen(selector) {
    const viewport = document.querySelector(selector);

    if (!viewport) return;

    if (!document.fullscreenElement && viewport.requestFullscreen) {
      viewport.requestFullscreen();
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  };

  function removeViewTransitionName(extension, event) {
    const element = event.target;

    if (element.tagName !== "A") return;

    const link = element.getAttribute("href");

    if (!link || link.startsWith("#") || link.startsWith("http")) return;

    const slide = htmx.find(loadSlideID(extension));

    if (slide) {
      slide.removeAttribute("style");
    }
  };

  function loadSlideID(extension) {
    return extension.dataset.slide || "#slide";
  };

  function buildTransitions(globalElement, targetElement) {
    const settings = {...globalElement.dataset, ...targetElement.dataset};
    const forwardTransition = settings.transitionsForward || "push";
    const backwardTransition = settings.transitionsBackward || "push";

    return [
      "htmx-slide-" + forwardTransition + "-forward",
      "htmx-slide-" + backwardTransition + "-backward"
    ];
  };
})();
