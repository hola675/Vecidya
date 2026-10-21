import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const read = (path: string) => readFileSync(new URL(`../../../${path}`, import.meta.url), "utf8");
const privacy = read("app/routes/privacy.tsx");
const terms = read("app/routes/terms.tsx");
const intro = read("app/components/legal-page.tsx");
const routes = read("app/routes.ts");
const layout = read("app/components/public-layout.tsx");
const navigation = read("app/components/public-navigation.ts");
const register = read("app/routes/register.tsx");
const css = read("app/app.css");
const sitemap = read("app/routes/sitemap.ts");

test("ambos documentos tienen título, índice y secciones enlazables", () => {
  for (const page of [privacy, terms]) {
    assert.match(page, /<main className="public-page legal-page">/);
    assert.match(page, /<LegalPageIntro/);
    assert.match(page, /<LegalContact/);
    assert.match(page, /publicMeta\(/);
    assert.match(page, /<h2 id=/);
    const navigationIds = [...page.matchAll(/\{ id: "([^"]+)", label:/g)].map((match) => match[1]);
    assert.ok(navigationIds.length >= 5);
    assert.equal(new Set(navigationIds).size, navigationIds.length);
    for (const id of navigationIds.filter((value) => value !== "contacto-legal")) {
      assert.ok(page.includes(`id="${id}"`), `falta el destino #${id}`);
    }
  }
  assert.match(intro, /aria-label="En esta página"/);
  assert.match(intro, /aria-current=/);
  assert.match(intro, /#\$\{section\.id\}/);
});

test("navegación, registro y rutas exponen ambos documentos", () => {
  assert.match(routes, /route\("privacidad", "routes\/privacy\.tsx"\)/);
  assert.match(routes, /route\("terminos", "routes\/terms\.tsx"\)/);
  assert.match(sitemap, /"\/terminos"/);
  assert.match(layout, /PUBLIC_FOOTER_GROUPS\.map/);
  for (const path of ["/privacidad", "/terminos"]) {
    assert.ok(navigation.includes(`to: "${path}"`));
    assert.ok(register.includes(`to="${path}"`));
  }
});

test("privacidad contiene información práctica y evita prometer funciones futuras", () => {
  assert.match(privacy, /14 días sin actividad/);
  assert.match(privacy, /no exige registro|sin indicar tu nombre/i);
  assert.match(privacy, /corregir o actualizar|corrección/i);
  assert.match(privacy, /eliminación/);
  assert.match(privacy, /cuando proceda/);
  assert.match(privacy, /no est[aá]n disponibles en este flujo/);
  assert.doesNotMatch(privacy, /tus datos se eliminan automáticamente de todos los sistemas/i);
});

test("las condiciones dejan claro el límite de recomendaciones y contratación", () => {
  assert.match(terms, /no es una promesa/i);
  assert.match(terms, /no (?:es|son) una certificación/i);
  assert.match(terms, /no sustituye los acuerdos particulares/i);
  assert.match(terms, /no publiques contenido/i);
  assert.match(terms, /<details>/);
});

test("identidad y accesibilidad comparten componentes, estilos responsive y modo reducido", () => {
  assert.match(intro, /\/brand\/vecidya-icon-3d\.png/);
  assert.match(intro, /aria-label="Explorar información legal"/);
  assert.match(css, /\.legal-hero/);
  assert.match(css, /\.legal-faq details\[open\]/);
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.match(css, /max-width:530px/);
  assert.doesNotMatch(css, /\.privacy-experience-hero/);
});
