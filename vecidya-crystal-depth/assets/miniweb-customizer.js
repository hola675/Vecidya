/* Crystal Depth R1.6 · MiniWeb design laboratory.
 * Preview only: no account, entitlement, storage, publishing or network calls.
 * Generated configuration is a visual brief, NOT a renderer API contract. */
(() => {
  const palette = Object.freeze({
    oceano: { primary: "#154B85", accent: "#F6A344", canvas: "#F2F7FC", ink: "#112D4C" },
    bosque: { primary: "#236354", accent: "#C99748", canvas: "#F1F6EF", ink: "#19392F" },
    coral: { primary: "#9B473D", accent: "#F5BE71", canvas: "#FFF4EC", ink: "#422523" },
    ciruela: { primary: "#644A85", accent: "#DBB37B", canvas: "#F8F3FB", ink: "#30213E" }
  });
  const fonts = Object.freeze({
    moderna: 'system-ui, -apple-system, "Segoe UI", sans-serif',
    editorial: 'Georgia, "Times New Roman", serif',
    cercana: '"Trebuchet MS", "Segoe UI", sans-serif'
  });
  const defaults = Object.freeze({
    tier: "base", palette: "oceano", primaryColor: "#154B85", accentColor: "#F6A344", canvasColor: "#F2F7FC", font: "moderna", layout: "split",
    align: "left", heroPosition: "right", titleSize: 40, bodySize: 16,
    spacing: 24, radius: 20, heroHeight: 330
  });
  const allowed = Object.freeze({
    tier: ["base", "pro", "premium"], palette: Object.keys(palette),
    font: Object.keys(fonts), layout: ["split", "stacked"], align: ["left", "center"],
    heroPosition: ["left", "right"]
  });
  const colors = ["primaryColor", "accentColor", "canvasColor"];
  const isColor = (value) => /^#[0-9a-fA-F]{6}$/.test(value);
  const numeric = Object.freeze({
    titleSize: [26, 60], bodySize: [14, 20],
    spacing: [12, 42], radius: [0, 34], heroHeight: [260, 480]
  });
  const luminance = (hex) => {
    const channels = [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16) / 255);
    const linear = channels.map((v) => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4);
    return linear[0] * .2126 + linear[1] * .7152 + linear[2] * .0722;
  };
  const contrast = (a, b) => {
    const x = luminance(a), y = luminance(b);
    return (Math.max(x, y) + .05) / (Math.min(x, y) + .05);
  };
  const tierText = Object.freeze({
    base: "Cuadra · Presencia profesional completa",
    pro: "Barrio · Composición editorial orientada a consultas",
    premium: "Ciudad · Narrativa inmersiva por servicios"
  });
  const $ = (id) => document.getElementById(id);
  const init = () => {
    const root = $("miniweb-customizer");
    const preview = $("miniweb-custom-preview");
    const status = $("miniweb-custom-status");
    const reset = $("miniweb-custom-reset");
    const copy = $("miniweb-custom-copy");
    if (!root || !preview || !status || !reset || !copy) return;
    const controls = [...root.querySelectorAll("[data-mw-field]")];
    const read = () => {
      const state = { ...defaults };
      for (const control of controls) {
        const key = control.dataset.mwField;
        if (!(key in state)) continue;
        const value = control.value;
        if (colors.includes(key) && isColor(value)) {
          state[key] = value;
        } else if (Object.prototype.hasOwnProperty.call(numeric, key)) {
          const number = Number(value);
          const [min, max] = numeric[key];
          if (Number.isFinite(number)) state[key] = Math.max(min, Math.min(max, number));
        } else if (allowed[key]?.includes(value)) {
          state[key] = value;
        }
      }
      return state;
    };
    const paint = (announce = false) => {
      const state = read();
      const ink = palette[state.palette].ink;
      preview.style.setProperty("--mw-primary", state.primaryColor);
      preview.style.setProperty("--mw-accent", state.accentColor);
      preview.style.setProperty("--mw-canvas", state.canvasColor);
      preview.style.setProperty("--mw-ink", ink);
      preview.style.setProperty("--mw-font", fonts[state.font]);
      preview.style.setProperty("--mw-title-size", state.titleSize + "px");
      preview.style.setProperty("--mw-body-size", state.bodySize + "px");
      preview.style.setProperty("--mw-spacing", state.spacing + "px");
      preview.style.setProperty("--mw-radius", state.radius + "px");
      preview.style.setProperty("--mw-hero-height", state.heroHeight + "px");
      preview.dataset.tier = state.tier;
      preview.dataset.layout = state.layout;
      preview.dataset.align = state.align;
      preview.dataset.imagePosition = state.heroPosition;
      $("miniweb-custom-tier-note").textContent = tierText[state.tier];
      for (const key of Object.keys(numeric)) {
        const label = $("miniweb-custom-" + key + "-value");
        if (label) label.textContent = state[key] + " px";
      }
      const lowContrast = contrast(ink, state.canvasColor) < 4.5 || contrast("#FFFFFF", state.primaryColor) < 4.5;
      if (lowContrast) status.textContent = "Atención: la combinación de colores podría tener contraste insuficiente (menos de 4,5:1). Ajusta la paleta antes de implementarla.";
      else if (announce) status.textContent = "Vista previa actualizada. Los cambios no se guardan ni modifican una MiniWeb real.";
      return state;
    };
    for (const control of controls) {
      if (control.dataset.mwField === "palette") control.addEventListener("change", () => {
        const next = palette[control.value];
        if (!next) return;
        $("miniweb-custom-primaryColor").value = next.primary;
        $("miniweb-custom-accentColor").value = next.accent;
        $("miniweb-custom-canvasColor").value = next.canvas;
      });
      control.addEventListener("input", () => paint(false));
      control.addEventListener("change", () => paint(true));
    }
    reset.addEventListener("click", () => {
      for (const control of controls) {
        const key = control.dataset.mwField;
        if (key in defaults) control.value = String(defaults[key]);
      }
      paint(true);
      status.textContent = "Valores predeterminados restaurados en esta vista de demostración.";
    });
    copy.addEventListener("click", async () => {
      const design = paint(false);
      const brief = JSON.stringify({
        schema: "vecidya-crystal-miniweb-visual-brief-v1",
        scope: "concept-only-not-a-product-configuration",
        ...design,
        note: "Propuesta visual para revisión humana; no concede licencias ni publica páginas."
      }, null, 2);
      try {
        if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
        await navigator.clipboard.writeText(brief);
        status.textContent = "Propuesta visual copiada. Revísala antes de entregarla a un agente.";
      } catch {
        status.textContent = "No fue posible copiar automáticamente. Usa un navegador seguro o transcribe los valores visibles.";
      }
    });
    root.dataset.ready = "true";
    paint(false);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
