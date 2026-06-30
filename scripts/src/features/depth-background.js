export function initDepthBackground({ prefersReducedMotion }) {
  const root = document.documentElement;
  let latestScrollY = window.scrollY;
  let frameId = 0;

  function applyDepth() {
    frameId = 0;
    if (prefersReducedMotion) {
      root.style.setProperty("--depth-scroll", "0px");
      root.style.setProperty("--hero-video-y", "0px");
      root.style.setProperty("--hero-stage-y", "0px");
      return;
    }

    const depthY = Math.min(latestScrollY, 1600);
    const heroVideoY = Math.max(-110, Math.min(36, latestScrollY * -0.12));
    const heroStageY = Math.max(-42, Math.min(18, latestScrollY * -0.045));
    root.style.setProperty("--depth-scroll", `${depthY}px`);
    root.style.setProperty("--hero-video-y", `${heroVideoY}px`);
    root.style.setProperty("--hero-stage-y", `${heroStageY}px`);
  }

  function requestDepthUpdate() {
    latestScrollY = window.scrollY;
    if (!frameId) frameId = window.requestAnimationFrame(applyDepth);
  }

  requestDepthUpdate();
  window.addEventListener("scroll", requestDepthUpdate, { passive: true });

  return {
    getState() {
      return {
        reducedMotion: prefersReducedMotion,
        scrollY: Math.round(latestScrollY),
        depthScroll: root.style.getPropertyValue("--depth-scroll"),
        heroVideoY: root.style.getPropertyValue("--hero-video-y"),
      };
    },
  };
}
