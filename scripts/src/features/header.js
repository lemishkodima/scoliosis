import { qs, selectors } from "../core/dom.js";

export function initHeader() {
  const header = qs(selectors.header);

  function updateHeader() {
    header?.classList.toggle("is-scrolled", window.scrollY > 24);
  }

  window.addEventListener("scroll", updateHeader, { passive: true });
  updateHeader();

  return {
    getState() {
      return {
        mounted: Boolean(header),
        isScrolled: Boolean(header?.classList.contains("is-scrolled")),
        scrollY: Math.round(window.scrollY),
      };
    },
  };
}
