import assert from "node:assert/strict";
import { test } from "node:test";

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
  assert.deepEqual(destinations(PUBLIC_HEADER_SOLUTIONS_LINKS), ["/licencias", "/addons"]);
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
