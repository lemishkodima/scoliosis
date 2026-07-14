const TRANSITION_DURATION = 720;

function createLoaderBlocks() {
  return Array.from({ length: 24 }, () => "<span></span>").join("");
}

function createBrandLetters(text, startIndex) {
  return Array.from(text)
    .map((letter, index) => `<span style="--i: ${startIndex + index}">${letter}</span>`)
    .join("");
}

function createTransitionOverlay() {
  const overlay = document.createElement("div");
  overlay.className = "page-loader page-transition";
  overlay.setAttribute("aria-hidden", "true");
  overlay.innerHTML = `
    <div class="loader-grid" aria-hidden="true"></div>
    <div class="loader-blocks" aria-hidden="true">${createLoaderBlocks()}</div>
    <span class="loader-cross" aria-hidden="true"></span>
    <div class="loader-core">
      <span class="loader-logo-orbit" aria-hidden="true">
        <img src="assets/images/logo-mark.webp" alt="" width="512" height="512" />
      </span>
      <span class="loader-brand-name" aria-label="Ukrainian Scoliosis Association">
        <span class="loader-brand-line" aria-hidden="true">${createBrandLetters("UKRAINIAN", 0)}</span>
        <span class="loader-brand-line" aria-hidden="true">${createBrandLetters("SCOLIOSIS", 9)}</span>
        <span class="loader-brand-line" aria-hidden="true">${createBrandLetters("ASSOCIATION", 18)}</span>
      </span>
    </div>
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

  document.addEventListener("click", (event) => {
    if (isTransitioning || isModifiedClick(event)) return;

    const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
    if (!link) return;

    const url = new URL(link.href, window.location.href);
    if (shouldSkipTransition(link, url)) return;

    event.preventDefault();
    isTransitioning = true;

    if (prefersReducedMotion) {
      window.location.href = url.href;
      return;
    }

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
