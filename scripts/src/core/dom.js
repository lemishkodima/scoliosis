export const selectors = {
  canvas: "[data-hero-canvas]",
  cursor: "[data-cursor]",
  form: "[data-membership-form]",
  header: "[data-header]",
  languageButton: "[data-lang]",
  languageSwitch: "[data-language-switch]",
  languageToggle: "[data-language-toggle]",
  currentLanguage: "[data-current-lang]",
  logoStage: "[data-logo-stage]",
  pageLoader: "[data-page-loader]",
  status: "[data-form-status]",
  visual: "[data-hero-visual]",
};

export function qs(selector, scope = document) {
  return scope.querySelector(selector);
}

export function qsa(selector, scope = document) {
  return Array.from(scope.querySelectorAll(selector));
}

export function getMotionPreference() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
