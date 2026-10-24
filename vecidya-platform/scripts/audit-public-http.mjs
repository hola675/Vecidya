#!/usr/bin/env node
// Rastreo HTTP de solo lectura. No ejecuta formularios, login ni acciones con efectos.
import { writeFile } from "node:fs/promises";

const origin = new URL(process.env.VECIDYA_AUDIT_ORIGIN || "https://vecidya.com");
if (origin.protocol !== "https:" && origin.hostname !== "localhost") {
  throw new Error("El destino debe usar HTTPS, salvo localhost.");
}
const paths = ["/", "/privacidad", "/terminos", "/informacion-legal", "/licencias", "/servicios", "/addons", "/aprende", "/vecindario", "/diagnostico", "/contacto", "/robots.txt", "/sitemap.xml"];
const results = [];
for (const path of paths) {
  const url = new URL(path, origin);
  const started = Date.now();
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(12000), redirect: "follow", headers: { "User-Agent": "Vecidya-Public-Audit/1.0 (read-only)" } });
    const body = await response.text();
    const html = response.headers.get("content-type")?.includes("text/html");
    const title = html ? body.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] || null : null;
    const canonical = html ? body.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i)?.[1] || null : null;
    const version = html ? body.match(/(?:v|versi[oó]n\s*)(0\.7\.3)/i)?.[0] || null : null;
    results.push({ path, status: response.status, finalUrl: response.url, ms: Date.now() - started, title, canonical, version073Visible: Boolean(version), bytes: Buffer.byteLength(body), contentType: response.headers.get("content-type") });
  } catch (error) {
    results.push({ path, error: String(error), ms: Date.now() - started });
  }
}
const report = { checkedAt: new Date().toISOString(), origin: origin.origin, scope: "HTTP público, solo lectura; no certifica experiencia visual, cookies ni despliegue", results };
const output = process.argv[2];
if (output) await writeFile(output, JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report, null, 2));
if (results.some((result) => result.error || (result.status && result.status >= 400))) process.exitCode = 1;
