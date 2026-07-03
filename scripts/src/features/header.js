import { qs, selectors } from "../core/dom.js";

export function initHeader() {
  const header = qs(selectors.header);
  const mobileFloatingCta = qs(selectors.mobileFloatingCta);
  header?.classList.add("is-scrolled");

  const updateFloatingCta = () => {
    if (!mobileFloatingCta) return;

    document.body.classList.toggle(
      "is-mobile-cta-visible",
      window.scrollY > window.innerHeight * 0.82,
    );
  };

  const updateHeroBackgroundState = () => {
    const intro = document.querySelector(".intro");
    const threshold = intro
      ? Math.max(intro.offsetTop - window.innerHeight * 0.2, window.innerHeight * 0.72)
      : window.innerHeight * 0.9;

    document.body.classList.toggle("is-hero-background-hidden", window.scrollY > threshold);
  };

  const updateScrollState = () => {
    updateFloatingCta();
    updateHeroBackgroundState();
  };

  updateScrollState();
  window.addEventListener("scroll", updateScrollState, { passive: true });
  window.addEventListener("resize", updateScrollState);

  return {
    getState() {
      return {
        mounted: Boolean(header),
        isScrolled: Boolean(header?.classList.contains("is-scrolled")),
        heroBackgroundHidden: Boolean(document.body.classList.contains("is-hero-background-hidden")),
        scrollY: Math.round(window.scrollY),
        mobileCtaVisible: Boolean(document.body.classList.contains("is-mobile-cta-visible")),
        scrollAnimation: false,
      };
    },
  };
}
