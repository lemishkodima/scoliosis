import { qsa } from "../core/dom.js";

const REVEAL_SELECTOR = [
  ".section-heading",
  ".gallery-copy",
  ".reveal-card",
  ".gallery-card",
  ".audience-copy",
  ".mission-media",
  ".mission-copy",
  ".check-list li",
  ".apply-copy",
  ".membership-form",
].join(",");

export function initReveal({ prefersReducedMotion }) {
  const items = qsa(REVEAL_SELECTOR);

  if (items.length === 0 || prefersReducedMotion) {
    items.forEach((item) => item.classList.add("is-visible"));
    return {
      enabled: false,
      count: items.length,
    };
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      root: null,
      rootMargin: "0px 0px -12% 0px",
      threshold: 0.14,
    },
  );

  items.forEach((item) => {
    item.classList.add("is-reveal-ready");
    observer.observe(item);
  });

  return {
    enabled: true,
    count: items.length,
  };
}
