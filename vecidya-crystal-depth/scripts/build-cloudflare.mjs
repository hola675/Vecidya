#!/usr/bin/env node
// Vecidya Crystal Depth — build Cloudflare Workers.
// Versión: 1.1.0 · 2026-11-20
// Publica HTML, CSS, JS, guías didácticas y los assets que consume la biblioteca.
import { copyFile, cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repositoryDir = resolve(projectDir, '..');
const platformAssetsDir = join(repositoryDir, 'vecidya-platform', 'public', 'assets');
const distDir = join(projectDir, 'dist');
const originalPrefix = '../vecidya-platform/public/assets/';
const publishedPrefix = 'assets/platform/';
const originalAssetPattern = /\.\.\/vecidya-platform\/public\/assets\/([a-zA-Z0-9._/%-]+)/g;
const documentsToRewrite = ['biblioteca.html', 'assets/library-catalog.js'];

const documentContents = await Promise.all(documentsToRewrite.map(async (filename) => ({
  filename,
  content: await readFile(join(projectDir, filename), 'utf8'),
})));
const originals = new Set();
for (const { content } of documentContents) {
  for (const [, filename] of content.matchAll(originalAssetPattern)) {
    const decodedName = decodeURIComponent(filename);
    if (decodedName.split('/').some((part) => part === '' || part === '.' || part === '..')) {
      throw new Error(`Ruta de asset no permitida: ${filename}`);
    }
    originals.add(decodedName);
  }
}
if (!originals.size) {
  throw new Error('No se encontraron imágenes oficiales: revisa las rutas del catálogo.');
}

await rm(distDir, { recursive: true, force: true });
await mkdir(distDir, { recursive: true });
await cp(join(projectDir, 'styles'), join(distDir, 'styles'), { recursive: true });
await cp(join(projectDir, 'assets'), join(distDir, 'assets'), { recursive: true });
// La guía de integración forma parte de los enlaces didácticos de la biblioteca.
await cp(join(projectDir, 'docs'), join(distDir, 'docs'), { recursive: true });
await copyFile(join(projectDir, 'index.html'), join(distDir, 'index.html'));

for (const { filename, content } of documentContents) {
  const normalized = content.replaceAll(originalPrefix, publishedPrefix);
  if (normalized.includes(originalPrefix)) {
    throw new Error(`Quedaron rutas originales sin convertir en ${filename}`);
  }
  await writeFile(join(distDir, filename), normalized, 'utf8');
}

for (const filename of [...originals].sort()) {
  const original = join(platformAssetsDir, filename);
  const destination = join(distDir, publishedPrefix, filename);
  await mkdir(dirname(destination), { recursive: true });
  await copyFile(original, destination);
}

console.log(`Crystal Depth: build OK; ${originals.size} recursos oficiales incluidos en dist/.`);
