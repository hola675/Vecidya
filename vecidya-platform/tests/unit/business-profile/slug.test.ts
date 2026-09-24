import assert from "node:assert/strict";
import { test } from "node:test";

import { slugifyBusinessName } from "../../../db/business-profile-rules.ts";
import { parseBusinessProfileForm } from "../../../server/business-profile-validation.server.ts";

function serverAcceptsSlug(slug: string) {
  const form = new FormData();
  form.set("displayName", "Negocio de prueba");
  form.set("slug", slug);
  try {
    return parseBusinessProfileForm(form).slug === slug;
  } catch (error) {
    if (error instanceof Response) return false;
    throw error;
  }
}

test("el nombre visible se convierte en minúsculas con guiones simples", () => {
  assert.equal(slugifyBusinessName("Mi Negocio"), "mi-negocio");
  assert.equal(slugifyBusinessName("  Mi    Negocio   Local  "), "mi-negocio-local");
  assert.equal(slugifyBusinessName("MI NEGOCIO"), "mi-negocio");
});

test("las tildes, la ñ y la diéresis del español se normalizan", () => {
  assert.equal(slugifyBusinessName("Café Medellín"), "cafe-medellin");
  assert.equal(slugifyBusinessName("Niño & Compañía"), "nino-compania");
  assert.equal(slugifyBusinessName("Óptica Central"), "optica-central");
  assert.equal(slugifyBusinessName("Peluquería Güemes"), "peluqueria-guemes");
});

test("los símbolos separan palabras sin dejar guiones al inicio, al final ni repetidos", () => {
  assert.equal(slugifyBusinessName("Tienda #1 (Centro)"), "tienda-1-centro");
  assert.equal(slugifyBusinessName("¡Hola! ¿Qué tal?"), "hola-que-tal");
  assert.equal(slugifyBusinessName("--Negocio--"), "negocio");
  assert.equal(slugifyBusinessName("Tienda...  ---  Uno"), "tienda-uno");
});

test("sin caracteres utilizables el slug queda vacío para que el formulario lo exija", () => {
  for (const input of ["", "   ", "!!!", "@#$%&*", "日本料理", "🍕🍕"]) {
    assert.equal(slugifyBusinessName(input), "", `entrada ${JSON.stringify(input)}`);
  }
});

test("un nombre largo se recorta a 80 caracteres sin guion final", () => {
  assert.equal(slugifyBusinessName("x".repeat(120)), "x".repeat(80));
  assert.equal(slugifyBusinessName("a".repeat(80)), "a".repeat(80));
  // El corte cae justo en un guion (10 × «negocio-» = 80): se elimina en vez de dejarlo colgando.
  assert.equal(slugifyBusinessName("Negocio ".repeat(15).trim()), "negocio-negocio-negocio-negocio-negocio-negocio-negocio-negocio-negocio-negocio");
  assert.equal(slugifyBusinessName(`Tienda ${"á".repeat(90)}`), `tienda-${"a".repeat(73)}`);
});

test("todo slug autogenerado no vacío lo acepta la validación del servidor", () => {
  const names = [
    "Mi Negocio",
    "Café Medellín",
    "Niño & Compañía",
    "Tienda #1 (Centro)",
    "🍕 Pizza Roma 🍕",
    "Negocio ".repeat(15).trim(),
    "x".repeat(120),
    `Centro Comercial ${"Plaza Mayor ".repeat(10)}`,
  ];
  for (const name of names) {
    const slug = slugifyBusinessName(name);
    assert.ok(slug.length > 0, `${JSON.stringify(name)} produjo un slug vacío`);
    assert.ok(serverAcceptsSlug(slug), `el servidor rechazó ${JSON.stringify(slug)} (${slug.length} caracteres) generado desde ${JSON.stringify(name)}`);
  }
});
