import { existsSync, mkdirSync, mkdtempSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { performance } from "node:perf_hooks";
import { inflateSync } from "node:zlib";

import { chromium } from "playwright";

import { assertLocalBaseUrl, baseUrl } from "./test-safety.mjs";

assertLocalBaseUrl();

// DIAG-V3-12 — informe PDF del diagnóstico V3 (ruta privada `/__dev/diagnostico/informe`, solo con `pnpm run dev`).
// Genera con Chromium (Playwright `page.pdf`, etiquetado y con marcadores) el informe de las 12 personas golden en A4
// y en Carta, más dos casos de estrés, y comprueba sobre el PDF real: tres páginas como objetivo editorial (cuatro
// como techo real para un caso excepcional, nunca a costa de bajar del piso tipográfico de 8,5 pt), texto extraíble
// (no imagen), el contenido del informe presente en el PDF, enlaces de las fuentes clicables, idioma y estructura
// etiquetada, sin IDs internos ni valores vacíos. También genera un PDF representativo con los fondos de impresión
// desactivados (`printBackground: false`) y comprueba que el mismo contenido sigue íntegro: el color es un apoyo,
// nunca el único portador de significado. Los PDF van a un directorio temporal que se borra al terminar (o al
// indicado en REPORT_OUT_DIR, para revisarlos). No toca D1 ni cuentas.

const GOLDEN = ["idea_early_stage", "local_service_business", "appointment_business", "independent_professional", "professional_appointments", "physical_retail", "ecommerce", "retail_ecommerce_hybrid", "b2b_business", "creator_personal_brand", "nonprofit_community", "operations_heavy"];
const TARGET_PAGES = 3;
const PAGE_CEILING = 4;
const MIN_BODY_PT = 8.5;
const keepDir = process.env.REPORT_OUT_DIR;
const outDir = keepDir ?? mkdtempSync(join(tmpdir(), "vecidya-report-"));
if (keepDir) mkdirSync(keepDir, { recursive: true });
const localEdgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const failures = [];
const fail = (message) => { failures.push(message); console.log(`FAIL ${message}`); };

// ── Lectura mínima de PDF (sin dependencias): objetos, flujos, páginas y texto vía mapas ToUnicode ──
function parsePdf(buffer) {
  const raw = buffer.toString("latin1");
  const objects = new Map();
  for (const match of raw.matchAll(/(\d+) 0 obj\b([\s\S]*?)endobj/g)) objects.set(Number(match[1]), match[2]);
  const streamOf = (body) => {
    const start = body.indexOf("stream");
    if (start < 0) return null;
    let from = start + 6;
    if (body[from] === "\r") from += 1;
    if (body[from] === "\n") from += 1;
    const data = Buffer.from(body.slice(from, body.lastIndexOf("endstream")), "latin1");
    try { return /\/FlateDecode/.test(body.slice(0, start)) ? inflateSync(data) : data; } catch { return null; }
  };
  const ref = (value) => { const match = /(\d+) 0 R/.exec(value ?? ""); return match ? Number(match[1]) : null; };
  const dictOf = (value) => { const id = ref(value); return id !== null && /^\s*$/.test(value.replace(/\d+ 0 R/, "")) ? objects.get(id) ?? "" : value; };
  const cmaps = new Map();
  const cmapFor = (fontId) => {
    if (cmaps.has(fontId)) return cmaps.get(fontId);
    const font = objects.get(fontId) ?? "";
    const toUnicode = ref(/\/ToUnicode\s+(\d+ 0 R)/.exec(font)?.[1]);
    const map = new Map();
    const stream = toUnicode !== null ? streamOf(objects.get(toUnicode) ?? "")?.toString("latin1") ?? "" : "";
    const decode = (hex) => { let text = ""; for (let i = 0; i < hex.length; i += 4) text += String.fromCharCode(parseInt(hex.slice(i, i + 4), 16)); return text; };
    for (const block of stream.matchAll(/beginbfchar([\s\S]*?)endbfchar/g)) for (const item of block[1].matchAll(/<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>/g)) map.set(parseInt(item[1], 16), decode(item[2]));
    for (const block of stream.matchAll(/beginbfrange([\s\S]*?)endbfrange/g)) {
      for (const item of block[1].matchAll(/<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>\s*(<[0-9a-fA-F]+>|\[[^\]]*\])/g)) {
        const low = parseInt(item[1], 16), high = parseInt(item[2], 16);
        if (item[3].startsWith("[")) [...item[3].matchAll(/<([0-9a-fA-F]+)>/g)].forEach((entry, index) => map.set(low + index, decode(entry[1])));
        else { const base = parseInt(item[3].slice(1, -1), 16); for (let code = low; code <= high; code += 1) map.set(code, String.fromCharCode(base + code - low)); }
      }
    }
    const width = /begincodespacerange\s*<([0-9a-fA-F]+)>/.exec(stream)?.[1].length ?? 4;
    const entry = { map, bytes: width / 2 };
    cmaps.set(fontId, entry);
    return entry;
  };
  const pages = [...objects.entries()].filter(([, body]) => /\/Type\s*\/Page\b(?!s)/.test(body)).map(([id]) => id);
  const pageTexts = pages.map((pageId) => {
    const page = objects.get(pageId);
    const resources = dictOf(/\/Resources\s*(<<[\s\S]*?>>\s*>>|\d+ 0 R)/.exec(page)?.[1] ?? "");
    const fontDict = dictOf(/\/Font\s*(<<[\s\S]*?>>|\d+ 0 R)/.exec(resources)?.[1] ?? "");
    const fonts = new Map([...fontDict.matchAll(/\/(\w+)\s+(\d+) 0 R/g)].map((match) => [match[1], Number(match[2])]));
    const contents = /\/Contents\s*(\[[^\]]*\]|\d+ 0 R)/.exec(page)?.[1] ?? "";
    const streams = [...contents.matchAll(/(\d+) 0 R/g)].map((match) => streamOf(objects.get(Number(match[1])) ?? "")?.toString("latin1") ?? "");
    let text = "";
    let current = null;
    for (const content of streams) {
      for (const token of content.matchAll(/\/(\w+)\s+[\d.]+\s+Tf|(\[[^\]]*\])\s*TJ|<([0-9a-fA-F]*)>\s*Tj|\b(ET|Td|TD|T\*)\b/g)) {
        if (token[1]) { current = fonts.has(token[1]) ? cmapFor(fonts.get(token[1])) : null; continue; }
        if (token[4]) { text += " "; continue; }
        const hexes = token[2] ? [...token[2].matchAll(/<([0-9a-fA-F]*)>/g)].map((match) => match[1]) : [token[3]];
        for (const hex of hexes) {
          if (!current) continue;
          for (let i = 0; i < hex.length; i += current.bytes * 2) text += current.map.get(parseInt(hex.slice(i, i + current.bytes * 2), 16)) ?? "";
        }
      }
    }
    return text.replace(/\s+/g, " ").trim();
  });
  return {
    pages: pages.length,
    text: pageTexts.join(" "),
    pageTexts,
    // Cadenas literales de PDF: paréntesis y barras pueden ir escapados (`\(`, `\)`, `\/`).
    uris: [...raw.matchAll(/\/URI\s*\(((?:\\.|[^\\)])*)\)/g)].map((match) => match[1].replace(/\\(.)/g, "$1")),
    tagged: /\/StructTreeRoot\s+\d+ 0 R/.test(raw) && /\/Marked\s+true/.test(raw),
    lang: /\/Lang\s*\(([^)]*)\)/.exec(raw)?.[1] ?? null,
    outline: /\/Outlines\s+\d+ 0 R/.test(raw),
    title: /\/Title\s*(\([^)]*\)|<[^>]*>)/.test(raw),
  };
}
const squash = (text) => text.replace(/\s+/g, "").normalize("NFC");

const browser = await chromium.launch(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : existsSync(localEdgePath) ? { executablePath: localEdgePath } : {});
const rows = [];
const pageCounts = { 2: 0, 3: 0, 4: 0, other: 0 };
try {
  const cases = [
    ...["a4", "letter"].flatMap((paper) => GOLDEN.map((persona) => ({ persona, paper, stress: false }))),
    { persona: "professional_appointments", paper: "a4", stress: true },
    { persona: "nonprofit_community", paper: "letter", stress: true },
  ];
  for (const { persona, paper, stress } of cases) {
    const label = `${persona}/${paper}${stress ? "/stress" : ""}`;
    const page = await browser.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(new URL(`/__dev/diagnostico/informe/${persona}?paper=${paper}&date=2026-10-01${stress ? "&stress=1" : ""}`, baseUrl).toString(), { waitUntil: "networkidle" });
    await page.waitForSelector('.rp[data-ready="true"]', { timeout: 20_000 });
    await page.evaluate(() => document.fonts.ready);
    const dom = await page.evaluate(() => ({
      density: document.querySelector(".rp").getAttribute("data-density"),
      sheets: document.querySelector(".rp").getAttribute("data-pages"),
      overflow: document.querySelector(".rp").getAttribute("data-overflow") === "true",
      // Lo que el informe muestra (ya contrastado con el resultado canónico en las pruebas unitarias del view model).
      // Incluye los indicadores de estado/confianza por área: deben leerse como texto, nunca solo por color.
      expected: [...document.querySelectorAll(".rp-title, .rp-presence__value, .rp-presence__label, .rp-h2, .rp-dim .rp-h3, .dr-status, .dr-confidence, .rp-priority__statement, .rp-rec .rp-h3, .rp-offer__name, .rp-sources a")].map((node) => node.textContent.trim()),
      sourceLinks: [...document.querySelectorAll(".rp-sources a")].map((node) => node.getAttribute("href")),
      title: document.title,
    }));
    const file = join(outDir, `${persona}-${paper}${stress ? "-stress" : ""}.pdf`);
    const started = performance.now();
    await page.pdf({ path: file, preferCSSPageSize: true, printBackground: true, tagged: true, outline: true });
    const ms = Math.round(performance.now() - started);
    const pdf = parsePdf(await import("node:fs").then((fs) => fs.readFileSync(file)));
    const size = statSync(file).size;
    rows.push({ label, pages: pdf.pages, sheets: dom.sheets, size, ms, density: dom.density, overflow: dom.overflow });
    pageCounts[pdf.pages in pageCounts ? pdf.pages : "other"] += 1;
    if (errors.length) fail(`${label}: errores de página ${errors.join(" | ")}`);
    if (pdf.pages > PAGE_CEILING) fail(`${label}: ${pdf.pages} páginas (techo ${PAGE_CEILING})`);
    if (pdf.pages > TARGET_PAGES && !stress) fail(`${label}: ${pdf.pages} páginas sin ser un caso de estrés (objetivo ${TARGET_PAGES})`);
    if (dom.overflow) fail(`${label}: el contenido no cabe ni en ${PAGE_CEILING} hojas con el piso tipográfico`);
    if (Number(dom.density) < MIN_BODY_PT - 0.01) fail(`${label}: densidad ${dom.density}pt por debajo del piso de ${MIN_BODY_PT}pt`);
    if (dom.sheets !== String(pdf.pages)) fail(`${label}: hojas del informe (${dom.sheets}) ≠ páginas del PDF (${pdf.pages})`);
    if (size === 0) fail(`${label}: PDF vacío`);
    if (!/DiagnósticodePresenciaDigital/.test(squash(pdf.text))) fail(`${label}: el título no es texto extraíble`);
    for (const text of dom.expected) if (text && !squash(pdf.text).includes(squash(text))) fail(`${label}: falta en el PDF «${text}»`);
    for (const href of dom.sourceLinks) if (!pdf.uris.includes(href)) fail(`${label}: enlace no clicable ${href}`);
    if (!pdf.tagged) fail(`${label}: PDF sin estructura etiquetada`);
    if (pdf.lang !== "es") fail(`${label}: idioma del documento ${pdf.lang}`);
    if (!pdf.outline) fail(`${label}: sin marcadores`);
    if (!pdf.title) fail(`${label}: sin título en metadatos`);
    if (/\bq2_|\bnull\b|undefined|\[object Object\]|\bNaN\b|DESBORDA|priority:|constraint:|evidence_gap/.test(pdf.text)) fail(`${label}: texto interno o vacío en el PDF`);
    if (/excerpt|verifiedOn|270\s?%/.test(pdf.text)) fail(`${label}: datos de auditoría de fuentes en el PDF`);
    await page.close();
  }
  // Fondos de impresión desactivados (opción habitual del navegador): el mismo contenido debe seguir íntegro, porque
  // el color es solo un apoyo. Se repite el caso representativo con `printBackground: false`, sin contarlo en las
  // estadísticas de tamaño/tiempo (ese PDF no es el que se recomienda, solo prueba que nada depende del color).
  await (async () => {
    const persona = "professional_appointments", paper = "a4";
    const page = await browser.newPage();
    await page.goto(new URL(`/__dev/diagnostico/informe/${persona}?paper=${paper}&date=2026-10-01`, baseUrl).toString(), { waitUntil: "networkidle" });
    await page.waitForSelector('.rp[data-ready="true"]', { timeout: 20_000 });
    const dom = await page.evaluate(() => ({
      expected: [...document.querySelectorAll(".rp-title, .rp-presence__value, .rp-presence__label, .rp-h2, .rp-dim .rp-h3, .dr-status, .dr-confidence")].map((node) => node.textContent.trim()),
    }));
    const file = join(outDir, `${persona}-${paper}-no-bg.pdf`);
    await page.pdf({ path: file, preferCSSPageSize: true, printBackground: false, tagged: true, outline: true });
    const pdf = parsePdf(await import("node:fs").then((fs) => fs.readFileSync(file)));
    for (const text of dom.expected) if (text && !squash(pdf.text).includes(squash(text))) fail(`${persona}/no-bg: falta en el PDF sin fondos «${text}»`);
    if (pdf.pages > PAGE_CEILING) fail(`${persona}/no-bg: ${pdf.pages} páginas (techo ${PAGE_CEILING})`);
    await page.close();
  })();
  // Color y escala de grises: la imagen de cada hoja con fondos y en grises, para la revisión visual. Un caso
  // representativo se captura además con los fondos de impresión desactivados Y en escala de grises a la vez.
  const grey = await browser.newPage({ viewport: { width: 900, height: 1200 } });
  const representative = "professional_appointments";
  for (const persona of ["professional_appointments", "physical_retail", "b2b_business", "creator_personal_brand", "idea_early_stage", "appointment_business"]) {
    // Se mide en pantalla (como en el uso real, antes de imprimir) y se fotografía con estilos de impresión.
    await grey.emulateMedia({ media: "screen" });
    await grey.goto(new URL(`/__dev/diagnostico/informe/${persona}?date=2026-10-01`, baseUrl).toString(), { waitUntil: "networkidle" });
    await grey.waitForSelector('.rp[data-ready="true"]');
    await grey.emulateMedia({ media: "print" });
    if (keepDir && (await grey.locator(".rp-sheet").count()) > 0) {
      const sheets = grey.locator(".rp-sheet");
      for (let index = 0; index < (await sheets.count()); index += 1) await sheets.nth(index).screenshot({ path: join(outDir, `${persona}-p${index + 1}.png`) });
      await grey.addStyleTag({ content: "html { filter: grayscale(1); }" });
      await sheets.nth(0).screenshot({ path: join(outDir, `${persona}-p1-grey.png`) });
      if (persona === representative) {
        // Grises + sin fondos a la vez, sobre el mismo caso representativo (§8).
        await grey.addStyleTag({ content: "html { filter: grayscale(1) !important; } * { background: #fff !important; background-image: none !important; box-shadow: none !important; }" });
        for (let index = 0; index < (await sheets.count()); index += 1) await sheets.nth(index).screenshot({ path: join(outDir, `${persona}-p${index + 1}-grey-no-bg.png`) });
      }
    }
  }
  await grey.close();
} finally {
  await browser.close();
}

const sizes = rows.filter((row) => !row.label.includes("stress")).map((row) => row.size).sort((a, b) => a - b);
const times = rows.filter((row) => !row.label.includes("stress")).map((row) => row.ms).sort((a, b) => a - b);
const median = (values) => values[Math.floor(values.length / 2)];
const summary = {
  reports: rows.length,
  pageCounts,
  pages: Object.fromEntries(rows.map((row) => [row.label, row.pages])),
  densities: Object.fromEntries(rows.map((row) => [row.label, row.density])),
  sizeBytes: { min: sizes[0], median: median(sizes), max: sizes.at(-1) },
  generationMs: { min: times[0], median: median(times), max: times.at(-1) },
};
writeFileSync(join(outDir, "summary.json"), JSON.stringify({ summary, rows }, null, 2));
console.log(JSON.stringify(summary, null, 1));
if (!keepDir) rmSync(outDir, { recursive: true, force: true });
if (failures.length > 0) {
  console.log(`diagnostic-v3-report-check: ${failures.length} fallos`);
  process.exit(1);
}
console.log(`diagnostic-v3-report-check: ${rows.length}/${rows.length} PASS (+ no-bg y grises/sin fondos)`);
