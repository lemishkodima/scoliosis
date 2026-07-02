import { exposeDebugApi } from "./core/debug.js?v=20260701-hero-overlay-balance-1";
import { getMotionPreference } from "./core/dom.js?v=20260701-hero-overlay-balance-1";
import { initCursor } from "./features/cursor.js?v=20260701-hero-overlay-balance-1";
import { initHeader } from "./features/header.js?v=20260701-hero-overlay-balance-1";
import { initHeroInteractions } from "./features/hero-interactions.js?v=20260701-hero-overlay-balance-1";
import { initHeroScrollScene } from "./features/hero-scroll-scene.js?v=20260702-metabole-fix-4";
import { initHeroVideoLoopFade } from "./features/hero-video.js?v=20260701-hero-overlay-balance-1";
import { initLanguageSwitcher } from "./features/i18n.js?v=20260701-hero-overlay-balance-1";
import { initPageLoader } from "./features/loader.js?v=20260702-metabole-fix-4";
import { initMembershipForm } from "./features/form.js?v=20260701-hero-overlay-balance-1";
import { initRevealCards } from "./features/reveal.js?v=20260702-metabole-fix-4";

const prefersReducedMotion = getMotionPreference();

const systems = {
  cursor: initCursor({ prefersReducedMotion }),
  form: initMembershipForm(),
  header: initHeader(),
  heroInteractions: initHeroInteractions({ prefersReducedMotion }),
  heroScroll: initHeroScrollScene({ prefersReducedMotion }),
  heroVideo: initHeroVideoLoopFade({ prefersReducedMotion }),
  language: initLanguageSwitcher(),
  loader: initPageLoader({ prefersReducedMotion }),
  reveal: initRevealCards({ prefersReducedMotion }),
};

exposeDebugApi(systems);
