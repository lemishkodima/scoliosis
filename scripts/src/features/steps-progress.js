import { qsa, qs } from "../core/dom.js";

const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max);

export function initStepsProgress({ prefersReducedMotion }) {
  const section = qs("[data-steps-progress]");
  const list = qs("[data-step-list]", section);
  const cards = qsa("[data-step-card]", list);

  if (!section || !list || cards.length === 0) {
    return {
      getState() {
        return { enabled: false };
      },
    };
  }

  let frame = 0;

  function setActiveStep(progress) {
    const segment = 1 / cards.length;
    const activeIndex = Math.min(cards.length - 1, Math.floor(clamp(progress, 0, 0.999) / segment));

    section.style.setProperty("--steps-progress", progress.toFixed(3));
    list.style.setProperty("--steps-progress", progress.toFixed(3));

    cards.forEach((card, index) => {
      const start = index * segment;
      const localProgress = clamp((progress - start) / segment);
      const textProgress = clamp((localProgress - 0.18) / 0.42);

      card.style.setProperty("--step-fill", localProgress.toFixed(3));
      card.style.setProperty("--step-copy", textProgress.toFixed(3));
      card.classList.toggle("is-active", index === activeIndex);
      card.classList.toggle("is-complete", index < activeIndex);
    });
  }

  function measureProgress() {
    const listTop = section.offsetTop + list.offsetTop;
    const listBottom = listTop + list.offsetHeight;
    const start = listTop - window.innerHeight * 0.82;
    const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 0);
    const naturalEnd = listBottom - window.innerHeight * 0.36;
    const end = Math.min(naturalEnd, maxScroll);
    const scrollDistance = Math.max(end - start, 1);
    return clamp((window.scrollY - start) / scrollDistance);
  }

  function update() {
    frame = 0;
    setActiveStep(measureProgress());
  }

  function requestUpdate() {
    if (frame) return;
    frame = window.requestAnimationFrame(update);
  }

  setActiveStep(prefersReducedMotion ? 1 : measureProgress());

  if (!prefersReducedMotion) {
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    window.addEventListener("load", requestUpdate, { once: true });
    window.addEventListener("pageshow", requestUpdate);
  }

  return {
    getState() {
      return {
        enabled: !prefersReducedMotion,
        progress: measureProgress(),
      };
    },
  };
}
