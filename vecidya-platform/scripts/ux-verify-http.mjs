/**
 * UX-R3: smoke HTTP anónimo estrictamente de solo lectura.
 * No verifica que un SHA concreto esté desplegado, ni certifica WCAG.
 * Nunca realiza POST ni usa cookies, credenciales o headers de auth.
 */
import { setTimeout as sleep } from "node:timers/promises";

export const UX_HTTP_ROUTES = Object.freeze(["/", "/vecindario", "/servicios", "/aprende"]);

export function resolveUxTarget(target, productionConsent = false) {
  if (!target) throw new Error("Falta UX_HTTP_CHECK_TARGET. Ningún destino predeterminado.");
  let url;
  try { url = new URL(target); } catch { throw new Error("UX_HTTP_CHECK_TARGET no es una URL válida."); }
  if (url.username || url.password || url.search || url.hash || url.pathname !== "/") {
    throw new Error("Solo se permite un origen sin credenciales, ruta, query o fragmento.");
  }
  const local = url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname) && ["4173", "5173"].includes(url.port);
  const staging = url.protocol === "https:" && /^vecidya-platform-staging\.[a-z0-9-]+\.workers\.dev$/.test(url.hostname);
  const production = url.protocol === "https:" && ["vecidya.com", "www.vecidya.com"].includes(url.hostname);
  if (!local && !staging && !(production && productionConsent)) {
    throw new Error("Destino bloqueado. Solo loopback, staging autorizado o producción con confirmación explícita de consulta anónima.");
  }
  return { origin: url.origin, type: local ? "local" : staging ? "staging" : "production" };
}

export async function checkUxHttp(target, productionConsent = false) {
  const { origin, type } = resolveUxTarget(target, productionConsent);
  const results = [];
  for (const path of UX_HTTP_ROUTES) {
    const response = await fetch(new URL(path, origin), {
      method: "GET",
      redirect: "manual",
      headers: { accept: "text/html" },
      signal: AbortSignal.timeout(15_000),
    });
    const html = await response.text();
    const passed = response.status === 200 &&
      (response.headers.get("content-type") ?? "").includes("text/html") &&
      /<h1\b/i.test(html);
    results.push({
      path,
      status: response.status,
      contentType: response.headers.get("content-type") ?? null,
      headingFound: /<h1\b/i.test(html),
      passed,
    });
    // Ritmo deliberado; no saturar el Worker público.
    if (type !== "local") await sleep(120);
  }
  return {
    checkedAtUtc: new Date().toISOString(),
    origin, type, anonymous: true, readOnly: true,
    verifiesDeployedSha: false,
    checks: results, passed: results.every(item => item.passed),
  };
}

if (process.argv[1] && new URL(import.meta.url).pathname.endsWith(process.argv[1].replaceAll("\\", "/"))) {
  try {
    const report = await checkUxHttp(
      process.env.UX_HTTP_CHECK_TARGET,
      process.env.UX_PRODUCTION_READONLY_APPROVED === "1",
    );
    process.stdout.write(JSON.stringify(report, null, 2) + "\n");
    if (!report.passed) process.exitCode = 1;
  } catch (error) {
    console.error("UX-R3 HTTP CHECK: " + (error instanceof Error ? error.message : String(error)));
    process.exitCode = 1;
  }
}
