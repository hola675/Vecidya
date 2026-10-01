// Hook de resolución: `./modulo` → `./modulo.ts`, `./modulo/index.ts` o `./modulo.tsx`.
// Solo actúa sobre especificadores relativos sin extensión que fallen al resolverse.
const hasExtension = (specifier) => /\.[a-z0-9]+$/i.test(specifier.split("/").pop() ?? "");

export async function resolve(specifier, context, nextResolve) {
  const relative = specifier.startsWith("./") || specifier.startsWith("../");
  if (!relative || hasExtension(specifier)) return nextResolve(specifier, context);

  for (const candidate of [`${specifier}.ts`, `${specifier}/index.ts`, `${specifier}.tsx`]) {
    try {
      return await nextResolve(candidate, context);
    } catch (error) {
      if (error?.code !== "ERR_MODULE_NOT_FOUND" && error?.code !== "ERR_UNSUPPORTED_DIR_IMPORT") throw error;
    }
  }
  return nextResolve(specifier, context);
}

// Hook de carga: Node solo quita tipos de `.ts`; los componentes `.tsx` (pruebas de UI, DIAG-V3-09) se compilan
// con el transformador Oxc que ya trae Vite (dependencia directa del proyecto), con el runtime JSX automático.
let transformWithOxc;

export async function load(url, context, nextLoad) {
  if (!url.startsWith("file:") || !url.endsWith(".tsx")) return nextLoad(url, context);
  transformWithOxc ??= (await import("vite")).transformWithOxc;
  const { readFile } = await import("node:fs/promises");
  const { fileURLToPath } = await import("node:url");
  const filename = fileURLToPath(url);
  const result = await transformWithOxc(await readFile(filename, "utf8"), filename, { lang: "tsx", jsx: { runtime: "automatic" } });
  return { format: "module", shortCircuit: true, source: result.code };
}
