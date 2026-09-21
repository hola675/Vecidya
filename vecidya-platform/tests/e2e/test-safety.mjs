export const baseUrl = process.env.BASE_URL ?? "http://localhost:5173";

export function assertLocalBaseUrl(value = baseUrl) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`BASE_URL no es una URL válida: ${value}`);
  }

  if (url.protocol !== "http:" || !["localhost", "127.0.0.1"].includes(url.hostname)) {
    throw new Error(`Los E2E locales solo permiten localhost/127.0.0.1; recibido: ${value}`);
  }
}

export function assertRemoteE2EIntent(value = baseUrl) {
  if (process.env.RUN_REMOTE_E2E !== "1") {
    throw new Error("Las pruebas remotas requieren RUN_REMOTE_E2E=1 de forma explícita.");
  }

  if (process.env.TARGET_ENV !== "staging") {
    throw new Error("Las pruebas remotas requieren TARGET_ENV=staging de forma explícita.");
  }

  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`BASE_URL no es una URL válida: ${value}`);
  }

  const productionHosts = new Set([
    "vecidya.com",
    "www.vecidya.com",
    "vecidya-platform.soporte-8a1.workers.dev",
  ]);
  if (
    url.protocol !== "https:" ||
    url.hostname === "vecidya.com" ||
    url.hostname === "www.vecidya.com" ||
    productionHosts.has(url.hostname) ||
    !url.hostname.startsWith("vecidya-platform-staging.") ||
    !url.hostname.endsWith(".workers.dev")
  ) {
    throw new Error(`Las pruebas remotas solo permiten el Worker dedicado vecidya-platform-staging por HTTPS; recibido: ${value}`);
  }
}

export function assertRemoteStagingDatabase(value = process.env.D1_NAME) {
  if (value !== "vecidya-staging") {
    throw new Error("Las pruebas remotas solo permiten D1_NAME=vecidya-staging.");
  }
}
