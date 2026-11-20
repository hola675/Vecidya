/* Vecidya Crystal Depth · Motion Grammar R1.1 · Laboratorio aislado.
   Enhancements are optional; all content is visible if JS is missing. */
(() => {
  const init = () => {
    const root = document.documentElement;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const revealTargets = [...document.querySelectorAll("main.page > section:not(.hero)")];
    const stage = document.querySelector("#motion-stage");
    const play = document.querySelector("#motion-play");
    const replay = document.querySelector("#motion-replay");
    const strength = document.querySelector("#motion-intensity");
    const message = document.querySelector("#motion-message");
    let revealObserver = null;
    let paused = false;

    const setMessage = (value) => { if (message) message.textContent = value; };
    const setPlayback = (isPaused) => {
      paused = isPaused;
      root.dataset.motionPlay = paused ? "paused" : "playing";
      if (play) {
        play.setAttribute("aria-pressed", String(paused));
        play.textContent = paused ? "Reanudar animación" : "Pausar animación";
      }
    };
    const applyPreference = () => {
      const enabled = !preference.matches && "IntersectionObserver" in window;
      if (revealObserver) {
        revealObserver.disconnect();
        revealObserver = null;
      }
      revealTargets.forEach((element) => {
        element.classList.add("vx-motion-reveal");
        if (!enabled) element.classList.add("is-in-view");
      });
      if (enabled) {
        revealObserver = new IntersectionObserver((entries, observer) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            entry.target.classList.add("is-in-view");
            observer.unobserve(entry.target);
          }
        }, { rootMargin: "0px 0px -35px 0px", threshold: 0.04 });
        for (const target of revealTargets) {
          if (!target.classList.contains("is-in-view")) revealObserver.observe(target);
        }
      }
      root.dataset.motion = enabled ? "enhanced" : "static";
      if (stage) stage.classList.toggle("is-playing", enabled);
      if (play) play.disabled = !enabled;
      if (replay) replay.disabled = !enabled;
      setPlayback(false);
      setMessage(preference.matches
        ? "El sistema detectó movimiento reducido. La interfaz conserva toda la información sin animaciones."
        : enabled
          ? "Movimiento activo solo en escenas y transiciones breves; el contenido sigue siendo accesible."
          : "Animación opcional no disponible en este navegador. Todo el contenido permanece visible.");
    };

    if (strength) strength.addEventListener("change", () => {
      root.dataset.motionIntensity = strength.value === "subtle" ? "subtle" : "standard";
      setMessage(root.dataset.motionIntensity === "subtle"
        ? "Intensidad discreta: menor desplazamiento y escenas más lentas."
        : "Intensidad estándar: profundidad moderada y entradas breves.");
    });
    if (play) play.addEventListener("click", () => {
      if (play.disabled) return;
      setPlayback(!paused);
      setMessage(paused ? "Animaciones ambientales pausadas." : "Animaciones ambientales reanudadas.");
    });
    if (replay) replay.addEventListener("click", () => {
      if (replay.disabled || !stage) return;
      stage.classList.remove("is-playing");
      // Reflow only the decorative demo; no layout-dependent animation of content.
      void stage.offsetWidth;
      stage.classList.add("is-playing");
      setPlayback(false);
      setMessage("Escena de ejemplo reiniciada. Los datos y la navegación no se modificaron.");
    });

    root.dataset.motionIntensity = strength?.value === "subtle" ? "subtle" : "standard";
    if (typeof preference.addEventListener === "function") {
      preference.addEventListener("change", applyPreference);
    } else if (typeof preference.addListener === "function") {
      preference.addListener(applyPreference);
    }
    applyPreference();
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
