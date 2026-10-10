import assert from "node:assert/strict";

/**
 * Comprueba los contratos metodológicos que sobreviven a una reformulación editorial.
 * Las secciones son anclas estables; las aserciones verifican el significado de O4/O6,
 * no una frase completa del copy.
 */
export async function assertCandidateMethodologyContracts(page, scenario) {
  const score = (await page.locator("#candidate-method-score").innerText()).toLocaleLowerCase("es");
  assert.match(score, /media normalizada/, `${scenario} explains normalized mean aggregation (O4)`);
  assert.match(score, /respuestas directas/, `${scenario} limits O4 aggregation to direct evidence`);
  assert.match(score, /conserva[^.]*diferencias/, `${scenario} preserves supported differences instead of hiding conflicting evidence`);

  const coverage = (await page.locator("#candidate-method-coverage").innerText()).toLocaleLowerCase("es");
  assert.match(coverage, /cobertura[^.]*solo[^.]*contexto[^.]*recorrido/, `${scenario} limits O6 coverage to context and route observability`);
  assert.match(coverage, /desconocida[^.]*no aplicable[^.]*no cuenta como capacidad ni como dificultad/, `${scenario} keeps unknown and not-applicable responses neutral`);

  const adaptive = (await page.locator("#candidate-method-adaptive").innerText()).toLocaleLowerCase("es");
  assert.match(adaptive, /pregunta pertinente[^.]*presupuesto o límite[^.]*límite de evidencia/, `${scenario} explains unasked useful questions as evidence gaps`);
}
