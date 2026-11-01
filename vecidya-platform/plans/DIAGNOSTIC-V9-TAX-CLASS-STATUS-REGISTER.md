# Diagnostic V9 — estado consolidado TAX-CLASS CLASS-01…05

**Versión:** 0.1.2  
**Fecha:** 2026-11-01  
**Estado:** PLAN_ONLY · COMPATIBILIDAD DOCUMENTADA / EJECUCIÓN NO AUTORIZADA  
**Rama:** `feat/diagnostic-v9-lex-graph-p1b`

## 1. Resumen ejecutivo

| Clase | Alcance | Estado actual |
|---|---|---|
| CLASS-01 | inventario literal de values y ocho selectores | PARCIAL / NO CERTIFICADA |
| CLASS-02 | puente oldValue→atributos, persistencia, replay, ownership y consumers | PARCIAL / NO CERTIFICADA |
| CLASS-03 | reglas/fallbacks dental, food, agency, real estate | PARCIAL / NO CERTIFICADA |
| CLASS-04 | C01–C10, híbridos, unknown, cambio de sector, replay | PARCIAL / NO CERTIFICADA |
| CLASS-05 | aprobación humana, implementación aislada, pruebas autorizadas | READY_FOR_HUMAN_REVIEW / NO APROBADA |

Ninguna clase está certificada bajo el SHA actual porque la fase vigente continúa siendo PLAN_ONLY.

## 2. CLASS-01

Fuente principal: `DIAGNOSTIC-V9-CLASS01-CLOSURE-REGISTER.md`  
Blob `cc1179b793f3149e910d2de6fab0ca6f40386c11`.

Documentado:
- V2=15, V3=16, V4=20 valores esperados/inspeccionados;
- ocho selectores;
- semántica distinta de `other` y `unknown`;
- trazabilidad focal de consumidores;
- aceptación A01–A10 definida.

Bloqueos:
- censo completo de consumidores;
- diff final por versión;
- restore/migración;
- pruebas A01–A10 autorizadas.

## 3. CLASS-02

Fuente principal: `DIAGNOSTIC-V9-CLASS02-CLOSURE-REGISTER.md`  
Blob `26f2c08c9cd9c77d66092a210973afcf39901f98`.

Documentado:
- fuentes/bridges de atributos;
- bancos y entrypoints;
- APIs runs/events/state/finalize/result;
- banco fijado del replay;
- cinco versiones persistidas;
- ledger, seq, snapshots;
- SQL `0030..0035`;
- identidad, ownership, claim y organización;
- cobertura SQLite existente.

Bloqueos:
- ejecución focal;
- AUTH gaps exactos;
- migraciones desplegadas;
- política claim/V9 disabled.

## 4. CLASS-03

Fuente principal: `DIAGNOSTIC-V9-CLASS03-CLOSURE-REGISTER.md`  
Blob `f1e15f761d58e037acbbb1f54d3b94828eeb2260`.

Documentado:
- dental: specialty/fallback;
- food: specialty/fallback;
- marketing agency: specialty/fallback;
- tests source existentes;
- real estate: fallback genérico vigente.

Bloqueo clave:
`q2_real_estate_inquiry_entry` permanece pending y no debe sustituir `q2_professional_intake_flow` sin decisión de dimensión, evidence V3, `referral_only`, deduplicación y replay.

## 5. CLASS-04

Fuente principal: `DIAGNOSTIC-V9-CLASS04-CLOSURE-REGISTER.md`  
Blob `7f9f80d0637263c3e2d577b905c105a4ea59fbf7`.

Documentado:
- C01–C10;
- corpus de 30 personas authored;
- unknown/N-A/unanswered;
- cambio de sector y limpieza stale;
- replay/classification/D1;
- `archetype hybrid` alcanzable por multi-delivery;
- sector `unknown` aceptado estáticamente.

Bloqueos:
- C01/C04/C06 resultado end-to-end;
- C09 hybrid replay/finalization;
- test explícito sector unknown;
- businessModel hybrid no demostrado desde banco 77;
- restore/versionado entre bancos;
- ejecución focal.

## 6. CLASS-05

Fuentes:
- `DIAGNOSTIC-V9-CLASS05-HUMAN-APPROVAL-HANDOFF.md` — blob `87097824b5a160efb9fb69e77277f47710e4e49d`;
- `DIAGNOSTIC-V9-CLASS05-APPROVAL-MATRIX.md` — blob `4a664f6feafd0bffafd74fc9acaa250f8c673353`;
- `DIAGNOSTIC-V9-CLASS05-CLOSURE-REGISTER.md` — blob `903fced4ed7831b2651d9a3df3b024226179c44f`.

Preparado:
- decisiones A–H;
- propuesta/alternativa/riesgo/fallback;
- gates H1–H5;
- stop conditions;
- condición READY_FOR_AGENT;
- orden recomendado de revisión humana.

Estado:
- A–H = READY_FOR_HUMAN_REVIEW;
- ninguna DEC está APPROVED;
- PLAN_ONLY sigue vigente;
- ninguna implementación/prueba autorizada por estos documentos.

Bloqueos transversales priorizados:
- binding de calibración v2/v4;
- correlación de observaciones;
- ledger D1 anónimo vs borrador local-only;
- hard cap 24 vs política 24+5;
- colisión de migraciones main/V9 0030–0035;
- restore/versionado entre bancos;
- pruebas CLASS-01…04 sin PASS actual.

## 7. Invariantes globales

1. V8 permanece operativo hasta corte autorizado.
2. No activar banco 82/90 por conteo.
3. No migrar `pending` a evidence V3 por analogía.
4. Unknown ≠ other ≠ unanswered ≠ N/A.
5. Sector/nicho no constituye evidencia de madurez digital.
6. Diferente questionId no demuestra independencia de observación.
7. Replay debe usar banco/versiones fijadas.
8. No afirmar PASS sin comando, log y SHA exacto.
9. GHL no participa en scoring/identidad/resultados.
10. Aprende/servicios son opcionales y posteriores al diagnóstico.
11. No borrar V8/legacy/migraciones históricas antes de gates F08/F09.
12. Merge/deploy requieren autorización separada.

## 8. Consolidación ejecutiva disponible

Ya existen dos artefactos adicionales:

- `DIAGNOSTIC-V9-HUMAN-DECISION-SHEET-A-H.md`: recomendación consolidada A–H, sin aprobación implícita.
- `DIAGNOSTIC-V9-POST-APPROVAL-IMPLEMENTATION-SCOPE.md`: waves W0–W10, con F00 como primer scope recomendado si se levanta PLAN_ONLY parcialmente.

`DIAGNOSTIC-V9-READY-FOR-AGENT.md` fue actualizado a v0.1.1 y permanece `NOT_READY / PLAN_ONLY`.

## 9. Ruta de salida de PLAN_ONLY

El siguiente cambio de estado no debe ocurrir por inferencia.

Para pasar de documentación a ejecución se necesita instrucción explícita del responsable que:

- apruebe o difiera A–H con fallback;
- identifique fases/tareas F00–F10 habilitadas;
- indique alcance de archivos/cambios;
- autorice comandos focales;
- especifique si PLAN_ONLY se levanta parcial o totalmente.

Hasta esa instrucción, el trabajo permitido sigue siendo lectura y documentación.

## 10. Estado global

**TAX-CLASS CLASS-01…05: DOCUMENTACIÓN AVANZADA / NO CERTIFICADA / NO READY FOR EXECUTION.**

La deuda principal ya no es descubrir cómo funciona el código, sino cerrar decisiones humanas, ejecutar aceptación focal autorizada y asociar resultados al SHA final.

## Changelog

- **0.1.2 / 2026-11-01:** se incorporan la hoja ejecutiva A–H, el scope condicional W0–W10 y el READY_FOR_AGENT actualizado; no cambia el estado de ejecución.
- **0.1.1 / 2026-11-01:** CLASS-05 queda documentalmente lista para revisión humana; A–H tienen paquetes propios, sin aprobación ni ejecución; se registran bloqueos transversales P0.
- **0.1.0 / 2026-10-31:** consolidación global CLASS-01…05, invariantes y gate de salida de PLAN_ONLY.
