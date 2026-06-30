import { exposeDebugApi } from "./core/debug.js";
import { getMotionPreference } from "./core/dom.js";
import { initCursor } from "./features/cursor.js";
import { initDepthBackground } from "./features/depth-background.js";
import { initHeader } from "./features/header.js";
import { initHeroInteractions } from "./features/hero-interactions.js";
import { initHeroVideoLoopFade } from "./features/hero-video.js";
import { initLanguageSwitcher } from "./features/i18n.js";
import { initPageLoader } from "./features/loader.js";
import { initMembershipForm } from "./features/form.js";
import { initRevealCards } from "./features/reveal.js";
import { initLocomotiveScroll } from "./features/locomotive-scroll.js";

const prefersReducedMotion = getMotionPreference();

const systems = {
  cursor: initCursor({ prefersReducedMotion }),
  depthBackground: initDepthBackground({ prefersReducedMotion }),
  form: initMembershipForm(),
  header: initHeader(),
  heroInteractions: initHeroInteractions({ prefersReducedMotion }),
  heroVideo: initHeroVideoLoopFade({ prefersReducedMotion }),
  language: initLanguageSwitcher(),
  loader: initPageLoader({ prefersReducedMotion }),
  locomotiveScroll: initLocomotiveScroll({ prefersReducedMotion }),
  reveal: initRevealCards({ prefersReducedMotion }),
};

exposeDebugApi(systems);
