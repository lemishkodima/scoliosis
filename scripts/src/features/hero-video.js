export function initHeroVideoLoopFade({ prefersReducedMotion }) {
  const heroVideo = document.querySelector(".hero-video");
  const heroVideoStage = heroVideo?.closest(".hero-video-stage");
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

  heroVideo.addEventListener("timeupdate", updateFadeState);
  heroVideo.addEventListener("seeking", () => setFading(false));
  heroVideo.addEventListener("seeked", updateFadeState);
  heroVideo.addEventListener("playing", updateFadeState);
  heroVideo.addEventListener("ended", () => setFading(false));

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
