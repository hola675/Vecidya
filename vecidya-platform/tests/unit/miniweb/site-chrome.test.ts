import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { resolveBusinessLogoUrl } from "../../../app/components/public-business-profile-view.tsx";
import { MiniWebSiteHeader, MiniWebSiteFooter } from "../../../app/components/miniweb/miniweb-site-chrome.tsx";
import type { MiniWebPublicProfile } from "../../../app/features/miniweb/public-model.ts";

const business: MiniWebPublicProfile = {
  slug: "ejemplo",
  displayName: "Empresa Ejemplo",
  logoUrl: "/api/organizations/abc/business-media/imagen-1",
  shortDescription: "Servicios",
  description: "Descripción",
  category: "Servicios",
  city: "Madrid",
  country: "España",
  phone: null,
  publicEmail: null,
  websiteUrl: null,
  whatsapp: null,
  instagramUrl: null,
  facebookUrl: null,
  linkedinUrl: null,
  serviceMode: null,
  serviceArea: null,
  verificationStatus: "unverified",
};

test("el logo del borrador solo es válido en la previsualización autenticada", () => {
  assert.equal(resolveBusinessLogoUrl(business.logoUrl), null);
  assert.equal(resolveBusinessLogoUrl(business.logoUrl, true), business.logoUrl);
  assert.equal(resolveBusinessLogoUrl("/media/business/ejemplo/imagen-1"), "/media/business/ejemplo/imagen-1");
  assert.equal(resolveBusinessLogoUrl("javascript:alert(1)", true), null);
  assert.equal(resolveBusinessLogoUrl("//evil.example/test", true), null);
});

test("la previsualización conserva el encabezado y footer del negocio sin enlaces externos accionables", () => {
  const html = renderToStaticMarkup(createElement("div", null,
    createElement(MiniWebSiteHeader, { profile: business, visibleModules: ["hero", "services", "contact"], preview: true }),
    createElement(MiniWebSiteFooter, { profile: business, preview: true }),
  ));
  assert.match(html, /Empresa Ejemplo/);
  assert.match(html, /Servicios/);
  assert.match(html, /Contacto/);
  assert.match(html, /Creado con Vecidya/);
  assert.match(html, /\/api\/organizations\/abc\/business-media\/imagen-1/);
  assert.doesNotMatch(html, /<a\b/);
});
