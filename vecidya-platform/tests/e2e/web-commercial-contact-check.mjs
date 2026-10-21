import { existsSync } from "node:fs";
import { chromium } from "playwright";
import { assertLocalBaseUrl, baseUrl } from "./test-safety.mjs";

assertLocalBaseUrl();
const localEdgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const chromiumExecutablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ?? (existsSync(localEdgePath) ? localEdgePath : undefined);
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const browser = await chromium.launch(chromiumExecutablePath ? { executablePath: chromiumExecutablePath } : {});
try {
  for (const width of [1366, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 850 } });
    const label = `${width}px`;
    await page.goto(new URL("/servicios", baseUrl).toString(), { waitUntil: "networkidle" });
    assert(await page.locator(".services-core-card").count() === 7, `${label}: siete familias de servicios`);
    assert(await page.locator(".services-core-card__problem").count() === 7, `${label}: siete problemas explicados`);
    assert(await page.locator(".services-core-card__result").count() === 7, `${label}: siete resultados explicados`);
    const ai = page.locator("#visibilidad");
    assert((await ai.innerText()).includes("procesos concretos"), `${label}: IA Aplicada debe referirse a procesos`);
    assert(await ai.getByRole("link", { name: "Consultar este servicio" }).getAttribute("href") === "/contacto?interes=servicio-visibilidad", `${label}: enlace IA con contexto`);
    await page.goto(new URL("/contacto?interes=cuadra", baseUrl).toString(), { waitUntil: "networkidle" });
    assert(await page.getByText(/Interés seleccionado:.*licencia Cuadra/).isVisible(), `${label}: contexto de Cuadra visible`);
    const correo = await page.getByRole("link", { name: "Escribir a hola@vecidya.com" }).getAttribute("href");
    assert(correo?.startsWith("mailto:hola@vecidya.com?subject=") && correo.includes("Cuadra"), `${label}: email contextual`);
    const wa = await page.getByRole("link", { name: "Escribir por WhatsApp" }).getAttribute("href");
    assert(wa?.startsWith("https://wa.me/") && wa.includes("Cuadra"), `${label}: WhatsApp contextual`);
    await page.goto(new URL("/contacto?interes=%3Cscript%3E", baseUrl).toString(), { waitUntil: "networkidle" });
    assert(await page.getByText(/Interés seleccionado:/).count() === 0, `${label}: interés no permitido oculto`);
    assert(await page.getByRole("link", { name: "Escribir a hola@vecidya.com" }).getAttribute("href") === "mailto:hola@vecidya.com", `${label}: email limpio`);
    await page.goto(new URL("/unete", baseUrl).toString(), { waitUntil: "networkidle" });
    assert(await page.getByText(/acceso por invitación se coordinan con Vecidya/).isVisible(), `${label}: invitación explicada`);
    assert(await page.getByRole("link", { name: "comparar las licencias" }).getAttribute("href") === "/licencias", `${label}: acceso a comparación`);
    await page.close();
  }
  console.log("PASS: WEB-COMERCIAL-01 valida servicios, contacto contextual y Únete en desktop/móvil.");
} finally {
  await browser.close();
}
