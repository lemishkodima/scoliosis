const TRANSITION_DURATION = 620;
const ENTRY_OPEN_DELAY = 40;
const ENTRY_REMOVE_DELAY = 760;
const TRANSITION_STORAGE_KEY = "scoliosis-page-transition";

function createLoaderBlocks() {
  return Array.from({ length: 24 }, () => "<span></span>").join("");
}

function createTransitionOverlay() {
  const overlay = document.createElement("div");
  overlay.className = "page-loader page-transition";
  overlay.setAttribute("aria-hidden", "true");
  overlay.innerHTML = `
    <div class="loader-grid" aria-hidden="true"></div>
    <div class="loader-blocks" aria-hidden="true">${createLoaderBlocks()}</div>
    <span class="page-transition-logo" aria-hidden="true">
      <img src="assets/images/logo-mark.webp" alt="" width="512" height="512" />
    </span>
  `;
  return overlay;
}

function isModifiedClick(event) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
}

function shouldSkipTransition(link, url) {
  if (link.target && link.target !== "_self") return true;
  if (link.hasAttribute("download")) return true;
  if (url.origin !== window.location.origin) return true;
  if (!["http:", "https:"].includes(url.protocol)) return true;

  const currentPath = window.location.pathname.replace(/\/index\.html$/, "/");
  const nextPath = url.pathname.replace(/\/index\.html$/, "/");
  return currentPath === nextPath && url.search === window.location.search;
}

export function initPageTransitions({ prefersReducedMotion }) {
  let isTransitioning = false;

  const shouldPlayEntryTransition = sessionStorage.getItem(TRANSITION_STORAGE_KEY) === "1";
  sessionStorage.removeItem(TRANSITION_STORAGE_KEY);

  if (shouldPlayEntryTransition && !prefersReducedMotion) {
    const entryOverlay = createTransitionOverlay();
    entryOverlay.classList.add("is-transition-active", "is-transition-entry");
    document.body.append(entryOverlay);
    document.body.classList.add("is-page-transitioning");

    window.setTimeout(() => {
      document.documentElement.classList.remove("is-transition-boot");
      entryOverlay.classList.add("is-transition-opening");
    }, ENTRY_OPEN_DELAY);

    window.setTimeout(() => {
      entryOverlay.classList.add("is-hidden");
      document.body.classList.remove("is-page-transitioning");
      window.setTimeout(() => entryOverlay.remove(), 220);
    }, ENTRY_REMOVE_DELAY);
  } else {
    document.documentElement.classList.remove("is-transition-boot");
  }

  document.addEventListener("click", (event) => {
    if (isTransitioning || isModifiedClick(event)) return;

    const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
    if (!link) return;

    const url = new URL(link.href, window.location.href);
    if (shouldSkipTransition(link, url)) return;

    event.preventDefault();
    isTransitioning = true;

    if (prefersReducedMotion) {
      sessionStorage.setItem(TRANSITION_STORAGE_KEY, "1");
      window.location.href = url.href;
      return;
    }

    sessionStorage.setItem(TRANSITION_STORAGE_KEY, "1");
    const overlay = createTransitionOverlay();
    document.body.append(overlay);
    document.body.classList.add("is-page-transitioning");

    requestAnimationFrame(() => {
      overlay.classList.add("is-transition-active");
    });

    window.setTimeout(() => {
      window.location.href = url.href;
    }, TRANSITION_DURATION);
  });

  return {
    getState() {
      return {
        mounted: true,
        transitioning: isTransitioning,
        reducedMotion: prefersReducedMotion,
      };
    },
  };
}
