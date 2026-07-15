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

const MOBILE_MEDIA_REVEAL_SELECTOR = ".people-grid .person-card figure, .leadership-card figure";

export function initReveal({ prefersReducedMotion }) {
  const mobileMediaItems = qsa(MOBILE_MEDIA_REVEAL_SELECTOR);
  const items = [...qsa(REVEAL_SELECTOR), ...mobileMediaItems];
  const mobileMediaSet = new Set(mobileMediaItems);
  const pendingMediaReveals = new WeakSet();

  function revealMobileMedia(item) {
    if (item.classList.contains("is-visible") || pendingMediaReveals.has(item)) return;

    const image = item.querySelector("img");
    const reveal = () => item.classList.add("is-visible");
    pendingMediaReveals.add(item);

    if (!image) {
      reveal();
      return;
    }

    const revealAfterDecode = () => {
      if (typeof image.decode !== "function") {
        reveal();
        return;
      }

      image.decode().catch(() => {}).finally(reveal);
    };

    if (image.complete) {
      revealAfterDecode();
      return;
    }

    image.addEventListener("load", revealAfterDecode, { once: true });
    image.addEventListener("error", reveal, { once: true });
  }

  mobileMediaItems.forEach((item) => item.classList.add("is-mobile-media-reveal"));

  if (mobileMediaItems.length > 0 && !prefersReducedMotion) {
    // Lock the hidden state before transitions are enabled to prevent an initial flash.
    document.documentElement.getBoundingClientRect();
    mobileMediaItems.forEach((item) => item.classList.add("is-mobile-media-animated"));
  }

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
        if (mobileMediaSet.has(entry.target)) {
          revealMobileMedia(entry.target);
        } else {
          entry.target.classList.add("is-visible");
        }
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

  if (mobileMediaItems.length > 0) {
    const revealVisibleMobileMedia = () => {
      const revealBoundary = window.innerHeight * 0.88;

      mobileMediaItems.forEach((item) => {
        const bounds = item.getBoundingClientRect();
        if (bounds.top >= revealBoundary || bounds.bottom <= 0) return;

        revealMobileMedia(item);
        observer.unobserve(item);
      });
    };

    window.setTimeout(revealVisibleMobileMedia, 80);
  }

  return {
    enabled: true,
    count: items.length,
  };
}
