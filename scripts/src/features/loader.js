import { qs, selectors } from "../core/dom.js";

export function initPageLoader({ prefersReducedMotion }) {
  const pageLoader = qs(selectors.pageLoader);
  if (!pageLoader) {
    return {
      getState: () => ({ mounted: false, reason: "missing-loader-node" }),
    };
  }

  const startedAt = window.performance.now();
  const minimumDuration = prefersReducedMotion ? 160 : 2200;
  let hasHidden = false;

  function hideLoader() {
    const elapsed = window.performance.now() - startedAt;
    const delay = Math.max(0, minimumDuration - elapsed);

    window.setTimeout(() => {
      pageLoader.classList.add("is-revealing");
      document.body.classList.add("loader-cleanup");
      document.body.classList.remove("is-loading");
      window.setTimeout(() => document.body.classList.remove("loader-cleanup"), prefersReducedMotion ? 120 : 1200);
      window.setTimeout(
        () => {
          hasHidden = true;
          pageLoader.classList.add("is-hidden");
          window.setTimeout(() => pageLoader.remove(), prefersReducedMotion ? 80 : 520);
        },
        prefersReducedMotion ? 80 : 1500,
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
        reducedMotion: prefersReducedMotion,
      };
    },
  };
}
