import { exposeDebugApi } from "./core/debug.js?v=20260701-hero-overlay-balance-1";
import { getMotionPreference } from "./core/dom.js?v=20260703-hero-viewport-fit-1";
import { initCursor } from "./features/cursor.js?v=20260701-hero-overlay-balance-1";
import { initHeader } from "./features/header.js?v=20260703-hero-viewport-fit-1";
import { initHeroInteractions } from "./features/hero-interactions.js?v=20260701-hero-overlay-balance-1";
import { initHeroVideoLoopFade } from "./features/hero-video.js?v=20260701-hero-overlay-balance-1";
import { initLanguageSwitcher } from "./features/i18n.js?v=20260703-hero-title-accent-1";
import { initPageLoader } from "./features/loader.js?v=20260703-loader-panels-1";
import { initMembershipForm } from "./features/form.js?v=20260701-hero-overlay-balance-1";
import { initStepsProgress } from "./features/steps-progress.js?v=20260703-steps-progress-map-1";

const prefersReducedMotion = getMotionPreference();

const systems = {
  cursor: initCursor({ prefersReducedMotion }),
  form: initMembershipForm(),
  header: initHeader(),
  heroInteractions: initHeroInteractions({ prefersReducedMotion }),
  heroVideo: initHeroVideoLoopFade({ prefersReducedMotion }),
  language: initLanguageSwitcher(),
  loader: initPageLoader({ prefersReducedMotion }),
  stepsProgress: initStepsProgress({ prefersReducedMotion }),
};

exposeDebugApi(systems);
