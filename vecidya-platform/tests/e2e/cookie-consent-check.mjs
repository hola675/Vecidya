import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { chromium } from "playwright";
import { assertLocalBaseUrl, baseUrl } from "./test-safety.mjs";

assertLocalBaseUrl();
const edge = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ?? (existsSync(edge) ? edge : undefined);
const browser = await chromium.launch(executablePath ? { executablePath } : {});
const key = "vecidya:cookie-preferences:v2";
const visit = (page) => page.goto(new URL("/cookies", baseUrl).toString(), { waitUntil: "networkidle" });
try {
  for (const viewport of [{ width: 1366, height: 900 }, { width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    await visit(page);
    const banner = page.getByRole("region", { name: "Preferencias de cookies" });
    assert.equal(await banner.isVisible(), true, "primera visita debe mostrar aviso");
    assert.equal(await page.evaluate((k) => localStorage.getItem(k), key), null, "sin consentimiento no hay preferencia");
    await page.getByRole("button", { name: "Rechazar opcionales" }).click();
    let saved = await page.evaluate((k) => JSON.parse(localStorage.getItem(k)), key);
    assert.equal(saved.analytics, false);
    assert.equal(saved.marketing, false);
    await page.reload({ waitUntil: "networkidle" });
    assert.equal(await banner.count(), 0, "rechazo persistente no vuelve a abrir banner");
    await page.getByRole("button", { name: "Preferencias de cookies" }).click();
    await page.getByLabel("Analítica opcional").check();
    await page.getByRole("button", { name: "Guardar selección" }).click();
    saved = await page.evaluate((k) => JSON.parse(localStorage.getItem(k)), key);
    assert.equal(saved.analytics, true);
    assert.equal(saved.marketing, false);
    const second = await context.newPage();
    await visit(second);
    await second.evaluate((k) => localStorage.removeItem(k), key);
    await page.getByRole("region", { name: "Preferencias de cookies" }).waitFor();
    assert.equal(await page.getByLabel("Analítica opcional").count(), 0, "revocación reabre sin selección previa");
    await page.getByRole("button", { name: "Configurar" }).click();
    assert.equal(await page.getByLabel("Analítica opcional").isChecked(), false);
    assert.equal(await page.getByLabel("Marketing opcional").isChecked(), false);
    await second.close();
    await context.close();
  }
  console.log("PASS: consentimiento inicial, rechazo, granularidad, persistencia, revocación entre pestañas y móvil.");
} finally { await browser.close(); }
