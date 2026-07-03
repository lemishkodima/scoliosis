export function initHeroVideoLoopFade({ prefersReducedMotion }) {
  const heroVideo = document.querySelector(".hero-video");
  const heroVideoStage = heroVideo?.closest(".hero-video-stage");
  const root = document.documentElement;
  const isTouchViewport = window.matchMedia("(max-width: 980px), (hover: none), (pointer: coarse)").matches;

  function lockMobileHeroViewportHeight() {
    if (!isTouchViewport) return;
    const height = Math.round(window.innerHeight || window.visualViewport?.height || 0);
    if (height > 0) root.style.setProperty("--stable-hero-height", `${height}px`);
  }

  lockMobileHeroViewportHeight();

  if (isTouchViewport) {
    let lastWidth = Math.round(window.innerWidth || 0);
    const updateOnWidthChange = () => {
      const nextWidth = Math.round(window.innerWidth || 0);
      if (Math.abs(nextWidth - lastWidth) < 24) return;
      lastWidth = nextWidth;
      lockMobileHeroViewportHeight();
    };

    window.addEventListener("orientationchange", () => window.setTimeout(lockMobileHeroViewportHeight, 260));
    window.visualViewport?.addEventListener("resize", updateOnWidthChange, { passive: true });
    window.addEventListener("resize", updateOnWidthChange, { passive: true });
  }

  if (!heroVideo || !heroVideoStage || prefersReducedMotion) {
    return {
      getState: () => ({
        enabled: false,
        hasVideo: Boolean(heroVideo),
        hasStage: Boolean(heroVideoStage),
        reducedMotion: prefersReducedMotion,
      }),
    };
  }

  const fadeWindowSeconds = 0.85;
  let isFading = false;
  let interactionBound = false;

  heroVideo.muted = true;
  heroVideo.defaultMuted = true;
  heroVideo.playsInline = true;
  heroVideo.setAttribute("muted", "");
  heroVideo.setAttribute("playsinline", "");
  heroVideo.setAttribute("webkit-playsinline", "");

  function setFading(nextState) {
    if (isFading === nextState) return;
    isFading = nextState;
    heroVideoStage.classList.toggle("is-loop-fading", isFading);
  }

  function updateFadeState() {
    if (!Number.isFinite(heroVideo.duration) || heroVideo.duration <= fadeWindowSeconds) return;

    const remaining = heroVideo.duration - heroVideo.currentTime;
    setFading(remaining <= fadeWindowSeconds && heroVideo.currentTime > 0.35);
  }

  function attemptPlay() {
    const playRequest = heroVideo.play();
    if (playRequest?.catch) {
      playRequest.catch(() => {
        if (interactionBound) return;
        interactionBound = true;
        const unlock = () => {
          heroVideo.play().catch(() => {});
          window.removeEventListener("touchstart", unlock);
          window.removeEventListener("pointerdown", unlock);
        };
        window.addEventListener("touchstart", unlock, { once: true, passive: true });
        window.addEventListener("pointerdown", unlock, { once: true, passive: true });
      });
    }
  }

  heroVideo.addEventListener("timeupdate", updateFadeState);
  heroVideo.addEventListener("seeking", () => setFading(false));
  heroVideo.addEventListener("seeked", updateFadeState);
  heroVideo.addEventListener("playing", updateFadeState);
  heroVideo.addEventListener("ended", () => setFading(false));
  window.addEventListener("pageshow", attemptPlay);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) attemptPlay();
  });

  attemptPlay();

  return {
    getState() {
      return {
        enabled: true,
        currentTime: Number(heroVideo.currentTime.toFixed(2)),
        duration: Number.isFinite(heroVideo.duration) ? Number(heroVideo.duration.toFixed(2)) : null,
        fading: isFading,
        paused: heroVideo.paused,
      };
    },
  };
}
