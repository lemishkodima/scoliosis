import { qs, selectors } from "../core/dom.js";

export function initPageLoader({ prefersReducedMotion }) {
  const pageLoader = qs(selectors.pageLoader);
  if (!pageLoader) {
    return {
      getState: () => ({ mounted: false, reason: "missing-loader-node" }),
    };
  }

  const startedAt = window.performance.now();
  const minimumDuration = prefersReducedMotion ? 120 : 1550;
  let hasHidden = false;
  let phase = "enter";

  pageLoader.classList.add("is-loader-enter");

  function hideLoader() {
    const elapsed = window.performance.now() - startedAt;
    const delay = Math.max(0, minimumDuration - elapsed);

    window.setTimeout(() => {
      phase = "open";
      pageLoader.classList.remove("is-loader-enter");
      pageLoader.classList.add("is-loader-open");
      pageLoader.classList.add("is-revealing");
      document.body.classList.add("loader-cleanup");
      document.body.classList.remove("is-loading");
      document.body.classList.add("is-hero-ready");
      window.setTimeout(() => document.body.classList.remove("loader-cleanup"), prefersReducedMotion ? 90 : 920);
      window.setTimeout(
        () => {
          phase = "hidden";
          hasHidden = true;
          pageLoader.classList.add("is-hidden");
          window.setTimeout(() => pageLoader.remove(), prefersReducedMotion ? 60 : 420);
        },
        prefersReducedMotion ? 70 : 1320,
      );
    }, delay);
  }

  if (document.readyState === "complete") {
    hideLoader();
  } else {
    window.addEventListener("load", hideLoader, { once: true });
  }

  return {
    getState() {
      return {
        mounted: document.body.contains(pageLoader),
        hidden: hasHidden || pageLoader.classList.contains("is-hidden"),
        phase,
        reducedMotion: prefersReducedMotion,
      };
    },
  };
}
