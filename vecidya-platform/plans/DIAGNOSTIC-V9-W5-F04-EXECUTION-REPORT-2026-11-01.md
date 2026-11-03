# Diagnostic V9 — W5/F04 Execution Report — 2026-11-01

**Estado:** DONE_WITH_EVIDENCE  
**Scope autorizado:** W5/F04 únicamente  
**Fuera de scope:** F05–F10, merge a main, migraciones remotas, staging y producción

## 1. Estado inicial
- main: `e92c10e9ebcbb87768661eb383f16564340e63cf`
- HEAD inicial F04: `d73324bdd1d48b71212947b42abec406c0b9ea55`
- PR #162: open / draft / mergeable
- branch detrás de main: 0

## 2. Scoring autónomo V9
Se consolidó un núcleo V9-owned en `app/features/diagnostic/v9/`:
- `scoring-contract.ts`
- `scoring-evidence-registry.ts`
- `scoring-calibration-registry.ts`
- `observation-correlation.ts`
- `evidence-correlation-registry.ts`
- `scoring-engine.ts`
- `overall-index.ts`

El gate estático confirma que los archivos autoritativos de scoring F04 no importan QBV2/QA03B en runtime.

## 3. Evidence registry
El registry V9-owned representa los **40 mappings migrados** del bank77 y conserva:
- questionId/version;
- dimension;
- directness;
- answer→state;
- neutralidad.

El test focal compara el registry con el contrato canónico y falla ante drift.

## 4. Correlación DEC-D
Reglas activas:
- questionId distinto no demuestra independencia;
- overlap conocido exige correlación explícita;
- mismo hecho + mismo estado → una accepted y otra deduplicated;
- eventos distintos → ambas independientes;
- mismo evento con estados incompatibles → conflict, score unsafe;
- direct gana a supporting para el mismo hecho;
- unmapped/conflict → fail-closed antes de score.

## 5. Calibración DEC-B
`scoring_version` resuelve explícitamente una calibración registrada:
- v1, v2, v3, v4 históricas;
- nueva ejecución pública: solo v4 actual;
- replay histórico: usa la versión persistida;
- versión desconocida: fail-closed.

La identidad del resultado incluye scoring version, calibration identity/version y registry/correlation identity.

## 6. Scoring
Se conserva la política aprobada:
- strong 1;
- established .75;
- partial .5;
- weak/dependency .25;
- missing 0;
- neutral states = null;
- direct requerido;
- supporting weight .5 y cap 50% del peso directo;
- supporting-only = null.

Overall v4:
- mínimo 3 dimensiones puntuadas;
- mínimo 60% de dimensiones aplicables;
- denominator applicable_dimensions;
- insuficiente → global null.

No se recalibraron números ni bandas en F04.

## 7. Evidencia focal
HEAD de código F04:
`0f8b9669ab0cf56b4df91a9c9489f23e1ea92e5b`

Run:
`41334411521`

Job:
`124931051762`

Resultado:
- **32 tests**
- **32 pass**
- **0 fail**
- typecheck/build/unit regression general: **SKIPPED**

Casos explícitos observados:
- autonomía sin imports QBV2/QA03B;
- registry histórico/current;
- 40 mappings;
- same-event dedup;
- distinct-event independence;
- conflict fail-closed;
- direct > supporting;
- direct-required / neutral-null / supporting cap;
- 3 + 60%;
- public runtime rechaza historical/unknown para runs nuevos;
- Worker replay histórico v2;
- unknown scoring version rechazado;
- finalization/replay parity.

## 8. Estado posterior
- F04-01 = DONE_WITH_EVIDENCE
- F04-02 = DONE_WITH_EVIDENCE
- F04-03 = DONE_WITH_EVIDENCE
- W5/F04 = DONE_WITH_EVIDENCE
- F05–F10 = PLAN_ONLY

No se afirma certificación integral V9: faltan F05+, integración C01–C10 completa, identidad/store final, UX/E2E, staging y corte.
