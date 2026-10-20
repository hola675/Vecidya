import assert from "node:assert/strict";
import { test } from "node:test";

import { buildCommercialContactLinks, resolveCommercialContactInterest } from "../../app/content/public-copy.ts";

const whatsapp = "https://wa.me/573244321864";

test("acepta solo identificadores comerciales explícitos", () => {
  assert.equal(resolveCommercialContactInterest("cuadra")?.label, "la licencia Cuadra");
  assert.equal(resolveCommercialContactInterest("servicio-visibilidad")?.label, "el servicio IA Aplicada");
  for (const value of [null, "", "Cuadra", "otro", "<script>alert(1)</script>", "__proto__", "constructor"]) {
    assert.equal(resolveCommercialContactInterest(value), null);
  }
});

test("sin selección conserva los canales directos", () => {
  assert.deepEqual(buildCommercialContactLinks(null, whatsapp), {
    interest: null, emailHref: "mailto:hola@vecidya.com", whatsappHref: whatsapp,
  });
});

test("preserva contexto legítimo en borradores de email y WhatsApp", () => {
  const links = buildCommercialContactLinks("barrio", whatsapp);
  assert.equal(links.interest?.code, "barrio");
  assert(links.emailHref.includes(encodeURIComponent("Consulta Vecidya: la licencia Barrio")));
  assert(links.whatsappHref.includes(encodeURIComponent("me interesa la licencia Barrio")));
});

test("descarta interés desconocido sin reflejar la entrada", () => {
  const input = "servicio-externo<script>";
  const links = buildCommercialContactLinks(input, whatsapp);
  assert.equal(links.interest, null);
  assert.equal(links.emailHref, "mailto:hola@vecidya.com");
  assert.equal(links.whatsappHref, whatsapp);
  assert(!JSON.stringify(links).includes(input));
});
