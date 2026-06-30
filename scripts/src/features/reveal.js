import { qsa } from "../core/dom.js";

export function initRevealCards() {
  const cards = qsa(".reveal-card");
  const revealItems = qsa(
    ".section-heading, .mission-media, .mission-copy, .audience-copy, .audience-panel, .gallery-copy, .gallery-card, .opens, .step-list li, .apply-copy, .membership-form",
  );
  revealItems.forEach((item, index) => {
    item.classList.add("scroll-reveal");
    item.style.setProperty("--reveal-index", `${index % 6}`);
  });

  const allItems = [...cards, ...revealItems];
  if (!("IntersectionObserver" in window)) {
    allItems.forEach((item) => item.classList.add("is-visible"));
    return {
      getState: () => ({
        enabled: false,
        cardCount: cards.length,
        revealCount: revealItems.length,
        reason: "missing-intersection-observer",
      }),
    };
  }

  let observedCount = allItems.length;
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

  allItems.forEach((item) => revealObserver.observe(item));

  return {
    getState() {
      return {
        enabled: true,
        cardCount: cards.length,
        revealCount: revealItems.length,
        remaining: observedCount,
      };
    },
  };
}
