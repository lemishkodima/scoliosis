import { qsa } from "../core/dom.js";

const REVEAL_SELECTOR = [
  ".section-heading",
  ".gallery-copy",
  ".reveal-card",
  ".gallery-card",
  ".audience-copy",
  ".mission-media",
  ".mission-copy",
  ".check-list li",
  ".apply-copy",
  ".membership-form",
].join(",");

const SCRAMBLE_CHARS = "АБВГҐДЕЄЖЗИІЇЙКЛМНОПРСТУФХЦЧШЩЬЮЯABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const OPEN_LINES_SELECTOR = ".open-lines";
const OPEN_LINE_SELECTOR = `${OPEN_LINES_SELECTOR} span`;

function getRandomChar() {
  return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
}

function shouldKeepChar(char) {
  return /\s|[.,!?:;—–-]/u.test(char);
}

function scrambleLine(line, delay) {
  if (line.dataset.scrambleDone === "true") return;
  line.dataset.scrambleDone = "true";

  const finalText = line.textContent.trim();
  const chars = Array.from(finalText);
  const totalFrames = 14;
  let frame = 0;

  window.setTimeout(() => {
    line.classList.add("is-scrambling");

    const interval = window.setInterval(() => {
      const progress = frame / totalFrames;
      line.textContent = chars
        .map((char, index) => {
          if (shouldKeepChar(char)) return char;
          const lockPoint = index / Math.max(chars.length, 1);
          return progress > lockPoint + 0.2 ? char : getRandomChar();
        })
        .join("");

      frame += 1;

      if (frame > totalFrames) {
        window.clearInterval(interval);
        line.textContent = finalText;
        line.classList.remove("is-scrambling");
        line.classList.add("is-scrambled");
      }
    }, 24);
  }, delay);
}

function initOpenLinesScramble({ prefersReducedMotion }) {
  const openLines = document.querySelector(OPEN_LINES_SELECTOR);
  const lines = qsa(OPEN_LINE_SELECTOR);

  if (!openLines || lines.length === 0 || prefersReducedMotion) {
    lines.forEach((line) => line.classList.add("is-scrambled"));
    return false;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        lines.forEach((line, index) => scrambleLine(line, index * 58));
        observer.disconnect();
      });
    },
    {
      root: null,
      rootMargin: "0px 0px -18% 0px",
      threshold: 0.28,
    },
  );

  observer.observe(openLines);
  return true;
}

export function initReveal({ prefersReducedMotion }) {
  const items = qsa(REVEAL_SELECTOR);
  const scrambleEnabled = initOpenLinesScramble({ prefersReducedMotion });

  if (items.length === 0 || prefersReducedMotion) {
    items.forEach((item) => item.classList.add("is-visible"));
    return {
      enabled: false,
      count: items.length,
      scrambleEnabled,
    };
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      root: null,
      rootMargin: "0px 0px -12% 0px",
      threshold: 0.14,
    },
  );

  items.forEach((item) => {
    item.classList.add("is-reveal-ready");
    observer.observe(item);
  });

  return {
    enabled: true,
    count: items.length,
    scrambleEnabled,
  };
}
