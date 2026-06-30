import { qsa } from "../core/dom.js";

export function initRevealCards() {
  const cards = qsa(".reveal-card");
  if (!("IntersectionObserver" in window)) {
    cards.forEach((card) => card.classList.add("is-visible"));
    return {
      getState: () => ({ enabled: false, cardCount: cards.length, reason: "missing-intersection-observer" }),
    };
  }

  let observedCount = cards.length;
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
          observedCount -= 1;
        }
      });
    },
    { threshold: 0.18 },
  );

  cards.forEach((card) => revealObserver.observe(card));

  return {
    getState() {
      return {
        enabled: true,
        cardCount: cards.length,
        remaining: observedCount,
      };
    },
  };
}
