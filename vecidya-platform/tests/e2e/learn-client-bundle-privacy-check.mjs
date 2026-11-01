import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";

import { learnArticles } from "../../app/content/learn.ts";
import { getLearnGuideAccess } from "../../app/content/learn-publication.ts";

const assetsRoot = resolve(process.cwd(), "build/client/assets");
async function listJavaScript(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return listJavaScript(path);
    return entry.isFile() && entry.name.endsWith(".js") ? [path] : [];
  }));
  return nested.flat();
}

const assets = await listJavaScript(assetsRoot);
assert(assets.length > 0, "No se encontraron bundles JavaScript de cliente; ejecuta pnpm run build primero.");
const bundleText = await Promise.all(assets.map((path) => readFile(path, "utf8")));
const protectedText = new Set();
for (const article of learnArticles) {
  if (getLearnGuideAccess(article.slug) !== "licensed") continue;
  const candidates = [article.intro, ...article.enPocasPalabras];
  for (const section of article.sections) {
    candidates.push(section.heading, ...section.paragraphs, ...(section.bullets ?? []));
    for (const block of section.blocks ?? []) {
      for (const value of Object.values(block)) {
        if (typeof value === "string") candidates.push(value);
        else if (Array.isArray(value)) {
          for (const item of value) {
            if (typeof item === "string") candidates.push(item);
            else if (item && typeof item === "object") {
              for (const nested of Object.values(item)) if (typeof nested === "string") candidates.push(nested);
            }
          }
        }
      }
    }
  }
  for (const text of candidates) if (text.length >= 40 && !/^https?:\/\//u.test(text)) protectedText.add(text);
}

const leaks = [];
for (const text of protectedText) {
  const assetIndex = bundleText.findIndex((bundle) => bundle.includes(text));
  if (assetIndex >= 0) leaks.push({ text: text.slice(0, 100), asset: assets[assetIndex].split(/[\\/]/u).at(-1) });
}
assert.deepEqual(leaks, [], `El cuerpo de una guía licenciada aparece en un bundle de cliente: ${JSON.stringify(leaks.slice(0, 10))}`);
console.log(`PASS Aprende bundle privacy: ${assets.length} assets, ${protectedText.size} fragmentos protegidos revisados.`);
