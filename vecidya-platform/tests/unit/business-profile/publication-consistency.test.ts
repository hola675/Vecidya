import assert from "node:assert/strict";
import { test } from "node:test";

import { isBusinessPublicationCurrent, readConsistentBusinessDraftState, type BusinessPublicationSnapshot } from "../../../db/queries/business-publication.server";
import { buildSafeMiniWebConfiguration } from "../../../app/features/miniweb/registry";

test("reintenta una lectura si otro editor cambia el borrador durante el loader", async () => {
  let revision = 4;
  let data = { profile: "Perfil A", hours: ["09:00"], configuration: "MiniWeb A" };
  let startFirstRead!: () => void;
  let finishFirstRead!: () => void;
  const started = new Promise<void>((resolve) => { startFirstRead = resolve; });
  const release = new Promise<void>((resolve) => { finishFirstRead = resolve; });
  let reads = 0;

  const loadingEditorA = readConsistentBusinessDraftState(
    async () => revision,
    async () => {
      reads += 1;
      const captured = structuredClone(data);
      if (reads === 1) {
        startFirstRead();
        await release;
      }
      return captured;
    },
  );

  await started;
  data = { profile: "Perfil B", hours: ["10:00"], configuration: "MiniWeb B" };
  revision += 1;
  finishFirstRead();

  const loaded = await loadingEditorA;
  assert.equal(reads, 2, "el loader repite la lectura después de detectar la revisión nueva");
  assert.equal(loaded.draftRevision, 5);
  assert.deepEqual(loaded.data, data, "perfil, horarios y configuración pertenecen a la revisión devuelta");

  const staleWrite = (expectedRevision: number, nextProfile: string) => {
    if (expectedRevision !== revision) throw new Response("stale", { status: 409 });
    data = { ...data, profile: nextProfile };
    revision += 1;
  };
  assert.throws(() => staleWrite(4, "Perfil A reescrito"), { status: 409 });
  assert.equal(data.profile, "Perfil B", "el editor obsoleto no sobrescribe el guardado del editor B");
});

test("rechaza la carga cuando no logra observar una revisión estable", async () => {
  let revision = 0;
  await assert.rejects(
    readConsistentBusinessDraftState(
      async () => revision++,
      async () => ({ profile: "Perfil", hours: [], configuration: {} }),
      2,
    ),
    (error: unknown) => error instanceof Response && error.status === 409,
  );
});

test("la publicación vigente compara perfil, contacto, horarios y configuración como un solo snapshot", () => {
  const profile: BusinessPublicationSnapshot["profile"] = {
    slug: "taller-central",
    displayName: "Taller Central",
    shortDescription: "Reparación y mantenimiento",
    description: "Atención local para equipos de trabajo.",
    category: "Servicios",
    city: "Bogotá",
    country: "Colombia",
    phone: "+573001112233",
    publicEmail: "contacto@example.invalid",
    websiteUrl: null,
    logoUrl: null,
    whatsapp: null,
    instagramUrl: null,
    facebookUrl: null,
    linkedinUrl: null,
    serviceMode: "in_person",
    serviceArea: "Bogotá",
  };
  const hours = [{ dayOfWeek: 1, isClosed: false, opensAt: "09:00", closesAt: "17:00" }];
  const configuration = buildSafeMiniWebConfiguration();
  const snapshot: BusinessPublicationSnapshot = { schemaVersion: 1, profile, hours, configuration };

  assert.equal(isBusinessPublicationCurrent(1, snapshot, structuredClone(snapshot)), true);
  assert.equal(isBusinessPublicationCurrent(0, snapshot, structuredClone(snapshot)), false, "una fila inicializada pero no publicada no cuenta como publicada");
  assert.equal(isBusinessPublicationCurrent(1, snapshot, { ...structuredClone(snapshot), profile: { ...profile, phone: "+573009998877" } }), false, "un cambio solo de teléfono deja pendiente la publicación");
  assert.equal(isBusinessPublicationCurrent(1, snapshot, { ...structuredClone(snapshot), profile: { ...profile, description: "Descripción editada" } }), false, "un cambio solo de descripción deja pendiente la publicación");
  assert.equal(isBusinessPublicationCurrent(1, snapshot, { ...structuredClone(snapshot), hours: [{ ...hours[0], closesAt: "18:00" }] }), false, "un cambio solo de horario deja pendiente la publicación");
  assert.equal(isBusinessPublicationCurrent(1, snapshot, { ...structuredClone(snapshot), configuration: { ...configuration, modules: configuration.modules.map((module, index) => index === 0 ? { ...module, enabled: !module.enabled } : module) } }), false, "un cambio de diseño también deja pendiente la publicación");
  assert.equal(isBusinessPublicationCurrent(1, snapshot, null), false, "un snapshot ausente falla cerrado");
});
