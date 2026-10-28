import assert from "node:assert/strict";
import { test } from "node:test";

import { getMiniWebPublicationState, restrictMiniWebPublicModel, toMiniWebPublicProfile } from "../../../app/features/miniweb/public-model.ts";

test("el modelo MiniWeb público expone solo campos allowlisted de negocio", () => {
  const databaseRow = {
    id: "profile-id",
    organizationId: "organization-secret",
    status: "published",
    createdAt: new Date(0),
    updatedAt: new Date(0),
    slug: "taller-local",
    displayName: "Taller Local",
    shortDescription: "Descripción corta.",
    category: "Servicios",
    city: "Bogotá",
    country: "Colombia",
    logoUrl: null,
    description: "Descripción.",
    phone: "+573001112233",
    publicEmail: "contacto@example.com",
    websiteUrl: null,
    whatsapp: null,
    instagramUrl: null,
    facebookUrl: null,
    linkedinUrl: null,
    tiktokUrl: null,
    youtubeUrl: null,
    serviceMode: null,
    serviceArea: null,
  };

  const model = toMiniWebPublicProfile(databaseRow, "verified");
  assert.deepEqual(Object.keys(model ?? {}).sort(), [
    "category", "city", "country", "description", "displayName", "facebookUrl", "instagramUrl",
    "linkedinUrl", "logoUrl", "phone", "publicEmail", "serviceArea", "serviceMode", "shortDescription", "tiktokUrl",
    "slug", "verificationStatus", "websiteUrl", "whatsapp", "youtubeUrl",
  ].sort());
  assert.equal(model?.verificationStatus, "verified");
  assert.equal("organizationId" in (model ?? {}), false);
  assert.equal("status" in (model ?? {}), false);
});

test("un negocio ausente no se representa como un perfil ficticio", () => {
  assert.equal(toMiniWebPublicProfile(null, "unverified"), null);
});

test("el payload público excluye contenido de módulos desactivados", () => {
  const profile = toMiniWebPublicProfile({
    slug: "taller-local",
    displayName: "Taller Local",
    shortDescription: "Resumen de hero.",
    category: "Servicios",
    city: "Bogotá",
    country: "Colombia",
    logoUrl: null,
    description: "Descripción oculta.",
    phone: "+573001112233",
    publicEmail: "oculto@example.com",
    websiteUrl: "https://example.com",
    whatsapp: null,
    instagramUrl: null,
    facebookUrl: null,
    linkedinUrl: null,
    serviceMode: "remote",
    serviceArea: "Colombia",
  }, "unverified");
  assert.ok(profile);

  const publicModel = restrictMiniWebPublicModel(profile, [{ dayOfWeek: 1, isClosed: false, opensAt: "09:00", closesAt: "17:00" }], ["hero"]);
  assert.equal(publicModel.profile.shortDescription, "Resumen de hero.");
  assert.equal(publicModel.profile.description, null);
  assert.equal(publicModel.profile.publicEmail, null);
  assert.equal(publicModel.profile.phone, null);
  assert.equal(publicModel.profile.city, null);
  assert.equal(publicModel.profile.serviceArea, null);
  assert.deepEqual(publicModel.hours, []);
});

test("el estado editorial no llama publicado a un perfil suspendido", () => {
  assert.equal(getMiniWebPublicationState("published", "suspended"), "suspended");
  assert.equal(getMiniWebPublicationState("published", "active"), "published");
  assert.equal(getMiniWebPublicationState("draft", "active"), "draft");
});
