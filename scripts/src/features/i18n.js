import { translations } from "../config/translations.js?v=20260704-participant-category-label-1";
import { qs, qsa, selectors } from "../core/dom.js";

let currentLanguage = localStorage.getItem("scoliosis-language") || "uk";

export function getCurrentLanguage() {
  return currentLanguage;
}

export function t(key) {
  return translations[currentLanguage]?.[key] || translations.uk[key] || key;
}

export function applyLanguage(language = currentLanguage) {
  currentLanguage = translations[language] ? language : "uk";
  localStorage.setItem("scoliosis-language", currentLanguage);
  document.documentElement.lang = currentLanguage;
  document.title = t("meta.title");

  qsa("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });
  qsa("[data-i18n-alt]").forEach((node) => {
    node.setAttribute("alt", t(node.dataset.i18nAlt));
  });
  qsa("[data-i18n-aria]").forEach((node) => {
    node.setAttribute("aria-label", t(node.dataset.i18nAria));
  });
  qsa("[data-i18n-meta]").forEach((node) => {
    node.setAttribute("content", t(node.dataset.i18nMeta));
  });

  const languageButtons = qsa(selectors.languageButton);
  languageButtons.forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.lang === currentLanguage));
  });

  const activeLanguageButton = qs(`[data-lang="${currentLanguage}"]`);
  const currentLanguageLabel = qs(selectors.currentLanguage);
  if (currentLanguageLabel && activeLanguageButton) {
    currentLanguageLabel.textContent = activeLanguageButton.textContent.trim();
  }
}

export function closeLanguageMenu() {
  qs(selectors.languageSwitch)?.classList.remove("is-open");
  qs(selectors.languageToggle)?.setAttribute("aria-expanded", "false");
}

function toggleLanguageMenu() {
  const languageSwitch = qs(selectors.languageSwitch);
  const languageToggle = qs(selectors.languageToggle);
  const nextState = !languageSwitch?.classList.contains("is-open");
  languageSwitch?.classList.toggle("is-open", nextState);
  languageToggle?.setAttribute("aria-expanded", String(nextState));
}

export function initLanguageSwitcher() {
  const languageButtons = qsa(selectors.languageButton);
  const languageSwitch = qs(selectors.languageSwitch);
  const languageToggle = qs(selectors.languageToggle);

  languageButtons.forEach((button) => {
    button.addEventListener("click", () => {
      applyLanguage(button.dataset.lang);
      closeLanguageMenu();
    });
  });

  languageToggle?.addEventListener("click", toggleLanguageMenu);

  document.addEventListener("click", (event) => {
    if (!languageSwitch?.contains(event.target)) {
      closeLanguageMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeLanguageMenu();
  });

  applyLanguage(currentLanguage);

  return {
    getState() {
      return {
        activeLanguage: currentLanguage,
        buttonCount: languageButtons.length,
        isOpen: Boolean(languageSwitch?.classList.contains("is-open")),
      };
    },
  };
}
