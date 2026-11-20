import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { VISUAL_ROLLOUT, visualClassName } from "../../app/lib/visual-rollout.ts";

import {
  PUBLIC_FOOTER_GROUPS,
  PUBLIC_HEADER_PRIMARY_LINKS,
  PUBLIC_HEADER_SOLUTIONS_LINKS,
  PUBLIC_MOBILE_LINKS,
  PUBLIC_NAVIGATION_LINKS,
} from "../../app/components/public-navigation.ts";

const destinations = (links: readonly { to: string }[]) => links.map((link) => link.to);

test("los destinos públicos son absolutos, únicos y conservan los slugs canónicos", () => {
  const links = Object.values(PUBLIC_NAVIGATION_LINKS);
  assert.equal(new Set(destinations(links)).size, links.length);
  assert(links.every((link) => link.to.startsWith("/") && !link.to.startsWith("//")));
  assert.equal(PUBLIC_NAVIGATION_LINKS.complementos.to, "/addons");
  assert.equal(PUBLIC_NAVIGATION_LINKS.aprende.to, "/aprende");
  assert.equal(PUBLIC_NAVIGATION_LINKS.acceder.to, "/login");
});

test("header, menú móvil y footer reutilizan etiquetas y destinos sin duplicación", () => {
  const allLinks = Object.values(PUBLIC_NAVIGATION_LINKS);
  const footerLinks = PUBLIC_FOOTER_GROUPS.flatMap((group) => [...group.links]);

  for (const collection of [PUBLIC_HEADER_PRIMARY_LINKS, PUBLIC_HEADER_SOLUTIONS_LINKS, PUBLIC_MOBILE_LINKS, footerLinks]) {
    assert.equal(new Set(destinations(collection)).size, collection.length, "enlaces duplicados dentro de una superficie");
    for (const link of collection) assert(allLinks.includes(link), "hay un destino visible fuera del catálogo único");
  }
  assert.equal(new Set(destinations([...PUBLIC_HEADER_PRIMARY_LINKS, ...PUBLIC_HEADER_SOLUTIONS_LINKS])).size,
    PUBLIC_HEADER_PRIMARY_LINKS.length + PUBLIC_HEADER_SOLUTIONS_LINKS.length, "duplicado en navegación desktop");

  for (const path of ["/vecindario", "/aprende", "/diagnostico", "/licencias", "/servicios", "/addons", "/contacto"]) {
    assert(footerLinks.some((link) => link.to === path), `footer sin ${path}`);
    assert(PUBLIC_MOBILE_LINKS.some((link) => link.to === path), `móvil sin ${path}`);
  }
});

test("las familias visuales del footer y Soluciones preservan la clasificación comercial", () => {
  assert.deepEqual(PUBLIC_FOOTER_GROUPS.map((group) => group.title),
    ["Explorar", "Soluciones", "Vecidya", "Información legal"]);
  assert.deepEqual(destinations(PUBLIC_HEADER_SOLUTIONS_LINKS), ["/licencias", "/servicios", "/addons"]);
  assert.deepEqual(
    destinations(PUBLIC_FOOTER_GROUPS.find((group) => group.id === "soluciones")!.links),
    ["/licencias", "/servicios", "/addons"],
  );
  assert.deepEqual(
    destinations(PUBLIC_FOOTER_GROUPS.find((group) => group.id === "explorar")!.links),
    ["/vecindario", "/aprende", "/diagnostico"],
  );
  assert.equal(PUBLIC_NAVIGATION_LINKS.complementos.label, "Complementos");
});

test("R1.7 reutiliza retícula v-section-heading sin cambiar datos, enlaces ni encabezados", () => {
  const read = (path: string) => readFileSync(new URL("../../" + path, import.meta.url), "utf8");
  const home = read("app/routes/home.tsx");
  const directory = read("app/routes/directory.tsx");
  const services = read("app/routes/services.tsx");
  const css = read("app/styles/visual-system.css");
  assert.equal((home.match(/visualClassName\("home-section-heading", "publicHomeHeadings", "v-section-heading"\)/g) ?? []).length, 4);
  assert.equal((directory.match(/visualClassName\("directory-results-heading", "publicDirectoryResults", "v-section-heading"\)/g) ?? []).length, 1);
  assert.equal((services.match(/visualClassName\("services-section-heading", "publicServicesHeadings", "v-section-heading"\)/g) ?? []).length, 2);
  for (const id of ["home-neighborhood-title", "home-diagnostic-title", "home-services-title", "home-learn-contact-title"])
    assert.ok(home.includes('id="' + id + '"'));
  assert.ok(directory.includes('id="directory-title"'));
  assert.ok(services.includes('id="services-process-title"'));
  assert.match(css, /\.v-section-heading\s*\{/);
  assert.match(css, /@media \(max-width: 760px\)/);
  assert.match(home, /PUBLIC_ACTION_LABELS/);
});

test("R3: pilotos existentes activados y nuevas superficies apagadas por defecto", () => {
  const enabled = ["publicHomeHeadings", "publicDirectoryResults", "publicServicesHeadings", "adminBusinessSurfaces", "miniWebEditorSolid"];
  assert.deepEqual(Object.keys(VISUAL_ROLLOUT).sort(),
    [...enabled, "futureLearnLayout", "futureClientShell"].sort());
  for (const key of enabled) assert.equal(VISUAL_ROLLOUT[key], true, key);
  assert.equal(VISUAL_ROLLOUT.futureLearnLayout, false);
  assert.equal(VISUAL_ROLLOUT.futureClientShell, false);
  assert.equal(visualClassName("base", "futureLearnLayout", "v-section-heading"), "base");
  assert.equal(visualClassName("base", "publicHomeHeadings", "v-section-heading"), "base v-section-heading");
});
