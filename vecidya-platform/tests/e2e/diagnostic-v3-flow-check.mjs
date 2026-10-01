import { existsSync } from "node:fs";

import { chromium } from "playwright";

import { assertLocalBaseUrl, baseUrl } from "./test-safety.mjs";

assertLocalBaseUrl();

// DIAG-V3-10B — cuestionario adaptativo V3 en la ruta privada de desarrollo (`/__dev/diagnostico/v3`, solo con
// `pnpm run dev`): recorrido completo con clic y con teclado hasta el resultado V3, error de validación visible,
// exclusividad de la multiselección, volver y editar, recarga y reanudación, reinicio con confirmación, datos
// locales corruptos, sesión completada, sin respuestas en la URL y sin desplazamiento horizontal en móvil.
// No toca D1 ni cuentas: el progreso vive solo en el almacenamiento local del navegador.

const localEdgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const chromiumExecutablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ?? (existsSync(localEdgePath) ? localEdgePath : undefined);
const route = new URL("/__dev/diagnostico/v3", baseUrl).toString();
const KEY = "vecidya.diagnostic.v3.session.1";
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const preferred = { q2_entity: "business", q2_has_customers: "yes", q2_regularity: "regular", q2_delivery: "scheduled", q2_sector: "health_wellness", q2_goal: "opportunities", q2_friction: "follow_up" };
let passed = 0;
const pass = (message) => { passed += 1; console.log(`PASS ${message}`); };

const currentId = (page) => page.locator(".df-option__input").first().getAttribute("name");
async function answerCurrent(page) {
  const id = await currentId(page);
  const values = await page.locator(`.df-option__input[name="${id}"]`).evaluateAll((elements) => elements.map((element) => element.value));
  await page.locator(`.df-option__input[name="${id}"][value="${preferred[id] ?? values[0]}"]`).click();
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.waitForFunction((previous) => document.querySelector(".df-option__input")?.getAttribute("name") !== previous || !!document.querySelector(".df-ready"), id);
  return id;
}
async function start(page) {
  await page.goto(route, { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Empezar diagnóstico" }).click();
  await page.waitForSelector(".df-option__input");
}
const stored = (page) => page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? "null"), KEY);

const browser = await chromium.launch(chromiumExecutablePath ? { executablePath: chromiumExecutablePath } : {});
try {
  // Recorrido completo en móvil, con el foco en cada pregunta nueva y sin desplazamiento horizontal.
  {
    const page = await browser.newPage({ viewport: { width: 375, height: 800 } });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await start(page);
    assert((await page.getByRole("heading", { level: 1 }).count()) === 1, "una sola pregunta (h1) en pantalla");
    await page.getByRole("button", { name: "Continuar" }).click();
    const alert = page.locator(".df-question__error[role=alert]");
    assert((await alert.textContent()) === "Elige una opción para continuar.", "error de validación");
    assert(await alert.evaluate((element) => { const box = element.getBoundingClientRect(); return box.top >= 0 && box.bottom <= innerHeight; }), "el error queda a la vista junto a los botones");
    pass("validación local, anunciada y visible");
    const asked = [];
    for (let guard = 0; guard < 30 && !(await page.locator(".df-ready").count()); guard += 1) {
      asked.push(await answerCurrent(page));
      if (!(await page.locator(".df-ready").count())) assert(await page.evaluate(() => document.activeElement?.classList.contains("df-question__title")), "el foco pasa a la pregunta nueva");
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), "sin desplazamiento horizontal");
    }
    assert(asked.length > 0 && asked.length <= 24 && new Set(asked).size === asked.length, `ruta de ${asked.length} preguntas sin repeticiones`);
    await page.getByRole("button", { name: "Ver mi resultado" }).click();
    await page.waitForSelector("#dr-title");
    assert(await page.evaluate(() => document.activeElement?.id === "dr-title"), "el foco pasa al resultado");
    assert((await page.locator(".dr-dim").count()) === 8, "ocho dimensiones en el resultado");
    assert((await stored(page)).status === "completed", "sesión completada en el navegador");
    assert(!/q2_|answers/.test(page.url()), "sin respuestas en la URL");
    assert(errors.length === 0, `sin errores de página: ${errors.join(" | ")}`);
    pass(`recorrido completo de ${asked.length} preguntas hasta el resultado V3`);
    // Sesión completada: al recargar se ofrece el resultado.
    await page.reload({ waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Ver mi resultado" }).click();
    await page.waitForSelector("#dr-title");
    pass("una sesión completada vuelve a mostrar su resultado");
    await page.close();
  }

  // Teclado, multiselección exclusiva, volver/editar, recarga, reinicio y datos corruptos.
  {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await start(page);
    const first = await currentId(page);
    await page.keyboard.press("Tab");
    await page.keyboard.press("Space");
    for (let guard = 0; guard < 30; guard += 1) { await page.keyboard.press("Tab"); if (await page.evaluate(() => document.activeElement?.textContent === "Continuar")) break; }
    await page.keyboard.press("Enter");
    await page.waitForFunction((previous) => document.querySelector(".df-option__input")?.getAttribute("name") !== previous, first);
    pass("respuesta y avance solo con teclado");

    for (let guard = 0; guard < 30 && (await currentId(page)) !== "q2_capacity_signal"; guard += 1) await answerCurrent(page);
    assert((await currentId(page)) === "q2_capacity_signal", "llega a la pregunta múltiple");
    const options = await page.locator('.df-option__input[name="q2_capacity_signal"]').evaluateAll((elements) => elements.map((element) => element.value));
    const known = options.find((value) => value !== "stable" && value !== "unknown");
    await page.locator('.df-option__input[value="stable"]').click();
    await page.locator(`.df-option__input[value="${known}"]`).click();
    const afterKnown = await page.locator(".df-option__input:checked").evaluateAll((elements) => elements.map((element) => element.value));
    await page.locator('.df-option__input[value="unknown"]').click();
    const afterUnknown = await page.locator(".df-option__input:checked").evaluateAll((elements) => elements.map((element) => element.value));
    assert(JSON.stringify(afterKnown) === JSON.stringify([known]) && JSON.stringify(afterUnknown) === JSON.stringify(["unknown"]), "opciones exclusivas");
    pass("multiselección con opciones exclusivas del contrato");

    const live = await currentId(page);
    const history = (await stored(page)).answeredQuestionIds;
    await page.getByRole("button", { name: "Volver" }).click();
    assert((await currentId(page)) === history.at(-1) && (await page.locator(".df-question__review").count()) === 1 && (await page.locator(".df-option__input:checked").count()) > 0, "volver muestra la respuesta guardada");
    await page.getByRole("button", { name: "Continuar" }).click();
    assert((await currentId(page)) === live, "sin cambios vuelve a la pregunta actual");
    pass("volver y continuar sin cambios");
    for (let guard = 0; guard < 30 && (await currentId(page)) !== "q2_has_customers"; guard += 1) await page.getByRole("button", { name: "Volver" }).click();
    await page.locator('.df-option__input[value="no"]').click();
    await page.getByRole("button", { name: "Continuar" }).click();
    await page.waitForTimeout(200);
    const edited = await stored(page);
    assert(edited.answers.q2_has_customers === "no" && edited.reviewIndex === null && !("q2_capacity_signal" in edited.answers), "editar reconcilia la ruta y descarta lo que ya no aplica");
    pass("editar una respuesta anterior reconcilia la ruta");

    const before = (await page.locator(".df-ready").count()) ? "ready" : await currentId(page);
    await page.reload({ waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Continuar diagnóstico" }).click();
    const after = (await page.locator(".df-ready").count()) ? "ready" : await currentId(page);
    assert(before === after, `reanuda en el mismo punto (${before} → ${after})`);
    pass("recarga y reanudación");

    await page.getByRole("button", { name: "Empezar de nuevo" }).first().click();
    await page.getByRole("button", { name: "Sí, empezar de nuevo" }).click();
    assert((await stored(page)) === null && (await page.getByRole("button", { name: "Empezar diagnóstico" }).count()) === 1, "reinicio");
    pass("reinicio con confirmación");

    await page.evaluate((key) => localStorage.setItem(key, "{dañado"), KEY);
    await page.reload({ waitUntil: "networkidle" });
    assert((await page.getByRole("button", { name: "Empezar diagnóstico" }).count()) === 1 && (await stored(page)) === null, "datos corruptos");
    pass("datos locales corruptos: empieza de cero sin romperse");
    await page.close();
  }
} finally {
  await browser.close();
}
console.log(`diagnostic-v3-flow-check: ${passed}/10 PASS`);
if (passed !== 10) process.exit(1);
