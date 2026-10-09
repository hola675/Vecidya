import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { gzipSync } from "node:zlib";
import { build } from "vite";

const root = process.cwd();
const output = path.join(root, "node_modules", ".cache", "diagnostic-candidate-benchmark");
await build({
  configFile: false,
  root,
  logLevel: "warn",
  esbuild: { jsx: "automatic" },
  build: {
    emptyOutDir: true,
    outDir: output,
    minify: true,
    sourcemap: false,
    lib: {
      entry: path.join(root, "tests/e2e/diagnostic-v3-candidate-bundle-entry.tsx"),
      formats: ["es"],
      fileName: "candidate-flow",
    },
    rollupOptions: { external: ["react", "react-dom", "react-router"] },
  },
});

async function filesIn(directory) {
  const items = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(items.map((item) => {
    const absolute = path.join(directory, item.name);
    return item.isDirectory() ? filesIn(absolute) : [absolute];
  }));
  return nested.flat();
}

const files = (await filesIn(output)).filter((file) => /\.js$/.test(file));
const chunks = await Promise.all(files.map(async (file) => {
  const content = await readFile(file);
  return { file: path.relative(root, file).replaceAll("\\", "/"), bytes: content.byteLength, gzipBytes: gzipSync(content).byteLength };
}));
console.log(JSON.stringify({ mode: "isolated production-equivalent candidate UI closure", externalShared: ["react", "react-dom", "react-router"], chunks, totalBytes: chunks.reduce((sum, chunk) => sum + chunk.bytes, 0), totalGzipBytes: chunks.reduce((sum, chunk) => sum + chunk.gzipBytes, 0) }, null, 2));
