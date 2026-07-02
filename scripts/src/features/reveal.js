import { qsa } from "../core/dom.js";

const SCRAMBLE_CHARS = "АБВГҐДЕЄЖЗИІЇЙКЛМНОПРСТУФХЦЧШЩЬЮЯ0123456789";

function animateScrambleLine(line) {
  const finalText = line.dataset.scrambleFinal || line.textContent;
  const letters = Array.from(finalText);
  const totalFrames = Math.max(14, Math.min(26, letters.length + 8));
  let frame = 0;

  line.classList.add("is-scrambling");

  function renderFrame() {
    const progress = frame / totalFrames;
    const lockedCount = Math.floor(progress * letters.length);
    const output = letters
      .map((letter, index) => {
        if (letter === " ") return " ";
        if (index < lockedCount) return letter;
        return SCRAMBLE_CHARS[(frame + index * 7) % SCRAMBLE_CHARS.length];
      })
      .join("");

    line.textContent = output;
    frame += 1;

    if (frame <= totalFrames) {
      window.requestAnimationFrame(renderFrame);
      return;
    }

    line.textContent = finalText;
    line.classList.remove("is-scrambling");
    line.classList.add("is-scrambled");
  }

  renderFrame();
}

function initOpenLinesScramble({ prefersReducedMotion }) {
  const lines = qsa(".open-lines span");
  if (!lines.length) {
    return {
      enabled: false,
      lineCount: 0,
      reason: "missing-open-lines",
    };
  }

  lines.forEach((line) => {
    line.dataset.scrambleFinal = line.textContent.trim();
    line.dataset.scrambleDone = "false";
    if (!prefersReducedMotion) line.textContent = "";
  });

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    lines.forEach((line) => {
      line.textContent = line.dataset.scrambleFinal;
      line.dataset.scrambleDone = "true";
      line.classList.add("is-scrambled");
    });
    return {
      enabled: false,
      lineCount: lines.length,
      reason: prefersReducedMotion ? "reduced-motion" : "missing-intersection-observer",
    };
  }

  let completed = 0;
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const line = entry.target;
        if (line.dataset.scrambleDone === "true") return;
        line.dataset.scrambleDone = "true";
        window.setTimeout(() => animateScrambleLine(line), Number(line.dataset.scrambleIndex || 0) * 105);
        completed += 1;
        observer.unobserve(line);
      });
    },
    { threshold: 0.38 },
  );

  lines.forEach((line, index) => {
    line.dataset.scrambleIndex = `${index}`;
    observer.observe(line);
  });

  return {
    enabled: true,
    lineCount: lines.length,
    getState() {
      return {
        enabled: true,
        lineCount: lines.length,
        completed,
      };
    },
  };
}

export function initRevealCards({ prefersReducedMotion = false } = {}) {
  const cards = qsa(".reveal-card");
  const revealItems = qsa(
    ".section-heading, .mission-copy, .audience-copy, .gallery-copy, .gallery-card, .opens, .step-list li, .apply-copy, .membership-form, .section-transition-tiles",
  );
  revealItems.forEach((item, index) => {
    item.classList.add("scroll-reveal");
    if (!item.dataset.reveal) {
      if (item.classList.contains("gallery-card")) {
        item.dataset.reveal = "media-wipe";
      } else if (item.classList.contains("membership-form")) {
        item.dataset.reveal = "form-panel";
      } else if (item.classList.contains("section-transition-tiles")) {
        item.dataset.reveal = "tile-transition";
      } else if (item.matches(".step-list li, .section-heading")) {
        item.dataset.reveal = "card-tile";
      } else if (item.classList.contains("opens")) {
        item.dataset.reveal = "section-panel";
      } else {
        item.dataset.reveal = "line-mask";
      }
    }
    item.style.setProperty("--reveal-index", `${index % 6}`);
  });

  const allItems = [...cards, ...revealItems];
  cards.forEach((card, index) => {
    card.dataset.reveal = card.dataset.reveal || "card-tile";
    card.style.setProperty("--reveal-index", `${index % 4}`);
  });

  if (!("IntersectionObserver" in window)) {
    allItems.forEach((item) => item.classList.add("is-visible"));
    return {
      getState: () => ({
        enabled: false,
        cardCount: cards.length,
        revealCount: revealItems.length,
        reason: "missing-intersection-observer",
      }),
    };
  }

  let observedCount = allItems.length;
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
          observedCount -= 1;
        }
      });
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.16 },
  );

  allItems.forEach((item) => revealObserver.observe(item));

  const scramble = initOpenLinesScramble({ prefersReducedMotion });

  return {
    getState() {
      return {
        enabled: true,
        cardCount: cards.length,
        revealCount: revealItems.length,
        remaining: observedCount,
        scramble: typeof scramble.getState === "function" ? scramble.getState() : scramble,
      };
    },
  };
}
