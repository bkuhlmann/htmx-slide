"use strict";

(function() {
  const DEFAULTS = {
    slide: ".slide",
    transitions: {forward: "push", backward: "push"},
    fullscreen: {key: "f", trigger: "[data-fullscreen-trigger]", target: ".viewport"}
  };

  let initialized = false;
  let configuration = {};

  htmx.registerExtension("slide", {
    htmx_after_init: () => {
      if (!initialized) {
        configuration = {...DEFAULTS, ...htmx.config.slide};

        const slide = htmx.find(configuration.slide);
        const body = document.body;

        if (!slide) return;

        body.addEventListener("click", addFullScreenToggle.bind(null, slide));
        body.addEventListener("keydown", addFullScreenToggle.bind(null, slide));
        body.addEventListener("click", removeViewTransitionName.bind(null, slide));
        body.addEventListener("keydown", removeViewTransitionName.bind(null, slide));

        initialized = true;
      }
    },

    htmx_before_swap: (element, detail) => {
      const direction = element.dataset.direction;
      const slideSelector = configuration.slide;

      let slide = htmx.find(slideSelector);

      if (!slide || !direction) return;

      const [forwardTransition, backwardTransition] = buildTransitions(slide, slide);
      const transitionName = direction === "forward" ? forwardTransition : backwardTransition;

      if (direction === "backward") { slide = findSlide(detail.tasks, slideSelector); }

      slide.style.viewTransitionName = transitionName;
    }
  });

  function addFullScreenToggle(slide, event) {
    const settings = configuration.fullscreen;
    const dataset = slide.dataset;
    const fullscreenSelector = dataset.fullscreenTrigger || settings.trigger;
    const fullscreenTrigger = htmx.find(fullscreenSelector);

    if (!fullscreenTrigger) return;

    const targetSelector = fullscreenTrigger.dataset.fullscreenTarget || settings.target;

    if (event.type === "keydown") {
      const fullscreenKey = dataset.fullscreenKey || settings.key;

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
  }

  function toggleFullScreen(selector) {
    const viewport = document.querySelector(selector);

    if (!viewport) return;

    if (!document.fullscreenElement && viewport.requestFullscreen) {
      viewport.requestFullscreen();
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }

  function removeViewTransitionName(slide, event) {
    const element = event.target;

    if (element.tagName !== "A") return;

    const link = element.getAttribute("href");

    if (!link || link.startsWith("#") || link.startsWith("http")) return;

    if (slide) { slide.removeAttribute("style"); }
  }

  function findSlide(tasks, selector) {
    for (const task of tasks) {
      if (task.fragment) {
        const slide = task.fragment.querySelector(selector);
        if (slide) return slide;
      }
    }

    return null;
  }

  function buildTransitions(globalElement, targetElement) {
    const transitions = configuration.transitions;
    const transitionForward = targetElement.dataset.transitionsForward || transitions.forward;
    const transitionBackward = targetElement.dataset.transitionsBackward || transitions.backward;

    return [
      "htmx-slide-" + transitionForward + "-forward",
      "htmx-slide-" + transitionBackward + "-backward"
    ];
  }
})();
