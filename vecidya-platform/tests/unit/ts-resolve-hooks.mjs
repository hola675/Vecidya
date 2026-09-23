// Hook de resolución: `./modulo` → `./modulo.ts` o `./modulo/index.ts`.
// Solo actúa sobre especificadores relativos sin extensión que fallen al resolverse.
const hasExtension = (specifier) => /\.[a-z0-9]+$/i.test(specifier.split("/").pop() ?? "");

export async function resolve(specifier, context, nextResolve) {
  const relative = specifier.startsWith("./") || specifier.startsWith("../");
  if (!relative || hasExtension(specifier)) return nextResolve(specifier, context);

  for (const candidate of [`${specifier}.ts`, `${specifier}/index.ts`]) {
    try {
      return await nextResolve(candidate, context);
    } catch (error) {
      if (error?.code !== "ERR_MODULE_NOT_FOUND" && error?.code !== "ERR_UNSUPPORTED_DIR_IMPORT") throw error;
    }
  }
  return nextResolve(specifier, context);
}
