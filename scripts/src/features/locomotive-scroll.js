export function initLocomotiveScroll({ prefersReducedMotion }) {
  const supportsFinePointer = window.matchMedia("(min-width: 981px) and (hover: hover) and (pointer: fine)").matches;
  const LocomotiveScroll = window.LocomotiveScroll;
  const root = document.documentElement;

  if (prefersReducedMotion || !supportsFinePointer) {
    root.dataset.scrollEngine = "native";
    root.dataset.scrollEngineReason = prefersReducedMotion ? "reduced-motion" : "non-desktop-pointer";
    return {
      enabled: false,
      reason: prefersReducedMotion ? "reduced-motion" : "non-desktop-pointer",
    };
  }

  if (typeof LocomotiveScroll !== "function") {
    root.dataset.scrollEngine = "native";
    root.dataset.scrollEngineReason = "missing-locomotive-scroll";
    return {
      enabled: false,
      reason: "missing-locomotive-scroll",
    };
  }

  const instance = new LocomotiveScroll({
    lenisOptions: {
      lerp: 0.085,
      wheelMultiplier: 0.86,
      touchMultiplier: 1.1,
    },
  });

  window.addEventListener("load", () => instance.update(), { once: true });
  window.addEventListener("resize", () => instance.update(), { passive: true });
  root.dataset.scrollEngine = "locomotive";
  root.dataset.scrollEngineReason = "";

  return {
    enabled: true,
    instance,
    getState() {
      return {
        enabled: true,
        library: "locomotive-scroll",
      };
    },
  };
}
