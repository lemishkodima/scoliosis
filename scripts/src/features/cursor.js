import { qs, selectors } from "../core/dom.js";

export function initCursor({ prefersReducedMotion }) {
  const cursor = qs(selectors.cursor);
  const isFinePointer = window.matchMedia("(min-width: 981px) and (hover: hover) and (pointer: fine)").matches;
  if (!cursor || !isFinePointer || prefersReducedMotion) {
    return {
      getState: () => ({
        enabled: false,
        hasNode: Boolean(cursor),
        finePointer: isFinePointer,
        reducedMotion: prefersReducedMotion,
      }),
    };
  }

  const dot = cursor.querySelector(".cursor-dot");
  const ring = cursor.querySelector(".cursor-ring");
  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let ringX = targetX;
  let ringY = targetY;
  let dotX = targetX;
  let dotY = targetY;

  document.body.classList.add("has-custom-cursor");

  window.addEventListener(
    "pointermove",
    (event) => {
      targetX = event.clientX;
      targetY = event.clientY;
    },
    { passive: true },
  );

  window.addEventListener("pointerdown", () => cursor.classList.add("is-pressed"));
  window.addEventListener("pointerup", () => cursor.classList.remove("is-pressed"));

  document.addEventListener(
    "pointerover",
    (event) => {
      if (event.target.closest("a, button, input, textarea, select, label")) {
        cursor.classList.add("is-hovering");
      }
    },
    { passive: true },
  );

  document.addEventListener(
    "pointerout",
    (event) => {
      if (event.target.closest("a, button, input, textarea, select, label")) {
        cursor.classList.remove("is-hovering");
      }
    },
    { passive: true },
  );

  function renderCursor() {
    dotX += (targetX - dotX) * 0.52;
    dotY += (targetY - dotY) * 0.52;
    ringX += (targetX - ringX) * 0.16;
    ringY += (targetY - ringY) * 0.16;
    dot.style.transform = `translate(${dotX}px, ${dotY}px) translate(-50%, -50%)`;
    ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
    window.requestAnimationFrame(renderCursor);
  }

  renderCursor();

  return {
    getState() {
      return {
        enabled: true,
        hovering: cursor.classList.contains("is-hovering"),
        pressed: cursor.classList.contains("is-pressed"),
      };
    },
  };
}
