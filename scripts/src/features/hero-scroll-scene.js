export function initHeroScrollScene() {
  return {
    getState() {
      return {
        enabled: false,
        reason: "scroll-animations-disabled",
      };
    },
  };
}
