function getScrollableParent(target) {
  let element = target;
  while (element && element !== document.body && element !== document.documentElement) {
    const style = window.getComputedStyle(element);
    const canScroll = /(auto|scroll)/.test(style.overflowY) && element.scrollHeight > element.clientHeight;
    if (canScroll) return element;
    element = element.parentElement;
  }
  return null;
}

export function initSmoothScroll({ prefersReducedMotion }) {
  const supportsFinePointer = window.matchMedia("(min-width: 981px) and (hover: hover) and (pointer: fine)").matches;
  if (prefersReducedMotion || !supportsFinePointer) {
    return {
      enabled: false,
      reason: prefersReducedMotion ? "reduced-motion" : "non-desktop-pointer",
    };
  }

  let currentY = window.scrollY;
  let targetY = currentY;
  let frameId = 0;
  let isAnimating = false;

  function getMaxScroll() {
    return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  }

  function clampTarget(value) {
    return Math.max(0, Math.min(getMaxScroll(), value));
  }

  function animateScroll() {
    frameId = 0;
    isAnimating = true;
    currentY += (targetY - currentY) * 0.16;

    if (Math.abs(targetY - currentY) < 0.6) {
      currentY = targetY;
      isAnimating = false;
    }

    window.scrollTo(0, currentY);

    if (isAnimating) {
      frameId = window.requestAnimationFrame(animateScroll);
    }
  }

  function requestSmoothScroll() {
    if (!frameId) frameId = window.requestAnimationFrame(animateScroll);
  }

  function handleWheel(event) {
    if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey || getScrollableParent(event.target)) {
      return;
    }

    event.preventDefault();
    currentY = isAnimating ? currentY : window.scrollY;
    targetY = clampTarget(targetY + event.deltaY);
    requestSmoothScroll();
  }

  function syncNativeScroll() {
    if (isAnimating) return;
    currentY = window.scrollY;
    targetY = currentY;
  }

  function handleResize() {
    targetY = clampTarget(targetY);
  }

  window.addEventListener("wheel", handleWheel, { passive: false });
  window.addEventListener("scroll", syncNativeScroll, { passive: true });
  window.addEventListener("resize", handleResize, { passive: true });

  return {
    enabled: true,
    getState() {
      return {
        enabled: true,
        currentY: Math.round(currentY),
        targetY: Math.round(targetY),
        animating: isAnimating,
      };
    },
  };
}
