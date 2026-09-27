import { existsSync } from "node:fs";

import { chromium } from "playwright";

import { assertLocalBaseUrl, baseUrl } from "./test-safety.mjs";

assertLocalBaseUrl();

// DIAG-002 — Diagnóstico: contrato de deep link, aislamiento de perfil, semántica accesible,
// recorrido completo de negocio, resultado explicable, mapeo real a Licencias/Servicios/Addons/Aprende,
// reinicio y responsive 1366/768/390/360.
// DIAG-003 — Puntaje global visible, porcentaje por dimensión, estado visual con icono real
// junto a cada prioridad y exportación a PDF vía impresión del navegador.

const localEdgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const chromiumExecutablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ?? (existsSync(localEdgePath) ? localEdgePath : undefined);
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const url = (path) => new URL(path, baseUrl).toString();

const profiles = {
  business: "Un negocio o empresa",
  professional: "Mi perfil profesional",
  creator: "Artista o creador de contenido",
  project: "Un proyecto o iniciativa",
  organization: "Una organización o comunidad",
};

const PROFILE_PROMPT = "¿Qué quieres entender mejor?";
const GOAL_PROMPT = "¿Qué te gustaría resolver primero?";
const STAGE_PROMPT = "¿En qué momento estás?";

async function assertNoOverflow(page, label) {
  const overflow = await page.evaluate(() => {
    const width = document.documentElement.clientWidth;
    return [...document.body.querySelectorAll("*")]
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && rect.right > width + 1;
      })
      .slice(0, 5)
      .map((element) => ({ tag: element.tagName, className: element.className, right: element.getBoundingClientRect().right, width }));
  });
  assert(overflow.length === 0, `${label} tiene overflow horizontal: ${JSON.stringify(overflow)}`);
}

async function assertNoRowOverlap(page, label, selector) {
  const overlaps = await page.evaluate((sel) => {
    const rows = [...document.querySelectorAll(sel)];
    const rects = rows.map((row) => row.getBoundingClientRect());
    const bad = [];
    for (let i = 0; i < rects.length - 1; i += 1) {
      if (rects[i].bottom > rects[i + 1].top + 1) {
        bad.push({ index: i, bottom: rects[i].bottom, nextTop: rects[i + 1].top });
      }
    }
    return bad;
  }, selector);
  assert(overlaps.length === 0, `${label}: filas de «${selector}» se superponen verticalmente: ${JSON.stringify(overlaps)}`);
}

async function currentPrompt(page) {
  return (await page.locator("#diagnostic-title").textContent())?.trim();
}

async function expectPrompt(page, label, expected) {
  const prompt = await currentPrompt(page);
  const ok = expected instanceof RegExp ? expected.test(prompt ?? "") : prompt === expected;
  assert(ok, `${label}: se esperaba «${expected}» y apareció «${prompt}».`);
}

async function pick(page, label, options) {
  for (const name of options) {
    const input = page.getByLabel(name, { exact: true });
    const id = await input.getAttribute("id");
    assert(id, `${label}: la opción «${name}» no tiene input asociado.`);
    // Como una persona real: se pulsa la etiqueta visible, no el input oculto.
    await page.locator(`label[for="${id}"]`).click();
    assert(await input.isChecked(), `${label}: la opción «${name}» no quedó marcada.`);
  }
}

async function next(page, label) {
  const button = page.getByRole("button", { name: /^(Continuar|Ver resultado)$/ });
  assert(!(await button.isDisabled()), `${label}: Continuar quedó deshabilitado tras responder.`);
  await button.click();
}

async function back(page) {
  await page.getByRole("button", { name: "Volver" }).click();
}

const businessPath = [
  [GOAL_PROMPT, ["Dejar de perder consultas o seguimientos"]],
  [STAGE_PROMPT, ["Funciona con clientes o actividad regular"]],
  ["¿Cuántas personas participan hoy en la operación, incluyéndote?", ["Entre 2 y 5"]],
  ["¿Qué tienes hoy funcionando y actualizado?", ["Redes sociales activas", "WhatsApp Business (cuenta de negocio, no personal)", "Perfil de Google (Maps o Perfil de Negocio)"]],
  [/entiende rápido qué haces/, ["Sí, con claridad"]],
  ["¿Qué señales de confianza puede ver un cliente nuevo antes de decidir?", ["Reseñas públicas (Google, redes o plataformas)", "Fotos reales del negocio, productos o trabajo"]],
  ["¿Por dónde llegan hoy la mayoría de tus consultas, clientes o participantes?", ["Redes sociales", "Recomendaciones de boca en boca"]],
  ["Si alguien busca en Google lo que ofreces en tu zona, ¿apareces?", ["Aparezco, pero no destaco"]],
  ["Cuando alguien quiere escribirte o llamarte, ¿tiene una vía clara y atendida?", ["Sí, varios canales; respondo donde llegue"]],
  ["Cuando llega una consulta, ¿queda registrada en un mismo lugar para darle seguimiento?", ["No; queda en el chat o en la memoria"]],
  ["¿Cuánto suele tardar la primera respuesta a una consulta nueva?", ["El mismo día"]],
  ["Si la persona no decide en la primera conversación, ¿qué pasa después?", ["Normalmente no hay seguimiento"]],
  ["¿Está claro quién responde y quién da seguimiento a cada consulta?", ["En parte"]],
  ["Después de una venta o servicio, ¿pides una reseña, haces seguimiento o vuelves a contactar?", ["No"]],
  ["¿Qué sabes hoy con datos y no solo por intuición?", ["Cuántas consultas llegan por semana o por mes"]],
];

async function runBusinessPath(page, label) {
  await page.goto(url("/diagnostico"), { waitUntil: "networkidle" });
  assert(await page.locator("h1").count() === 1, `${label}: Diagnóstico debe tener un único H1.`);
  await expectPrompt(page, label, PROFILE_PROMPT);
  assert(await page.getByRole("group", { name: /¿Qué quieres entender mejor\?/ }).count() === 1, `${label}: la pregunta no es un grupo (fieldset/legend).`);
  assert(await page.getByRole("radio").count() === 5, `${label}: se esperaban 5 perfiles como radios.`);

  const progress = page.getByRole("progressbar");
  assert(await progress.getAttribute("aria-valuemin") === "0", `${label}: progreso sin aria-valuemin.`);
  assert(Number(await progress.getAttribute("aria-valuemax")) >= 1, `${label}: progreso sin total de secciones.`);
  assert((await progress.getAttribute("aria-valuetext") ?? "").includes("Sección"), `${label}: progreso sin texto de sección.`);
  assert(await page.locator('ol[aria-label="Secciones del diagnóstico"] li[aria-current="step"]').count() === 1, `${label}: stepper sin sección actual.`);
  assert((await page.getByText(/Sección 1 de 5 · Contexto · Elige un perfil/i).count()) > 0, `${label}: no mostró el contexto de progreso inicial.`);
  assert(await page.getByRole("button", { name: "Continuar" }).isDisabled(), `${label}: Continuar debe estar deshabilitado sin perfil.`);

  // Teclado: las flechas mueven la selección dentro del grupo de radios.
  await page.getByLabel(profiles.business, { exact: true }).focus();
  await page.keyboard.press("ArrowDown");
  assert(await page.getByLabel(profiles.professional, { exact: true }).isChecked(), `${label}: la selección por teclado no funcionó.`);
  assert((await page.locator("label.is-selected").count()) === 1, `${label}: el estado seleccionado no se refleja fuera del color.`);

  await pick(page, label, [profiles.business]);
  assert((await page.getByText(/Sección 1 de \d+ · Contexto · Pregunta 1 de \d+/i).count()) > 0, `${label}: con perfil el progreso debe mostrar el total.`);
  await next(page, label);
  await expectPrompt(page, label, GOAL_PROMPT);
  assert(await page.evaluate(() => document.activeElement?.id) === "diagnostic-title", `${label}: el foco no pasó a la nueva pregunta.`);
  assert(new URL(page.url()).searchParams.get("perfil") === "business", `${label}: la URL no refleja el perfil elegido.`);

  await back(page);
  await expectPrompt(page, label, PROFILE_PROMPT);
  assert(await page.getByLabel(profiles.business, { exact: true }).isChecked(), `${label}: Volver no conservó la respuesta.`);
  await next(page, label);

  for (const [prompt, options] of businessPath) {
    await expectPrompt(page, label, prompt);
    await assertNoOverflow(page, `${label} pregunta «${prompt}»`);
    await pick(page, label, options);
    await next(page, label);
  }

  // Resultado
  await assertNoOverflow(page, `${label} resultado`);
  assert(await page.evaluate(() => document.activeElement?.id) === "diagnostic-title", `${label}: el foco no pasó al resultado.`);
  assert(await page.getByRole("heading", { level: 2, name: "Operación activa con fugas" }).isVisible(), `${label}: el estado no corresponde al escenario (consultas sin registro ni seguimiento).`);
  for (const heading of ["Cómo llegamos a este resultado", "Confianza alta", "Tus dimensiones", "Fortalezas", "Brechas y riesgos", "Prioridades", "Siguientes pasos", "Encaje con Vecidya"]) {
    assert(await page.getByRole("heading", { level: 3, name: heading }).isVisible(), `${label}: falta la sección «${heading}».`);
  }
  assert(await page.getByText("Diagnóstico completo").first().isVisible(), `${label}: el progreso no marcó el final.`);
  const priorities = page.locator(".diagnostic-priority");
  const priorityCount = await priorities.count();
  assert(priorityCount >= 1 && priorityCount <= 3, `${label}: ${priorityCount} prioridades; se esperaban entre 1 y 3.`);
  assert(/Registrar cada consulta/.test(await priorities.first().locator("h4").textContent()), `${label}: la primera prioridad debería ser registrar consultas.`);
  assert(/Por qué:.*«No; queda en el chat o en la memoria»/.test(await priorities.first().textContent()), `${label}: la prioridad no explica con la respuesta dada.`);
  const commercial = page.locator(".diagnostic-commercial");
  assert(/Barrio/.test(await commercial.textContent()), `${label}: la licencia esperada era Barrio.`);
  assert(await commercial.getByRole("link", { name: /Ver Barrio en Licencias/i }).getAttribute("href") === "/licencias#barrio", `${label}: no enlazó la licencia recomendada a su ancla.`);
  assert(await commercial.getByRole("link", { name: /^Ver addons/i }).getAttribute("href") === "/addons", `${label}: no enlazó Addons.`);
  assert(await commercial.locator('a[href="/addons#whatsapp"]').count() > 0, `${label}: el addon recomendado no enlaza a su ancla.`);
  assert(await commercial.getByRole("link", { name: /Ver todos los servicios/i }).getAttribute("href") === "/servicios", `${label}: no enlazó Servicios.`);
  assert(await page.locator(".diagnostic-priority--primary").count() === 1, `${label}: la prioridad principal no está destacada.`);

  // DIAG-003: cada dimensión muestra su porcentaje como texto visible (no solo el ancho de la barra).
  const dimensionValues = await page.locator(".diagnostic-dimensions__value").allTextContents();
  assert(dimensionValues.length > 0, `${label}: ninguna dimensión muestra su porcentaje visible.`);
  assert(dimensionValues.every((text) => /\d{1,3}%/.test(text)), `${label}: alguna dimensión no muestra un porcentaje válido: ${JSON.stringify(dimensionValues)}`);
  assert(await page.locator(".diagnostic-dimensions__icon").first().isVisible(), `${label}: falta el icono de estado junto al porcentaje de la dimensión.`);
  await assertNoRowOverlap(page, label, ".diagnostic-dimensions > div");
  // Regresión: un selector genérico preexistente (`.diagnostic-dimensions dd span`) forzaba
  // `display:block` sobre CUALQUIER span dentro de `dd`, incluido el nuevo `.diagnostic-dimensions__value`,
  // apilando el icono y el porcentaje verticalmente y desbordándolos sobre la fila siguiente (visible mucho
  // más allá de su propia caja de layout, así que `assertNoRowOverlap` por sí solo no lo detecta).
  const firstValueLayout = await page.evaluate(() => {
    const value = document.querySelector(".diagnostic-dimensions__value");
    const icon = value?.querySelector("img");
    const score = value?.querySelector("strong");
    if (!value || !icon || !score) return null;
    return {
      display: getComputedStyle(value).display,
      iconTop: icon.getBoundingClientRect().top,
      scoreTop: score.getBoundingClientRect().top,
    };
  });
  assert(firstValueLayout, `${label}: no se encontró el icono y el porcentaje de una dimensión evaluada.`);
  // Como elemento de grid dentro de `dd`, el navegador "blockifica" inline-flex a flex (spec CSS Display);
  // lo que importa es que siga siendo un contenedor flex, no `block` (la regresión real).
  assert(firstValueLayout.display.includes("flex"), `${label}: «.diagnostic-dimensions__value» no es un contenedor flex (${firstValueLayout.display}); el icono y el porcentaje se apilan en vez de quedar en línea.`);
  // Con `align-items: center` el icono (16px) y el texto (línea ~19px) difieren unos pocos px por centrado
  // vertical normal; la regresión real los desplazaba ~16px (una fila completa apilada sobre la otra).
  assert(Math.abs(firstValueLayout.iconTop - firstValueLayout.scoreTop) < 10, `${label}: el icono y el porcentaje de la dimensión no están en la misma línea (icono top=${firstValueLayout.iconTop}, porcentaje top=${firstValueLayout.scoreTop}).`);

  // DIAG-003: puntaje global destacado cerca del inicio del resultado.
  assert(await page.locator(".diagnostic-overall-score__label").isVisible(), `${label}: falta el bloque destacado «Tu diagnóstico».`);
  const overallScoreText = (await page.locator(".diagnostic-overall-score__value").textContent())?.trim();
  assert(/^\d{1,3}%$/.test(overallScoreText ?? ""), `${label}: el puntaje global «${overallScoreText}» no es un porcentaje válido.`);
  assert(await page.locator(".diagnostic-overall-score__icon").isVisible(), `${label}: falta el icono de estado del puntaje global.`);

  // DIAG-003: la prioridad principal muestra el porcentaje de la dimensión afectada, no solo el texto.
  assert(await priorities.first().locator(".diagnostic-status__score").count() === 1, `${label}: la prioridad principal no muestra el porcentaje de su dimensión.`);
  assert(await priorities.first().locator(".diagnostic-status__icon").isVisible(), `${label}: falta el icono de estado en la prioridad principal.`);

  // DIAG-003: exportación a PDF vía impresión del navegador, sin dependencias nuevas.
  assert(await page.getByRole("button", { name: /Descargar mi diagnóstico/i }).isVisible(), `${label}: falta el botón para descargar el diagnóstico en PDF.`);
  assert(await page.getByText(/Registro y seguimiento|registro de consultas respondiste/i).count() > 0, `${label}: el estado no cita la evidencia comercial.`);
  assert(await commercial.getByRole("link", { name: /Explorar Aprende/i }).getAttribute("href") === "/aprende", `${label}: no enlazó Aprende.`);
  assert(await page.locator('a[href="/servicios#estructuracion"]').count() > 0, `${label}: no enlazó el servicio de organización.`);
  assert(await page.locator('a[href^="/aprende/que-es-un-crm"]').count() > 0, `${label}: no enlazó el artículo de CRM.`);
  assert(/WhatsApp/.test(await commercial.textContent()), `${label}: con WhatsApp Business, equipo y sin registro, el addon WhatsApp debía aparecer.`);
  assert(await page.getByText(/no es una auditoría/i).count() > 0, `${label}: faltan los límites del diagnóstico.`);

  const contact = page.getByRole("link", { name: "Revisar este resultado con Vecidya" });
  const mailto = await contact.getAttribute("href");
  assert(mailto?.startsWith("mailto:hola@vecidya.com?subject="), `${label}: el CTA de contacto no es un mailto prellenado.`);
  const body = decodeURIComponent(mailto.split("body=")[1] ?? "");
  assert(body.includes("Estado: Operación activa con fugas") && !body.includes("assets") && !body.includes("["), `${label}: el correo expone respuestas crudas o no resume el estado.`);
  assert(await page.getByRole("link", { name: "Ir a Contacto" }).getAttribute("href") === "/contacto", `${label}: no enlazó Contacto.`);

  await page.getByRole("button", { name: "Rehacer diagnóstico" }).click();
  await expectPrompt(page, label, PROFILE_PROMPT);
  assert(new URL(page.url()).search === "", `${label}: rehacer no limpió los parámetros de la URL.`);
  assert(await page.locator('input[name="profile"]:checked').count() === 0, `${label}: rehacer conservó un perfil.`);
}

// DIAG-V3-06: la restauración automática en el mismo navegador (Browser Store) reutiliza
// intencionalmente el estado local entre navegaciones; estos escenarios necesitan partir de un
// diagnóstico realmente en blanco, así que limpian el snapshot local explícitamente, igual que un
// usuario que nunca empezó uno.
async function clearBrowserDiagnosticStore(page) {
  await page.evaluate(() => window.localStorage.removeItem("vecidya.diagnostic.session.v1"));
}

async function runDeepLinks(page, label) {
  await clearBrowserDiagnosticStore(page);
  for (const [id, name] of Object.entries(profiles)) {
    await page.goto(url(`/diagnostico?perfil=${id}`), { waitUntil: "networkidle" });
    await expectPrompt(page, `${label} perfil=${id}`, GOAL_PROMPT);
    assert(await page.locator('input[name="profile"]').count() === 0, `${label} perfil=${id}: la pregunta de perfil no debería estar visible.`);
    await back(page);
    await expectPrompt(page, `${label} perfil=${id} volver`, PROFILE_PROMPT);
    assert(await page.getByLabel(name, { exact: true }).isChecked(), `${label} perfil=${id}: el perfil no quedó preseleccionado.`);
    await assertNoOverflow(page, `${label} perfil=${id}`);
  }

  await clearBrowserDiagnosticStore(page);
  for (const invalid of ["%3Cscript%3Ealert(1)%3C%2Fscript%3E", "public_figure", "idea", "BUSINESS%00", "' OR 1=1"]) {
    await page.goto(url(`/diagnostico?perfil=${invalid}`), { waitUntil: "networkidle" });
    await expectPrompt(page, `${label} perfil inválido ${invalid}`, PROFILE_PROMPT);
    assert(await page.locator('input[name="profile"]:checked').count() === 0, `${label}: un valor inválido preseleccionó un perfil (${invalid}).`);
    assert(!(await page.content()).includes("<script>alert"), `${label}: la URL se reflejó en el HTML.`);
  }

  await page.goto(url("/diagnostico?perfil=business&objetivo=stop_losing"), { waitUntil: "networkidle" });
  await expectPrompt(page, `${label} perfil+objetivo`, STAGE_PROMPT);
  await back(page);
  await expectPrompt(page, `${label} perfil+objetivo volver`, GOAL_PROMPT);
  assert(await page.getByLabel("Dejar de perder consultas o seguimientos", { exact: true }).isChecked(), `${label}: el objetivo del enlace no quedó preseleccionado.`);

  await page.goto(url("/diagnostico?perfil=creator"), { waitUntil: "networkidle" });
  await page.reload({ waitUntil: "networkidle" });
  await expectPrompt(page, `${label} recarga`, GOAL_PROMPT);
  await back(page);
  assert(await page.getByLabel(profiles.creator, { exact: true }).isChecked(), `${label}: la recarga perdió el perfil del enlace.`);
}

async function runHomeEntry(page, label) {
  await clearBrowserDiagnosticStore(page);
  await page.goto(url("/"), { waitUntil: "networkidle" });
  const expected = { Negocio: "business", Profesional: "professional", Proyecto: "project", "Artista o creador de contenido": "creator" };
  for (const [text, id] of Object.entries(expected)) {
    const href = await page.locator("a.home-diagnostic-choice", { hasText: text }).getAttribute("href");
    assert(href === `/diagnostico?perfil=${id}`, `${label}: la puerta «${text}» enlaza ${href}.`);
  }
  await page.locator("a.home-diagnostic-choice", { hasText: "Profesional" }).click();
  await page.waitForURL(/\/diagnostico\?perfil=professional$/);
  await page.waitForSelector("#diagnostic-title");
  await expectPrompt(page, `${label} Home → Profesional`, GOAL_PROMPT);
  await back(page);
  assert(await page.getByLabel(profiles.professional, { exact: true }).isChecked(), `${label}: Home → Profesional no preseleccionó Profesional.`);
  assert(await page.locator("h1").count() === 1, `${label}: H1 duplicado tras navegación cliente.`);
}

async function runProfileIsolation(page, label) {
  await clearBrowserDiagnosticStore(page);
  await page.goto(url("/diagnostico?perfil=business"), { waitUntil: "networkidle" });
  await pick(page, label, ["Ordenar contactos, tareas y procesos"]);
  await next(page, label);
  await pick(page, label, ["Funciona con clientes o actividad regular"]);
  await next(page, label);
  await pick(page, label, ["Entre 2 y 5"]);
  await next(page, label);
  await pick(page, label, ["Redes sociales activas"]);
  await next(page, label);
  await expectPrompt(page, label, /entiende rápido qué haces/);
  for (let index = 0; index < 5; index += 1) await back(page);
  await expectPrompt(page, `${label} volver al perfil`, PROFILE_PROMPT);
  assert(await page.getByLabel(profiles.business, { exact: true }).isChecked(), `${label}: el perfil original no aparece marcado.`);

  await pick(page, label, [profiles.professional]);
  assert(new URL(page.url()).searchParams.get("perfil") === "professional", `${label}: cambiar de perfil no actualizó la URL.`);
  await next(page, label);
  await expectPrompt(page, `${label} tras cambiar perfil`, GOAL_PROMPT);
  assert(await page.locator('input[name="goal"]:checked').count() === 0, `${label}: el objetivo del perfil anterior sobrevivió al cambio de perfil.`);
  assert((await page.getByText(/Pregunta 2 de/).count()) > 0, `${label}: el progreso no se reinició tras cambiar de perfil.`);

  await page.reload({ waitUntil: "networkidle" });
  await expectPrompt(page, `${label} recarga tras cambio`, GOAL_PROMPT);
  await back(page);
  assert(await page.getByLabel(profiles.professional, { exact: true }).isChecked(), `${label}: la recarga no conservó el perfil cambiado.`);
}

function readDiagnosticSessionId(page) {
  return page.evaluate(() => {
    try {
      const raw = window.localStorage.getItem("vecidya.diagnostic.session.v1");
      return raw ? JSON.parse(raw).sessionId : null;
    } catch {
      return null;
    }
  });
}

// DIAG-V3-06 §11/§59: la única diferencia funcional de esta fase — recargar en el mismo navegador
// vuelve exactamente a donde quedó, sin depender de la URL, y reutiliza la MISMA sesión de servidor
// (hallazgo I2 de la revisión independiente: antes, cada recarga creaba una sesión nueva y dejaba la
// anterior huérfana en D1 sin escribirla nunca más).
async function runSameBrowserResume(page, label) {
  await clearBrowserDiagnosticStore(page);
  await page.goto(url("/diagnostico"), { waitUntil: "networkidle" });
  await pick(page, label, [profiles.business]);
  await next(page, label);
  await pick(page, label, ["Dejar de perder consultas o seguimientos"]);
  await next(page, label);
  await pick(page, label, ["Funciona con clientes o actividad regular"]);
  await next(page, label);

  await page.waitForFunction(
    () => {
      try {
        return Boolean(JSON.parse(window.localStorage.getItem("vecidya.diagnostic.session.v1")).sessionId);
      } catch {
        return false;
      }
    },
    { timeout: 5000 },
  );
  const promptBeforeReload = await currentPrompt(page);
  const sessionIdBeforeReload = await readDiagnosticSessionId(page);
  assert(sessionIdBeforeReload, `${label}: debería existir una sesión de servidor tras responder varias preguntas.`);

  // La app ya fija `?perfil=business` en la URL al elegir perfil (para que el enlace sea compartible);
  // eso no es lo que hace que la recarga funcione aquí. Lo real es que sobreviven las respuestas
  // POSTERIORES al perfil (objetivo y momento), que la URL nunca codifica.
  await page.reload({ waitUntil: "networkidle" });
  await expectPrompt(page, `${label} restauración same-browser`, promptBeforeReload);

  const sessionIdAfterReload = await readDiagnosticSessionId(page);
  assert(
    sessionIdAfterReload === sessionIdBeforeReload,
    `${label}: hallazgo I2 — la recarga debe reutilizar la misma sesión de servidor (antes: ${sessionIdBeforeReload}, después: ${sessionIdAfterReload}), no crear una nueva y dejar la anterior huérfana.`,
  );

  await back(page);
  assert(
    await page.getByLabel("Funciona con clientes o actividad regular", { exact: true }).isChecked(),
    `${label}: la recarga perdió una respuesta intermedia, no solo el perfil.`,
  );
}

async function runViewport(width, height, extended) {
  const browser = await chromium.launch(chromiumExecutablePath ? { executablePath: chromiumExecutablePath } : {});
  const page = await browser.newPage({ viewport: { width, height } });
  const label = `${width}x${height}`;
  const consoleErrors = [];
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  page.on("pageerror", (error) => consoleErrors.push(error.message));
  if (extended) await page.emulateMedia({ reducedMotion: "reduce" });

  await runBusinessPath(page, label);
  if (extended) {
    await runDeepLinks(page, label);
    await runHomeEntry(page, label);
    await runProfileIsolation(page, label);
    await runSameBrowserResume(page, label);
  }

  assert(consoleErrors.length === 0, `${label} registró errores de consola: ${consoleErrors.join(" | ")}`);
  await browser.close();
}

for (const [width, height, extended] of [[1366, 900, true], [768, 900, false], [390, 844, true], [360, 800, false]]) {
  await runViewport(width, height, extended);
}

console.log("PASS: Diagnóstico verificó deep links por perfil y objetivo, valores inválidos, entrada desde Home, aislamiento al cambiar de perfil, fieldset/radios accesibles, teclado, foco, progreso por secciones, recorrido de negocio, resultado explicable, mapeo real a Licencias/Servicios/Addons/Aprende, mailto sin respuestas crudas, reinicio, responsive 1366/768/390/360, puntaje global visible, porcentaje por dimensión y exportación a PDF (DIAG-003).");
