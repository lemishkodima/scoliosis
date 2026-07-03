const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

function getMaxScroll() {
  return Math.max(document.documentElement.scrollHeight - window.innerHeight, 0);
}

function getWheelDelta(event) {
  if (event.deltaMode === 1) return event.deltaY * 18;
  if (event.deltaMode === 2) return event.deltaY * window.innerHeight;
  return event.deltaY;
}

function hasScrollableParent(target, deltaY) {
  let node = target instanceof Element ? target : null;

  while (node && node !== document.body && node !== document.documentElement) {
    const style = window.getComputedStyle(node);
    const canScroll = /(auto|scroll)/.test(style.overflowY) && node.scrollHeight > node.clientHeight;

    if (canScroll) {
      const atTop = node.scrollTop <= 0;
      const atBottom = node.scrollTop + node.clientHeight >= node.scrollHeight - 1;
      if ((deltaY < 0 && !atTop) || (deltaY > 0 && !atBottom)) return true;
    }

    node = node.parentElement;
  }

  return false;
}

export function initSmoothScroll({ prefersReducedMotion }) {
  const isFinePointer = window.matchMedia("(min-width: 981px) and (hover: hover) and (pointer: fine)").matches;

  if (prefersReducedMotion || !isFinePointer) {
    return {
      scrollTo: (value) => window.scrollTo({ top: value, behavior: "smooth" }),
      getState: () => ({
        enabled: false,
        finePointer: isFinePointer,
        reducedMotion: prefersReducedMotion,
      }),
    };
  }

  let current = window.scrollY;
  let target = current;
  let frame = 0;
  let programmaticUntil = 0;
  const ease = 0.115;

  document.documentElement.classList.add("is-smooth-scrolling");
  document.body.classList.add("has-smooth-scroll");

  function setTarget(nextTarget) {
    target = clamp(nextTarget, 0, getMaxScroll());
    if (!frame) frame = window.requestAnimationFrame(render);
  }

  function render() {
    const distance = target - current;
    current += distance * ease;

    if (Math.abs(distance) < 0.35) {
      current = target;
      frame = 0;
    } else {
      frame = window.requestAnimationFrame(render);
    }

    programmaticUntil = window.performance.now() + 120;
    window.scrollTo(0, current);
  }

  function scrollToTarget(nextTarget) {
    current = window.scrollY;
    setTarget(nextTarget);
  }

  function onWheel(event) {
    if (event.ctrlKey || event.metaKey) return;

    const delta = getWheelDelta(event);
    if (hasScrollableParent(event.target, delta)) return;

    event.preventDefault();
    setTarget(target + delta * 1.02);
  }

  function onScroll() {
    if (window.performance.now() < programmaticUntil) return;
    current = window.scrollY;
    target = current;
  }

  function onResize() {
    setTarget(clamp(target, 0, getMaxScroll()));
  }

  function onAnchorClick(event) {
    const link = event.target instanceof Element ? event.target.closest('a[href^="#"]') : null;
    if (!link) return;

    const hash = link.getAttribute("href");
    if (!hash || hash === "#") return;

    const destination = document.querySelector(hash);
    if (!destination) return;

    event.preventDefault();
    const offset = Number.parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
    const top = destination.getBoundingClientRect().top + window.scrollY - offset;
    scrollToTarget(top);
    history.pushState(null, "", hash);
  }

  window.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onResize);
  document.addEventListener("click", onAnchorClick);

  return {
    scrollTo: scrollToTarget,
    getState() {
      return {
        current: Math.round(current),
        enabled: true,
        target: Math.round(target),
      };
    },
  };
}
