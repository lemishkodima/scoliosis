import { qs, selectors } from "../core/dom.js";

export function initHeader() {
  const header = qs(selectors.header);
  const mobileFloatingCta = qs(selectors.mobileFloatingCta);
  const menuToggle = qs("[data-menu-toggle]");
  const siteNav = header?.querySelector(".site-nav");
  header?.classList.add("is-scrolled");

  const setMenuOpen = (isOpen) => {
    header?.classList.toggle("is-menu-open", isOpen);
    document.body.classList.toggle("is-menu-open", isOpen);
    menuToggle?.setAttribute("aria-expanded", String(isOpen));
    menuToggle?.setAttribute("aria-label", isOpen ? "Закрити меню" : "Відкрити меню");
  };

  const updateFloatingCta = () => {
    if (!mobileFloatingCta) return;

    document.body.classList.toggle(
      "is-mobile-cta-visible",
      window.scrollY > window.innerHeight * 0.82,
    );
  };

  const updateHeroBackgroundState = () => {
    const intro = document.querySelector(".intro");
    const threshold = intro
      ? Math.max(intro.offsetTop - window.innerHeight * 0.2, window.innerHeight * 0.72)
      : window.innerHeight * 0.9;

    document.body.classList.toggle("is-hero-background-hidden", window.scrollY > threshold);
  };

  const updateScrollState = () => {
    updateFloatingCta();
    updateHeroBackgroundState();
  };

  updateScrollState();
  menuToggle?.addEventListener("click", () => {
    setMenuOpen(!header?.classList.contains("is-menu-open"));
  });
  siteNav?.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest("a")) {
      setMenuOpen(false);
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenuOpen(false);
  });
  document.addEventListener("click", (event) => {
    if (!header?.classList.contains("is-menu-open")) return;
    if (event.target instanceof Node && header.contains(event.target)) return;
    setMenuOpen(false);
  });
  window.addEventListener("scroll", updateScrollState, { passive: true });
  window.addEventListener("resize", () => {
    updateScrollState();
    if (window.innerWidth > 980) setMenuOpen(false);
  });

  return {
    getState() {
      return {
        mounted: Boolean(header),
        isScrolled: Boolean(header?.classList.contains("is-scrolled")),
        menuOpen: Boolean(header?.classList.contains("is-menu-open")),
        heroBackgroundHidden: Boolean(document.body.classList.contains("is-hero-background-hidden")),
        scrollY: Math.round(window.scrollY),
        mobileCtaVisible: Boolean(document.body.classList.contains("is-mobile-cta-visible")),
        scrollAnimation: false,
      };
    },
  };
}
