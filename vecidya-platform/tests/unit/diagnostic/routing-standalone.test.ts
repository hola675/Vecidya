import assert from "node:assert/strict";
import { test } from "node:test";

// DIAG-V3-03 fix: este archivo importa ÚNICAMENTE `routing.ts`, nunca `questions.ts`/`answers.ts`/
// `index.ts`. Antes del fix, `routing.ts` importaba `selectedValues` en tiempo de valor desde
// `./questions`, y `questions.ts` importaba los builders de `routing.ts` para construir
// `ROUTING_RULES` en su propio ámbito de módulo: si algo cargaba `routing.ts` como PRIMER módulo
// del grafo (como este archivo), el ciclo se resolvía en el sentido contrario al habitual y
// `questions.ts` intentaba leer `multiExcluding`/`eq`/etc. de `routing.ts` antes de que esas
// const se inicializaran (TDZ), lanzando `ReferenceError`. Este archivo es la prueba de que ya no
// puede pasar: `routing.ts` no depende de `questions.ts` en tiempo de valor.
import { and, eq, evaluateRule, multiExcluding, notEq } from "../../../app/features/diagnostic/routing.ts";
import type { Context } from "../../../app/features/diagnostic/types.ts";

test("routing.ts es un módulo hoja: se carga y evalúa sin questions.ts/answers.ts/index.ts", () => {
  const rule = and(eq("stage", "regular"), notEq("profile", "creator"), multiExcluding("assets", ["none", "unknown"]));
  const ctx: Context = { profile: "business", stage: "regular", answers: { assets: ["domain"] } };
  assert.equal(evaluateRule(rule, ctx), true);
});
