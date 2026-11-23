#!/usr/bin/env node
// Vecidya Crystal Depth — build Cloudflare Workers.
// Versión: 1.2.0 · 2026-11-23
// Publica HTML, CSS, JS, guías didácticas y los assets locales autocontenidos de la biblioteca.
import { copyFile, cp, mkdir, readFile, rm } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = join(projectDir, 'dist');
const documentsToValidate = [
  'biblioteca.html',
  'assets/library-catalog.js',
  'assets/pattern-registry.json',
];

for (const filename of documentsToValidate) {
  const content = await readFile(join(projectDir, filename), 'utf8');
  if (content.includes('vecidya-platform/public/assets')) {
    throw new Error(`Dependencia de assets de plataforma detectada en ${filename}`);
  }
}

await rm(distDir, { recursive: true, force: true });
await mkdir(distDir, { recursive: true });
await cp(join(projectDir, 'styles'), join(distDir, 'styles'), { recursive: true });
await cp(join(projectDir, 'assets'), join(distDir, 'assets'), { recursive: true });
await cp(join(projectDir, 'docs'), join(distDir, 'docs'), { recursive: true });
await copyFile(join(projectDir, 'index.html'), join(distDir, 'index.html'));
await copyFile(join(projectDir, 'biblioteca.html'), join(distDir, 'biblioteca.html'));

console.log('Crystal Depth: build OK; biblioteca autocontenida con assets locales.');
