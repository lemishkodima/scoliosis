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
      card.classList.toggle("is-active", index === activeIndex);
      card.classList.toggle("is-complete", index < activeIndex);
    });
  }

  function measureProgress() {
    const rect = section.getBoundingClientRect();
    const scrollDistance = Math.max(section.offsetHeight - window.innerHeight, 1);
    return clamp(-rect.top / scrollDistance);
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
