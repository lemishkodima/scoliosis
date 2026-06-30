export function initDepthBackground({ prefersReducedMotion }) {
  const root = document.documentElement;
  const parallaxItems = Array.from(document.querySelectorAll("[data-parallax]")).map((element) => ({
    element,
    speed: Number(element.dataset.parallaxSpeed || 0.32),
    max: Number(element.dataset.parallaxMax || 30),
    rotate: Number(element.dataset.parallaxRotate || 0),
  }));
  let latestScrollY = window.scrollY;
  let frameId = 0;

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function applyParallaxItems() {
    if (!parallaxItems.length) return;
    const viewportHeight = window.innerHeight || 1;

    parallaxItems.forEach(({ element, speed, max, rotate }) => {
      const rect = element.getBoundingClientRect();
      const elementCenter = rect.top + rect.height / 2;
      const viewportCenter = viewportHeight / 2;
      const progress = (elementCenter - viewportCenter) / viewportHeight;
      const offset = clamp(progress * max * speed * -1, -max, max);
      const rotation = clamp(progress * rotate * -1, rotate * -1, rotate);
      element.style.setProperty("--parallax-y", `${offset.toFixed(2)}px`);
      element.style.setProperty("--parallax-rotate", `${rotation.toFixed(2)}deg`);
    });
  }

  function applyDepth() {
    frameId = 0;
    if (prefersReducedMotion) {
      root.style.setProperty("--depth-scroll", "0px");
      root.style.setProperty("--hero-video-y", "0px");
      root.style.setProperty("--hero-stage-y", "0px");
      parallaxItems.forEach(({ element }) => {
        element.style.setProperty("--parallax-y", "0px");
        element.style.setProperty("--parallax-rotate", "0deg");
      });
      return;
    }

    const depthY = Math.min(latestScrollY, 1600);
    const heroVideoY = Math.max(-140, Math.min(42, latestScrollY * -0.15));
    const heroStageY = Math.max(-54, Math.min(18, latestScrollY * -0.052));
    const introRise = Math.max(0, Math.min(34, latestScrollY * 0.04));
    root.style.setProperty("--depth-scroll", `${depthY}px`);
    root.style.setProperty("--hero-video-y", `${heroVideoY}px`);
    root.style.setProperty("--hero-stage-y", `${heroStageY}px`);
    root.style.setProperty("--intro-rise", `${introRise}px`);
    applyParallaxItems();
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
        parallaxItems: parallaxItems.length,
      };
    },
  };
}
