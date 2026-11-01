# Diagnostic V9 — CLASS-04: resolución focal de gaps restantes

**Versión:** 0.1.0  
**Fecha:** 2026-10-31  
**Estado:** PLAN_ONLY · LECTURA ESTÁTICA · NO CERTIFICADA  
**Rama:** `feat/diagnostic-v9-lex-graph-p1b`

## 1. C01/C04/C06: ruta hasta resultado existe, pero no hay certificación de escenario

`qa03b/v9-finalization.server.ts` (blob `8367a67bd5edb15d4d6bd486726bddd23bd06b0f`) no acepta score ni recomendaciones desde el navegador. Para un run autorizado y version-compatible:

1. reconstruye el run por replay;
2. ejecuta `buildCandidateRecommendationsAndSolutionsV3` con el banco V9 fijado;
3. compara `outcome.scoring.dimensions` con las dimensiones del replay;
4. persiste `overall`, evidence, recommendations y solutions.

El orquestador de recomendaciones V9 es `qa03b/qbv2-candidate-recommendations.ts` (blob `ff1c989a2ab34fbae2fe37aa45f2c2c9c96b5b3f`) y deriva narrativa/overall, recomendaciones y soluciones desde answers/evidence del banco.

**Conclusión:** C01, C04 y C06 tienen un camino técnico hacia resultado/recomendaciones en V9, pero no se localizó una prueba V9 específica que certifique para esos tres escenarios completos la pertinencia del resultado final. El gap se reduce de “no existe resultado” a **“falta aceptación end-to-end por escenario”**.

## 2. C09: híbrido multi-canal es alcanzable en contexto

`qa03b-context.test.ts` (blob `578bc59ca8735f0446f23c406858930049a6ea30`) contiene un caso real:
- `q2_delivery=[retail,online_checkout]`;
- resultado esperado `archetype=hybrid`;
- componentes `[ecommerce,retail]`.

`context-resolver.test.ts` (blob `5b2e4068fe127fa87f380814c724330827b667af`) prueba:
- múltiples delivery modes independientes → `hybrid`;
- componentes únicos y orden determinista;
- duplicar la misma señal no crea hybrid.

El corpus authored incluye `tienda-hibrida` con esas dos modalidades.

**Gap restante:** no se encontró replay/finalization V9 específico de `tienda-hibrida` hasta resultado persistido. Por tanto, el contexto híbrido es alcanzable, pero el caso C09 completo sigue sin certificación.

## 3. BusinessModel hybrid: soportado por motor, no demostrado por el banco V9 actual

`qbv2-signals.ts` (blob `3563ae11c8e385067c240c52cfb741192a67ccba`) define producciones de monetización con `slot: primary|secondary` y pliega `secondary` a `secondaryMonetizationMechanism`.

Sin embargo, en las fuentes de banco inspeccionadas:
- `qbv2-reviewed-foundation.ts` (blob `ceb66e18d16a1521bef7f5fa82d74782464866d2`) produce las seis monetizaciones mediante `slot:"primary"`;
- `qa03b/bank.ts` hereda esas opciones;
- `qa03b/specialty-candidate-bank.ts` y `qa03b/specialty-branches-wave1.ts` no añaden producers secundarios de monetización.

El resolver tiene tests que pueden producir `businessModel=hybrid` cuando recibe mecanismos independientes primario/secundario, pero esa capacidad del resolver **no prueba alcanzabilidad desde el banco 77**.

**Decisión documental:** para CLASS-04 actual, distinguir:
- `archetype hybrid`: alcanzable por multi-delivery;
- `businessModel hybrid`: capacidad del resolver, alcanzabilidad desde banco actual NO demostrada.

No usar el soporte del resolver para afirmar que el flujo V9 puede hoy producir businessModel hybrid por respuestas normales.

## 4. C10: sector literal unknown sí pertenece al bundle principal

`qa03b/specialty-candidate-bank.ts` (blob `0bc44cddc1dc2f03230bd5ece30847fce984a12b`) construye `QA03B_CANDIDATE_SECTOR_V4` conservando al final las opciones `other` y `unknown` del sector original.

`qa03b/v9-classification-bundle.ts` (blob `34329d64fa798904e55dd8ed743de20bcdd3c795`) crea `sectorValues` directamente desde esas opciones y `applyClassificationInteractionV9` acepta cualquier valor presente. Para `unknown`:
- no existe specialty selector asociado;
- el valor se guarda como `q2_sector=unknown`;
- la resolución posterior filtra/reevalúa answers contra el banco 77.

**Conclusión:** el gap anterior “no sabemos si unknown es aceptado por el bundle principal” queda **resuelto estáticamente**. Lo que falta es una prueba focal explícita de `applyClassificationInteractionV9(...,{sector:"unknown"})` y su replay.

## 5. C10: cambio de sector y replay ya están fuertemente representados

`qa03b-v9-classification-bundle.test.ts` (blob `b8053a1f2bb181b8e43c3fe7c421a257023a0505`) ya contiene source tests para:
- food→B2B;
- dental→food;
- agency→ecommerce;
- cambio de specialty dentro del mismo sector;
- retorno a sector previo;
- eliminación de niche/evidence especialista obsoleta;
- replay determinista;
- reclasificación sin aumentar budget;
- evento antiguo/manipulado que no descuenta interacción actual.

No ejecutados en esta auditoría.

## 6. Estado de gaps B04

| Gap | Estado documental actualizado |
|---|---|
| B04-01 tests no ejecutados | ABIERTO |
| B04-02 C01/C04/C06 resultado completo | ABIERTO: camino V9 existe; falta aceptación end-to-end específica |
| B04-03 C09 replay híbrido | ABIERTO: contexto hybrid alcanzable; falta replay/finalization del fixture |
| B04-04 businessModel hybrid alcanzable | **NO DEMOSTRADO** desde banco 77; no tratar como requisito satisfecho |
| B04-05 sector literal unknown | **RESUELTO ESTÁTICAMENTE**; falta test focal |
| B04-06 matriz única C01–C10 | RESUELTO documentalmente por `DIAGNOSTIC-V9-CLASS04-ACCEPTANCE-MATRIX.md`; ejecución pendiente |
| B04-07 compatibilidad restore entre bancos | ABIERTO |

## 7. Pruebas focales mínimas futuras — NO EJECUTADAS

1. `C04-U01`: classification bundle con `sector=unknown` → ok; sin niche especializado; replay idéntico.
2. `C04-H01`: journey `tienda-hibrida` completo → archetype hybrid; componentes ecommerce+retail; replay y finalization idénticos.
3. `C04-R01`: C01 local activo → resultado final y prioridades pertinentes, sin requisito universal de web/ads.
4. `C04-R04`: C04 profesional individual → resultado no lo presenta como empresa constituida por inferencia.
5. `C04-R06`: C06 appointments → no exige online booking salvo evidencia específica.
6. `C04-BM01`: si se pretende certificar businessModel hybrid, primero debe existir una vía del banco que produzca mecanismos independientes; sin ella, el test debe afirmar **unreachable**, no fabricar señales de test como sustituto de la ruta.

## 8. Estado

CLASS-04 sigue **PARCIAL / NO CERTIFICADA**, pero los gaps quedan ahora acotados:
- uno resuelto estáticamente (sector unknown);
- uno caracterizado como capacidad no alcanzable demostrada (businessModel hybrid);
- tres acceptance gaps end-to-end (C01/C04/C06/C09);
- restore/versionado pendiente;
- ejecución focal pendiente.

## Changelog

- **0.1.0 / 2026-10-31:** resolución focal de unknown, hybrid multi-canal, businessModel hybrid y camino de resultado C01/C04/C06.
