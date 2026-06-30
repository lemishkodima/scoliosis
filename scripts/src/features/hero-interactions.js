import { qs, selectors } from "../core/dom.js";

function initLogoTilt({ prefersReducedMotion }) {
  const visual = qs(selectors.visual);
  const logoStage = qs(selectors.logoStage);
  if (!visual || !logoStage || prefersReducedMotion) return false;

  visual.addEventListener("pointermove", (event) => {
    const rect = visual.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    logoStage.style.transform = `rotateY(${x * 18}deg) rotateX(${-y * 16}deg) translate3d(${x * 18}px, ${y * 12}px, 0)`;
  });

  visual.addEventListener("pointerleave", () => {
    logoStage.style.transform = "rotateY(0deg) rotateX(0deg) translate3d(0, 0, 0)";
  });

  return true;
}

function initHeroCanvas({ prefersReducedMotion }) {
  const canvas = qs(selectors.canvas);
  if (!canvas || prefersReducedMotion) return false;

  const context = canvas.getContext("2d");
  const particles = Array.from({ length: 68 }, () => ({
    angle: Math.random() * Math.PI * 2,
    radius: 0.18 + Math.random() * 0.42,
    speed: 0.001 + Math.random() * 0.002,
    size: 1 + Math.random() * 2.2,
    depth: 0.35 + Math.random() * 0.75,
  }));

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function draw() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const centerX = width / 2;
    const centerY = height / 2;
    const orbit = Math.min(width, height) * 0.48;

    context.clearRect(0, 0, width, height);
    context.lineWidth = 1;

    particles.forEach((particle, index) => {
      particle.angle += particle.speed;
      const x = centerX + Math.cos(particle.angle) * orbit * particle.radius;
      const y = centerY + Math.sin(particle.angle * 1.18) * orbit * particle.radius * 0.78;
      const alpha = 0.2 + particle.depth * 0.45;

      context.beginPath();
      context.arc(x, y, particle.size * particle.depth, 0, Math.PI * 2);
      context.fillStyle = `rgba(81, 91, 171, ${alpha})`;
      context.fill();

      const next = particles[(index + 7) % particles.length];
      const nx = centerX + Math.cos(next.angle) * orbit * next.radius;
      const ny = centerY + Math.sin(next.angle * 1.18) * orbit * next.radius * 0.78;
      const distance = Math.hypot(nx - x, ny - y);

      if (distance < 150) {
        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(nx, ny);
        context.strokeStyle = `rgba(162, 180, 226, ${0.22 - distance / 800})`;
        context.stroke();
      }
    });

    requestAnimationFrame(draw);
  }

  resize();
  draw();
  window.addEventListener("resize", resize);
  return true;
}

export function initHeroInteractions({ prefersReducedMotion }) {
  const tiltEnabled = initLogoTilt({ prefersReducedMotion });
  const canvasEnabled = initHeroCanvas({ prefersReducedMotion });

  return {
    getState() {
      return {
        canvasEnabled,
        reducedMotion: prefersReducedMotion,
        tiltEnabled,
      };
    },
  };
}
