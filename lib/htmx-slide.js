"use strict";

(function() {
  const EXTENSION_SELECTOR = "[hx-ext*='slide']";

  let direction;

  htmx.registerExtension("slide", {
    init: (api) => {
      const extension = htmx.find(EXTENSION_SELECTOR);

      if (!extension) return;

      const body = document.body;

      body.addEventListener("click", addFullScreenToggle.bind(null, extension));
      body.addEventListener("keydown", addFullScreenToggle.bind(null, extension));
      body.addEventListener("click", removeViewTransitionName.bind(null, extension));
      body.addEventListener("keydown", removeViewTransitionName.bind(null, extension));
    },

    htmx_before_viewTransition: (element, detail) => {
      debugger;



      const extension = htmx.find(EXTENSION_SELECTOR);
      const slideID = loadSlideID(extension);
      const slide = htmx.find(slideID);

      direction = element.dataset.direction;

      if (!slide || !direction) return;

      const [forwardTransition, backwardTransition] = buildTransitions(extension, slide);
      const transitionName = direction === "forward" ? forwardTransition : backwardTransition;

      slide.style.viewTransitionName = transitionName;
    },

    // htmx_before_viewTransition: (element, detail) => {
    //   const extension = htmx.find(EXTENSION_SELECTOR);
    //   const slideID = loadSlideID(extension);
    //   const slide = htmx.find(slideID);
    //   const slideFragment = detail.fragment.querySelector(slideID);

    //   direction = element.dataset.direction;

    //   if (!slideFragment || !direction || direction === "forward") return;

    //   const [, backwardTransition] = buildTransitions(extension, slide);

    //   slideFragment.style.viewTransitionName = backwardTransition;
    // }
  });

  function addFullScreenToggle(extension, event) {
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
