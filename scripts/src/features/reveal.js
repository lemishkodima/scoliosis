export function initRevealCards() {
  return {
    getState() {
      return {
        enabled: false,
        reason: "scroll-animations-disabled",
      };
    },
  };
}
