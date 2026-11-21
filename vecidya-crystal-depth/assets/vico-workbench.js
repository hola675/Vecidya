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
  // Image analysis on a bounded canvas (max 512 px) to avoid blocking the UI.
  // The pixels are never uploaded or changed in the original source.
  const inspectAlpha = async (src, { maskCanvas = null } = {}) => {
    const source = new Image();
    source.decoding = "async";
    source.src = src;
    await source.decode();
    const factor = Math.min(1, 512 / Math.max(source.naturalWidth, source.naturalHeight));
    const width = Math.max(1, Math.round(source.naturalWidth * factor));
    const height = Math.max(1, Math.round(source.naturalHeight * factor));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) throw new Error("Este navegador no permite analizar la máscara.");
    context.drawImage(source, 0, 0, width, height);
    const { data } = context.getImageData(0, 0, width, height);
    const bands = { transparent: 0, almostTransparent: 0, softEdges: 0, nearlyOpaque: 0, opaque: 0 };
    const border = { width: Math.max(1, Math.round(width * .04)), height: Math.max(1, Math.round(height * .04)), pixels: 0, visible: 0, opaque: 0 };
    const bbox = { x0: width, y0: height, x1: -1, y1: -1 };
    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha === 0) bands.transparent++;
      else if (alpha < 16) bands.almostTransparent++;
      else if (alpha < 192) bands.softEdges++;
      else if (alpha < 255) bands.nearlyOpaque++;
      else bands.opaque++;
      if (alpha >= 16) {
        bbox.x0 = Math.min(bbox.x0, x); bbox.y0 = Math.min(bbox.y0, y);
        bbox.x1 = Math.max(bbox.x1, x); bbox.y1 = Math.max(bbox.y1, y);
      }
      if (x < border.width || x >= width - border.width || y < border.height || y >= height - border.height) {
        border.pixels++;
        if (alpha >= 16) border.visible++;
        if (alpha === 255) border.opaque++;
      }
    }
    if (maskCanvas) {
      maskCanvas.width = width;
      maskCanvas.height = height;
      const mask = maskCanvas.getContext("2d");
      if (mask) {
        const result = mask.createImageData(width, height);
        for (let i = 0; i < data.length; i += 4) {
          const a = data[i + 3];
          result.data[i] = a; result.data[i + 1] = a; result.data[i + 2] = a;
          result.data[i + 3] = 255;
        }
        mask.putImageData(result, 0, 0);
      }
    }
    const total = width * height;
    const round = (value) => Math.round(value * 1000) / 10;
    return {
      schema: "vecidya-vico-alpha-audit-v1",
      source: src, original: [source.naturalWidth, source.naturalHeight], sampled: [width, height],
      alphaPercent: Object.fromEntries(Object.entries(bands).map(([key, value]) => [key, round(value / total)])),
      visibleBoundingBox: bbox.x1 >= 0 ? [bbox.x0, bbox.y0, bbox.x1, bbox.y1] : null,
      border: { band: "4% per side", visiblePercent: round(border.visible / border.pixels), opaquePercent: round(border.opaque / border.pixels) },
      status: "diagnostic-only-no-pixel-retouch",
    };
  };
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
    const analyze = $("vico-workbench-analyze");
    const alphaPanel = $("vico-workbench-alpha-panel");
    const alphaSummary = $("vico-workbench-alpha-summary");
    const alphaCanvas = $("vico-workbench-alpha-canvas");
    const copy = $("vico-workbench-copy");
    const status = $("vico-workbench-status");
    if (![gallery,image,name,detail,original,stage,theme,position,size,sizeLabel,scene,copy,status,analyze,alphaPanel,alphaSummary,alphaCanvas].every(Boolean)) return;
    const normalized = (asset) => asset.source.split("/").pop();
    const safeEntries = entries.filter((asset) => Object.hasOwn(definitions, normalized(asset)));
    const missing = entries.filter((asset) => !Object.hasOwn(definitions, normalized(asset)));
    if (missing.length || safeEntries.length !== Object.keys(definitions).length) {
      status.textContent = "Revisa el registro: hay imágenes de Vico sin clasificación o una variante sin fuente en el catálogo.";
    }
    let selected = safeEntries[0] ?? null;
    let lastAudit = null;
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
      button.addEventListener("click", () => { selected = asset; lastAudit = null; alphaPanel.hidden = true; render(); });
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
    analyze.addEventListener("click", async () => {
      if (!selected) return;
      const inspectedAsset = selected;
      analyze.disabled = true;
      status.textContent = "Analizando una copia temporal de la imagen en el navegador…";
      try {
        const report = await inspectAlpha(inspectedAsset.source, { maskCanvas: alphaCanvas });
        if (selected !== inspectedAsset) return;
        lastAudit = report;
        alphaPanel.hidden = false;
        alphaSummary.textContent = inspectedAsset.name + ": área totalmente transparente " +
          report.alphaPercent.transparent + " %, píxeles semitransparentes " +
          (report.alphaPercent.almostTransparent + report.alphaPercent.softEdges + report.alphaPercent.nearlyOpaque).toFixed(1) +
          " %, píxeles visibles en bordes de 4 % " + report.border.visiblePercent + " %.";
        status.textContent = "Máscara calculada localmente. Este resultado no identifica automáticamente qué brillos son defectos.";
      } catch {
        status.textContent = "No se pudo analizar el canal alfa. Consulta el original; no se ha alterado la imagen.";
      } finally {
        analyze.disabled = false;
      }
    });
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
        alphaAudit: lastAudit && lastAudit.source === selected.source ? lastAudit : null,
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
