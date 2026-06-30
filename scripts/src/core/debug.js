export function exposeDebugApi(systems) {
  document.documentElement.dataset.debugApi = "ready";
  window.scoliosisDebug = {
    version: "prototype-structure-1",
    systems,
    inspect() {
      return Object.fromEntries(
        Object.entries(systems).map(([name, system]) => [
          name,
          typeof system?.getState === "function" ? system.getState() : system,
        ]),
      );
    },
  };
}
