import { exposeDebugApi } from "./core/debug.js?v=20260701-hero-overlay-balance-1";
import { getMotionPreference } from "./core/dom.js?v=20260703-hero-viewport-fit-1";
import { initCursor } from "./features/cursor.js?v=20260701-hero-overlay-balance-1";
import { initHeader } from "./features/header.js?v=20260703-mobile-polish-1";
import { initHeroInteractions } from "./features/hero-interactions.js?v=20260701-hero-overlay-balance-1";
import { initHeroVideoLoopFade } from "./features/hero-video.js?v=20260703-safari-hero-anchor-1";
import { initLanguageSwitcher } from "./features/i18n.js?v=20260704-participant-category-label-1";
import { initPageLoader } from "./features/loader.js?v=20260703-loader-dot-video-edge-1";
import { initMembershipForm } from "./features/form.js?v=20260704-vercel-secret-proxy-1";
import { initReveal } from "./features/reveal.js?v=20260703-steps-numbers-static-open-lines-1";
import { initSmoothScroll } from "./features/smooth-scroll.js?v=20260704-native-scroll-1";
import { initStepsProgress } from "./features/steps-progress.js?v=20260703-loader-dot-video-edge-1";

if ("scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

const navigationEntry = window.performance?.getEntriesByType?.("navigation")?.[0];
const shouldResetScroll =
  navigationEntry?.type === "reload" ||
  window.location.hash === "#membership-form" ||
  window.location.hash === "#apply";

if (shouldResetScroll) {
  if (window.location.hash === "#membership-form" || window.location.hash === "#apply") {
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
  }

  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  window.addEventListener("load", () => window.scrollTo({ top: 0, left: 0, behavior: "auto" }), { once: true });
}

const prefersReducedMotion = getMotionPreference();

const systems = {
  cursor: initCursor({ prefersReducedMotion }),
  form: initMembershipForm(),
  header: initHeader(),
  heroInteractions: initHeroInteractions({ prefersReducedMotion }),
  heroVideo: initHeroVideoLoopFade({ prefersReducedMotion }),
  language: initLanguageSwitcher(),
  loader: initPageLoader({ prefersReducedMotion }),
  reveal: initReveal({ prefersReducedMotion }),
  smoothScroll: initSmoothScroll({ prefersReducedMotion }),
  stepsProgress: initStepsProgress({ prefersReducedMotion }),
};

exposeDebugApi(systems);
