import { qs } from "../core/dom.js";

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function lerp(from, to, progress) {
  return from + (to - from) * progress;
}

function getTitleDrop() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  if (width < 680) return clamp(height * 0.4, 260, 360);
  if (width < 980) return clamp(height * 0.2, 116, 210);
  return clamp(height * 0.22, 148, 270);
}

function getGroupDrop() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  if (width < 680) return clamp(height * 0.12, 74, 126);
  if (width < 980) return clamp(height * 0.1, 72, 120);
  return clamp(height * 0.09, 68, 128);
}

function getDockFollowDrop(titleDrop) {
  const width = window.innerWidth;
  if (width < 680) return titleDrop * 0.52;
  if (width < 980) return titleDrop * 0.22;
  return 0;
}

export function initHeroScrollScene({ prefersReducedMotion = false } = {}) {
  const scene = qs("[data-hero-scene]");
  const intro = qs("[data-hero-intro]");

  if (!scene || prefersReducedMotion) {
    scene?.style.setProperty("--hero-progress", "0");
    scene?.style.setProperty("--hero-title-y", "0px");
    scene?.style.setProperty("--hero-dock-y", "0px");
    scene?.style.setProperty("--hero-group-y", "0px");
    scene?.style.setProperty("--hero-video-scale", "1.015");
    intro?.style.setProperty("--intro-lift", "0px");
    return {
      getState: () => ({
        enabled: false,
        reason: !scene ? "missing-hero-scene" : "reduced-motion",
      }),
    };
  }

  let rafId = 0;
  let lastProgress = -1;
  let titleDrop = getTitleDrop();
  let groupDrop = getGroupDrop();
  let dockFollowDrop = getDockFollowDrop(titleDrop);

  function updateMeasurements() {
    titleDrop = getTitleDrop();
    groupDrop = getGroupDrop();
    dockFollowDrop = getDockFollowDrop(titleDrop);
  }

  function render() {
    rafId = 0;
    const rect = scene.getBoundingClientRect();
    const range = Math.max(1, rect.height - window.innerHeight);
    const progress = clamp((rect.top * -1) / range, 0, 1);

    if (Math.abs(progress - lastProgress) < 0.001) return;
    lastProgress = progress;

    const titleMeetProgress = 0.42;
    const groupStart = 0.42;
    const groupEnd = 0.82;
    const titleEase = clamp(progress / titleMeetProgress, 0, 1);
    const groupEase = clamp((progress - groupStart) / (groupEnd - groupStart), 0, 1);
    const dockFollowEase = clamp((progress - 0.62) / 0.38, 0, 1);
    const titleY = lerp(0, titleDrop, titleEase);
    const groupY = lerp(0, groupDrop, groupEase);
    const dockY = lerp(0, dockFollowDrop, dockFollowEase);
    const videoScale = lerp(1.015, 1.045, progress);
    const introLift = progress > 0.68 ? lerp(0, -86, clamp((progress - 0.68) / 0.32, 0, 1)) : 0;

    scene.style.setProperty("--hero-progress", progress.toFixed(4));
    scene.style.setProperty("--hero-title-y", `${titleY.toFixed(2)}px`);
    scene.style.setProperty("--hero-dock-y", `${dockY.toFixed(2)}px`);
    scene.style.setProperty("--hero-group-y", `${groupY.toFixed(2)}px`);
    scene.style.setProperty("--hero-video-scale", videoScale.toFixed(4));
    intro?.style.setProperty("--intro-lift", `${introLift.toFixed(2)}px`);
  }

  function requestRender() {
    if (rafId) return;
    rafId = window.requestAnimationFrame(render);
  }

  updateMeasurements();
  render();
  window.addEventListener("scroll", requestRender, { passive: true });
  window.addEventListener(
    "resize",
    () => {
      updateMeasurements();
      requestRender();
    },
    { passive: true },
  );

  return {
    getState() {
      return {
        enabled: true,
        dockFollowDrop,
        progress: lastProgress,
        groupDrop,
        titleDrop,
      };
    },
  };
}
