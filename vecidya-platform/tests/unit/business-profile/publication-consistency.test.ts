import assert from "node:assert/strict";
import { test } from "node:test";

import { readConsistentBusinessDraftState } from "../../../db/queries/business-publication.server";

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
