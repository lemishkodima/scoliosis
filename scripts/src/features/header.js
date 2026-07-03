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

  updateFloatingCta();
  window.addEventListener("scroll", updateFloatingCta, { passive: true });
  window.addEventListener("resize", updateFloatingCta);

  return {
    getState() {
      return {
        mounted: Boolean(header),
        isScrolled: Boolean(header?.classList.contains("is-scrolled")),
        scrollY: Math.round(window.scrollY),
        mobileCtaVisible: Boolean(document.body.classList.contains("is-mobile-cta-visible")),
        scrollAnimation: false,
      };
    },
  };
}
