import { qs, selectors } from "../core/dom.js";

export function initHeader() {
  const header = qs(selectors.header);
  header?.classList.add("is-scrolled");

  return {
    getState() {
      return {
        mounted: Boolean(header),
        isScrolled: Boolean(header?.classList.contains("is-scrolled")),
        scrollY: Math.round(window.scrollY),
        scrollAnimation: false,
      };
    },
  };
}
