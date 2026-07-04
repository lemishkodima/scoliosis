const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

function getMaxScroll() {
  return Math.max(document.documentElement.scrollHeight - window.innerHeight, 0);
}

function getAnchorDestination(event) {
  const link = event.target instanceof Element ? event.target.closest('a[href^="#"]') : null;
  if (!link) return null;

  const hash = link.getAttribute("href");
  if (!hash || hash === "#") return null;

  const destination = document.querySelector(hash);
  if (!destination) return null;

  return { destination, hash };
}

function getScrollOffset() {
  return Number.parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
}

function getTargetTop(destination) {
  return destination.getBoundingClientRect().top + window.scrollY - getScrollOffset();
}

function updateHash(hash) {
  if (window.location.hash === hash) return;
  history.pushState(null, "", hash);
}

function clearHash() {
  if (!window.location.hash) return;
  history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
}

function isApplyAnchor(hash) {
  return hash === "#membership-form" || hash === "#apply";
}

function scrollToAnchor(destination, behavior = "auto") {
  const top = clamp(getTargetTop(destination), 0, getMaxScroll());
  window.scrollTo({ top, left: 0, behavior });
  return top;
}

export function initSmoothScroll({ prefersReducedMotion }) {
  const isFinePointer = window.matchMedia("(min-width: 981px) and (hover: hover) and (pointer: fine)").matches;

  function onNativeAnchorClick(event) {
    const anchor = getAnchorDestination(event);
    if (!anchor) return;

    event.preventDefault();
    const shouldStabilize = isApplyAnchor(anchor.hash);
    const behavior = prefersReducedMotion || shouldStabilize ? "auto" : "smooth";

    scrollToAnchor(anchor.destination, behavior);

    if (shouldStabilize) {
      clearHash();

      const settle = () => {
        const nextTop = clamp(getTargetTop(anchor.destination), 0, getMaxScroll());
        if (Math.abs(window.scrollY - nextTop) > 2) {
          window.scrollTo({ top: nextTop, left: 0, behavior: "auto" });
        }
      };

      window.requestAnimationFrame(settle);
      window.setTimeout(settle, 220);
      return;
    }

    updateHash(anchor.hash);
  }

  document.addEventListener("click", onNativeAnchorClick);

  return {
    scrollTo: (value) => window.scrollTo({ top: value, behavior: prefersReducedMotion ? "auto" : "smooth" }),
    getState: () => ({
      enabled: false,
      finePointer: isFinePointer,
      nativeScroll: true,
      reducedMotion: prefersReducedMotion,
    }),
  };
}
