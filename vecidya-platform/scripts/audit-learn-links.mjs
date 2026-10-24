#!/usr/bin/env node
// Auditoría de enlaces bibliográficos de Aprende. No modifica contenidos ni publica cambios.
import { readFile, writeFile } from "node:fs/promises";

const source = await readFile(new URL("../app/content/learn.ts", import.meta.url), "utf8");
const urls = [...new Set([...source.matchAll(/url:\s*"(https:\/\/[^"]+)"/g)].map((match) => match[1]))];
const timeoutMs = 12000;
const results = [];
for (const url of urls) {
  const entry = { url, status: "unverified", httpStatus: null, finalUrl: null, detail: "" };
  try {
    const response = await fetch(url, { method: "HEAD", redirect: "follow", signal: AbortSignal.timeout(timeoutMs), headers: { "User-Agent": "Vecidya-Aula-LinkAudit/1.0" } });
    let final = response;
    if ([403, 405, 429, 501].includes(response.status)) {
      final = await fetch(url, { method: "GET", redirect: "follow", signal: AbortSignal.timeout(timeoutMs), headers: { "User-Agent": "Vecidya-Aula-LinkAudit/1.0", Range: "bytes=0-1023" } });
      await final.body?.cancel();
    }
    entry.httpStatus = final.status;
    entry.finalUrl = final.url;
    entry.status = final.ok ? (final.url === url ? "reachable" : "redirected") : "needs_review";
    if (!final.ok) entry.detail = "HTTP " + final.status + " (podría ser bloqueo anti-bot)";
  } catch (error) {
    entry.status = "needs_review";
    entry.detail = error instanceof Error ? error.message : String(error);
  }
  results.push(entry);
  process.stdout.write(entry.status + " " + (entry.httpStatus ?? "-") + " " + url + "\n");
}
const report = { checkedAt: new Date().toISOString(), scope: "URL bibliográficas de learn.ts", uniqueUrls: urls.length, results };
await writeFile(process.env.LEARN_LINK_REPORT ?? "learn-link-audit.json", JSON.stringify(report, null, 2) + "\n");
const review = results.filter((entry) => entry.status === "needs_review").length;
process.stdout.write("URL únicas: " + urls.length + "; requieren revisión: " + review + "\n");
// Una fuente no accesible desde CI requiere revisión, no bloquea despliegue automáticamente.
