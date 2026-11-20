/**
 * Crystal Depth · Vico asset workbench (2026-11-20).
 * Uses the existing official 140-item catalog: no copies, no generated replacement,
 * no persistence, no network requests beyond normal asset image loading.
 */
(() => {
  const definitions = Object.freeze({
    "vico-home.webp": { purpose: "Presentación de Vecidya", placement: "Inicio · personaje separado", route: "/", role: "personaje", scene: "home-scene.webp", caution: "Revisión visual: restos de gradiente y franjas aparentes en el recorte. Revisar sobre claro y oscuro antes de publicar; dejar espacio para título y CTA." },
    "vico-vecindario.webp": { purpose: "Descubrir negocios", placement: "Vecindario y búsqueda", route: "/vecindario", role: "personaje", scene: "neighborhood-scene.webp", caution: "Ilustración con mapa y mini locales: evitar reducirla tanto que los detalles se conviertan en ruido; no superponer filtros." },
    "vico-diagnostico.webp": { purpose: "Orientar el diagnóstico", placement: "Diagnóstico público", route: "/diagnostico", role: "personaje", scene: "diagnostic-scene.webp", caution: "Revisión visual: bandas de fondo aparentes. No usar la pose como indicador de puntuación; comprobar halo y contraste antes de publicar." },
    "vico-servicios.webp": { purpose: "Explicar servicios", placement: "Servicios de Vecidya", route: "/servicios", role: "personaje", scene: "services-scene.webp", caution: "Mantener los servicios y sus acciones como HTML real." },
    "vico-licencias.webp": { purpose: "Acompañar la elección", placement: "Planes y licencias", route: "/licencias", role: "personaje", scene: "licenses-scene.webp", caution: "No sugerir que Vico activa derechos de un plan." },
    "vico-addons.webp": { purpose: "Presentar complementos", placement: "Complementos", route: "/addons", role: "personaje", scene: "addons-scene.webp", caution: "No presentar integraciones aún no activadas como operativas." },
    "vico-aprende.webp": { purpose: "Guiar el aprendizaje", placement: "Aprende", route: "/aprende", role: "personaje", scene: "learn-journey-scene.webp", caution: "Conservar Vico fuera de los párrafos de lectura prolongada." },
    "vico-contacto.webp": { purpose: "Dar la bienvenida", placement: "Contacto", route: "/contacto", role: "personaje", scene: "contact-scene.webp", caution: "No tapar el formulario ni el foco de teclado." },
    "vico-nosotros.webp": { purpose: "Presentar al equipo", placement: "Nosotros", route: "/sobre-nosotros", role: "personaje", scene: "about-scene.webp", caution: "No representar al personaje como un miembro humano del equipo." },
    "vico-unete.webp": { purpose: "Acompañar la incorporación", placement: "Únete", route: "/unete", role: "personaje", scene: "join-scene.webp", caution: "La ilustración no sustituye pasos, instrucciones ni confirmaciones reales." },
  });
  const $ = (id) => document.getElementById(id);
  const init = () => {
    const root = $("vico-workbench");
    const catalog = window.vecidyaCrystalCatalog;
    if (!root || !Array.isArray(catalog)) return;
    const entries = catalog.filter((asset) => asset.category === "Vico");
    const gallery = $("vico-workbench-gallery");
    const image = $("vico-workbench-image");
    const name = $("vico-workbench-name");
    const detail = $("vico-workbench-detail");
    const original = $("vico-workbench-original");
    const stage = $("vico-workbench-stage");
    const theme = $("vico-workbench-background");
    const position = $("vico-workbench-position");
    const size = $("vico-workbench-size");
    const sizeLabel = $("vico-workbench-size-value");
    const scene = $("vico-workbench-scene");
    const copy = $("vico-workbench-copy");
    const status = $("vico-workbench-status");
    if (![gallery,image,name,detail,original,stage,theme,position,size,sizeLabel,scene,copy,status].every(Boolean)) return;
    const normalized = (asset) => asset.source.split("/").pop();
    const safeEntries = entries.filter((asset) => Object.hasOwn(definitions, normalized(asset)));
    const missing = entries.filter((asset) => !Object.hasOwn(definitions, normalized(asset)));
    if (missing.length || safeEntries.length !== Object.keys(definitions).length) {
      status.textContent = "Revisa el registro: hay imágenes de Vico sin clasificación o una variante sin fuente en el catálogo.";
    }
    let selected = safeEntries[0] ?? null;
    // Derive from the catalog: the Cloudflare build rewrites original URLs in library-catalog.js.
    const sceneBase = safeEntries.length ? safeEntries[0].source.slice(0, safeEntries[0].source.lastIndexOf("/") + 1) : "";
    const buttons = safeEntries.map((asset) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "vico-workbench__item";
      button.setAttribute("aria-pressed", "false");
      button.setAttribute("aria-label", "Seleccionar " + asset.name);
      const thumb = document.createElement("img");
      thumb.src = asset.preview;
      thumb.alt = "";
      thumb.loading = "lazy";
      thumb.decoding = "async";
      const label = document.createElement("span");
      label.textContent = asset.name;
      button.append(thumb, label);
      button.addEventListener("click", () => { selected = asset; render(); });
      gallery.append(button);
      return button;
    });
    const render = () => {
      if (!selected) return;
      const rule = definitions[normalized(selected)];
      image.src = selected.source;
      image.alt = selected.name + ". Uso previsto: " + rule.placement + ".";
      image.width = selected.width;
      image.height = selected.height;
      name.textContent = selected.name;
      detail.textContent = rule.purpose + " · " + rule.placement + " · Original " +
        selected.format + " " + selected.width + " × " + selected.height + " px. " + rule.caution;
      original.href = selected.source;
      original.textContent = "Abrir imagen original";
      stage.dataset.background = theme.value;
      stage.dataset.position = position.value;
      stage.style.setProperty("--vico-scale", String(Number(size.value) / 100));
      sizeLabel.textContent = size.value + " %";
      // URLs in CSS custom properties are resolved relative to the consuming stylesheet.
      // Emit an absolute URL so both repository preview and packaged Cloudflare work.
      const sceneUrl = new URL(sceneBase + rule.scene, document.baseURI).href;
      stage.style.setProperty("--vico-stage-scene", scene.checked ? 'url("' + sceneUrl + '")' : "none");
      stage.dataset.scene = scene.checked ? "on" : "off";
      buttons.forEach((button, index) => button.setAttribute("aria-pressed", String(safeEntries[index] === selected)));
    };
    for (const control of [theme, position, size, scene]) control.addEventListener("input", render);
    copy.addEventListener("click", async () => {
      if (!selected) return;
      const rule = definitions[normalized(selected)];
      const brief = JSON.stringify({
        schema: "vecidya-vico-visual-brief-v1",
        asset: selected.source,
        preview: selected.preview,
        originalPixels: [selected.width, selected.height],
        role: rule.role,
        placement: rule.placement,
        route: rule.route,
        scene: scene.checked ? sceneBase + rule.scene : null,
        stageBackground: theme.value,
        position: position.value,
        scalePercent: Number(size.value),
        caution: rule.caution,
        status: "visual-review-only-not-a-route-or-design-api",
      }, null, 2);
      try {
        if (!navigator.clipboard?.writeText) throw Error("clipboard not available");
        await navigator.clipboard.writeText(brief);
        status.textContent = "Ficha de Vico copiada para revisión del agente. No se ha cambiado la plataforma.";
      } catch {
        status.textContent = "La copia no está disponible en este navegador. Abre la imagen original y consulta la ficha visible.";
      }
    });
    root.dataset.ready = "true";
    gallery.setAttribute("aria-busy", "false");
    render();
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
