#!/usr/bin/env node
// Auditoría de enlaces bibliográficos de Aprende. No modifica contenidos ni publica cambios.
import { readFile, writeFile } from "node:fs/promises";

const catalogFiles = ["learn.ts", "learn-business-operations.ts", "learn-operations-02.ts", "learn-management-03.ts"];
const sourceFiles = await Promise.all(catalogFiles.map(async (name) => readFile(new URL("../app/content/" + name, import.meta.url), "utf8")));
const urls = [...new Set(sourceFiles.flatMap((source) => [...source.matchAll(/url:\s*"(https:\/\/[^"]+)"/g)].map((match) => match[1])))];
const timeoutMs = 12000;
const concurrency = 5;
const results = new Array(urls.length);
let cursor = 0;

async function checkUrl(url) {
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
  process.stdout.write(entry.status + " " + (entry.httpStatus ?? "-") + " " + url + "\n");
  return entry;
}

await Promise.all(Array.from({ length: Math.min(concurrency, urls.length) }, async () => {
  while (cursor < urls.length) {
    const index = cursor++;
    results[index] = await checkUrl(urls[index]);
  }
}));
const report = { checkedAt: new Date().toISOString(), scope: "URL bibliográficas de los cuatro módulos de Aprende", uniqueUrls: urls.length, results };
await writeFile(process.env.LEARN_LINK_REPORT ?? "learn-link-audit.json", JSON.stringify(report, null, 2) + "\n");
const review = results.filter((entry) => entry.status === "needs_review").length;
process.stdout.write("URL únicas: " + urls.length + "; requieren revisión: " + review + "\n");
// Una fuente no accesible desde CI requiere revisión, no bloquea despliegue automáticamente.
