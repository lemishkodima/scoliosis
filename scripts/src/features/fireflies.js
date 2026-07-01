import { qsa } from "../core/dom.js";

const PARTICLE_SELECTOR = ".firefly-particles i";

function readNumber(value, fallback) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function initFireflies({ prefersReducedMotion }) {
  const particles = qsa(PARTICLE_SELECTOR);
  if (!particles.length) {
    return {
      getState() {
        return {
          enabled: false,
          particleCount: 0,
          reason: "missing-particles",
        };
      },
    };
  }

  const motionScale = prefersReducedMotion ? 0.42 : 1;
  const particleState = particles.map((particle, index) => {
    const styles = getComputedStyle(particle);
    const speed = 0.00012 + ((index % 5) + 1) * 0.000035;

    particle.classList.add("is-js-driven");

    return {
      particle,
      baseOpacity: readNumber(styles.getPropertyValue("--o"), 0.54),
      driftX: readNumber(styles.getPropertyValue("--jx"), 12 + (index % 4) * 5) * motionScale,
      driftY: readNumber(styles.getPropertyValue("--jy"), 10 + (index % 3) * 6) * motionScale,
      phaseA: index * 1.73,
      phaseB: index * 2.41,
      pulseSpeed: speed * (2.2 + (index % 4) * 0.4),
      speed,
    };
  });

  let frameId = 0;
  let isRunning = true;

  function tick(time) {
    particleState.forEach((item) => {
      const x = Math.sin(time * item.speed + item.phaseA) * item.driftX;
      const y = Math.cos(time * item.speed * 1.37 + item.phaseB) * item.driftY;
      const wobble = Math.sin(time * item.speed * 2.15 + item.phaseB) * item.driftX * 0.34;
      const scale = 0.82 + Math.sin(time * item.pulseSpeed + item.phaseA) * 0.22;
      const opacity = Math.max(0.18, item.baseOpacity * (0.62 + Math.cos(time * item.pulseSpeed + item.phaseB) * 0.24));

      item.particle.style.opacity = opacity.toFixed(3);
      item.particle.style.transform = `translate3d(${(x + wobble).toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${scale.toFixed(3)})`;
    });

    frameId = window.requestAnimationFrame(tick);
  }

  frameId = window.requestAnimationFrame(tick);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && frameId) {
      window.cancelAnimationFrame(frameId);
      frameId = 0;
      isRunning = false;
      return;
    }

    if (!document.hidden && !frameId) {
      isRunning = true;
      frameId = window.requestAnimationFrame(tick);
    }
  });

  return {
    getState() {
      return {
        enabled: true,
        jsDriven: true,
        particleCount: particles.length,
        reducedMotion: prefersReducedMotion,
        running: isRunning,
      };
    },
  };
}
