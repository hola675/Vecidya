# Diagnostic V9 — DEC-B: calibración, score, confianza y binding de versión

**Versión:** 0.1.1  
**Fecha:** 2026-11-01  
**Estado:** PLAN_ONLY · RATIFICADO VÍA HOJA A–H · IMPLEMENTACIÓN NO AUTORIZADA  
**Rama:** `feat/diagnostic-v9-lex-graph-p1b`

## Nota de autoridad documental

El estado de decisión de este paquete es histórico y queda **supersedido para status** por `DIAGNOSTIC-V9-HUMAN-DECISION-SHEET-A-H.md`. Las propuestas, riesgos y criterios técnicos de este archivo siguen siendo referencia; cualquier frase interna “NO APROBADO”, “READY_FOR_HUMAN_REVIEW” u “OPEN” describe el momento de redacción original y **no reabre** la decisión humana ya registrada. PLAN_ONLY sigue vigente para runtime.

## 1. Objetivo

DEC-B debe decidir qué números puede producir y publicar V9, bajo qué suficiencia de evidencia y con qué identidad reproducible.

No se modifica scorer, calibración, Worker, finalización, variables de entorno ni resultados persistidos.

## 2. Fuentes principales

- `qbv2-candidate-calibration.ts` — blob `52bdc204dee6755d723b119e136296a578a06ba1`.
- `qbv2-contextual-scoring.ts` — blob `11c2a601c4f1bcbfc243dd49635a309191d8d0c3`.
- `qa03b/v9-candidate-scoring.ts` — blob `339c68a445861a3fea24ccb4b18a96adfc9e59a7`.
- `qa03b/qbv2-candidate-pipeline.ts` — blob `b194e7c62cdaa50ad02f63ab4df688596d8087ec`.
- `qa03b/worker-replay-v9.server.ts` — blob `f77b1d3c5946b75d465e0a24a89411a3d62cfe31`.
- `qa03b/v9-finalization.server.ts` — blob `8367a67bd5edb15d4d6bd486726bddd23bd06b0f`.
- `qbv2-r8b-dimension-calibration.test.ts` y `qbv2-r8c-overall-calibration.test.ts`: evidencia histórica de experimentos/calibración; no PASS del HEAD actual.

## 3. Semántica numérica observada

Las calibraciones v1–v4 conservan las mismas contribuciones de estado:

| Estado | Contribución |
|---|---:|
| strong | 1.00 |
| established | 0.75 |
| partial | 0.50 |
| weak | 0.25 |
| dependency | 0.25 |
| missing | 0.00 |
| constraint | null |
| uncertainty | null |
| not_applicable | null |

Modelo de agregación observado:
- directa = peso 1;
- supporting = peso 0.5;
- supporting total limitado a 50% del peso directo;
- supporting-only no produce score;
- N/A/uncertainty/constraint no se convierten en cero;
- una dimensión no aplicable no produce score.

**Propuesta:** conservar estos valores como **baseline técnico** para revisión, no como calibración empíricamente aprobada.

## 4. Confianza por dimensión

### v1
- mediumAt = 1.5
- highAt = 3

### v2/v3/v4
- mediumAt = 1
- highAt = 2
- supportingWeight = 0.5

La motivación documentada de v2 es que:
- una observación directa limpia puede alcanzar confianza media;
- dos directas coherentes pueden alcanzar alta;
- supporting no puede elevar una sola directa a alta;
- contradicción/uncertainty penalizan.

**Propuesta:** RETAIN como hipótesis operativa hasta que DEC-D elimine doble observación del mismo hecho. Sin correlación, dos IDs distintos pueden producir una falsa “corroboración”.

## 5. Modelos overall existentes

### Baseline v1/v2
- minScoredDimensions = 3;
- minCoverage = 1/3;
- bands históricos 41/71.

### Representative v3
- minScoredDimensions = 3;
- minCoverage = 0.60;
- coverageBasis = applicable_dimensions;
- bands 41/71.

### Quartiles v4
- minScoredDimensions = 3;
- minCoverage = 0.60;
- coverageBasis = applicable_dimensions;
- bands 26/51/76;
- severity: materialBelow 50, moderateBelow 75;
- scoreRanges v4.

El comentario fuente de v4 declara expresamente que las cuatro franjas enteras son una decisión determinista y **no validación empírica**.

## 6. Propuesta DEC-B — separar cuatro decisiones

### B1 — semántica de estado
**Propuesta:** conservar provisionalmente 1/.75/.5/.25/0 y null para estados neutrales.

**Condición:** no aprobar como “verdad estadística”; son una escala ordinal normalizada.

### B2 — score por dimensión
**Propuesta:**
- exigir al menos una observación directa válida para score;
- supporting solo refina;
- supporting-only = null;
- N/A/uncertainty/constraint = null;
- deduplicar/correlacionar antes de agregación según DEC-D.

### B3 — suficiencia del índice global
**Propuesta:** usar como gate futuro:
- mínimo 3 dimensiones puntuadas;
- mínimo 60% de dimensiones aplicables cubiertas;
- denominator = applicable_dimensions.

Esto sigue la variante representativa/v4 y evita que dimensiones estructuralmente no aplicables se cuenten como ausencia.

**No aprobado** hasta pruebas C01–C10.

### B4 — bandas públicas
**Propuesta:** NO aprobar aún 26/51/76 ni 41/71 como lenguaje público final.

Razón:
- las franjas v4 son deterministas, no empíricas;
- las pruebas históricas son corpus de ingeniería, no ground truth externo;
- DEC-A/C/D aún condicionan qué evidencia entra al score.

**Fallback seguro:** mostrar descripción cualitativa y, cuando exista evidencia suficiente, números por dimensión sin convertirlos automáticamente en una etiqueta global definitiva.

## 7. Bloqueo P0 — identidad de calibración no está cerrada en V9

### 7.1 Pipeline candidato
`runCandidateDiagnosticPipelineV3` usa por defecto `CANDIDATE_CALIBRATION_ACTIVE_V4`.

Su `CANDIDATE_RESULT_IDENTITY_V3` incluye:
- calibration = `diag-v3-candidate-calibration-v4`;
- calibrationVersion = 4;
- overall = la misma identidad de calibración.

### 7.2 Worker replay V9
`worker-replay-v9.server.ts` llama `scoreCandidateContextualDimensionsV3` sin pasar `calibration`.

El scorer V9 usa como default `CANDIDATE_CALIBRATION_V3`, que actualmente apunta a **R8B v2**.

Además, `QA03B_V9_CORE_RESULT_IDENTITY` no contiene calibration ID/version.

### 7.3 Finalización V9
`v9-finalization.server.ts` llama `buildCandidateRecommendationsAndSolutionsV3` sin calibration explícita.

Ese orquestador también cae al default `CANDIDATE_CALIBRATION_V3` = **v2**.

Por eso replay y finalización pueden concordar entre sí usando v2, mientras el pipeline candidato declara v4.

### 7.4 Metadata persistida
Los runs V9 persisten `scoring_version` desde `DIAGNOSTIC_V9_SCORING_VERSION`, pero la lectura estática inspeccionada no demuestra un registry que vincule ese string a una instancia concreta `CANDIDATE_CALIBRATION_*`.

**Conclusión:** existe una **ambigüedad/inconsistencia de binding de calibración**. No se afirma impacto en producción porque:
- no se verificaron variables desplegadas;
- no se ejecutó el runtime;
- el flujo público efectivo no se certificó.

Sí bloquea reproducibilidad/certificación de DEC-B.

## 8. Propuesta de binding futuro

Antes de certificar scoring:

1. definir un registry explícito `scoring_version → calibration identity/version`;
2. el run persiste el scoring version seleccionado por servidor;
3. Worker replay resuelve esa misma calibración explícitamente;
4. finalization usa exactamente la misma;
5. result identity incluye calibration ID/version;
6. replay de un run histórico usa su calibración histórica o falla cerrado si no está soportada;
7. no usar “default calibration” en rutas autoritativas;
8. mismatch entre env label, run metadata y calibration code debe fallar cerrado.

No implementar durante PLAN_ONLY.

## 9. Score global: política propuesta

### Publicar número global solo si:
- DEC-A applicability estable;
- DEC-C banco/evidence aprobados;
- DEC-D correlación aplicada;
- >=3 dimensiones con score directo;
- >=60% de dimensiones aplicables cubiertas;
- sin conflicto de correlación;
- calibration identity conocida y persistida;
- replay reproducible.

### Si no:
mostrar:
- estado cualitativo;
- dimensiones con evidencia;
- dimensiones insuficientes/no aplicables;
- incertidumbre;
- prioridades justificadas;
- **sin fabricar un global**.

## 10. Igual ponderación de dimensiones

El modelo actual usa media simple de dimensiones puntuadas.

**Propuesta:** RETAIN provisionalmente igual ponderación porque:
- es explicable;
- evita inventar pesos sectoriales;
- no existe base empírica auditada para pesos diferentes.

**No aprobado como calibración final.**

Cualquier ponderación futura exige:
- razón de producto;
- corpus;
- sensibilidad;
- estabilidad C01–C10;
- versionado.

## 11. Confianza global

La configuración observada usa:
- mediumCoverage = 0.5;
- highCoverage = 0.75;
- share = 0.5.

Las pruebas R8-C modelan cobertura + corroboración, pero no constituyen validación empírica.

**Propuesta:** mantener esta mecánica solo como baseline experimental. La etiqueta pública de confianza debe expresarse como suficiencia de evidencia, no probabilidad estadística.

## 12. Casos futuros de aceptación — NO EJECUTADOS

| ID | Caso | Esperado |
|---|---|---|
| B01 | 1 direct established | score dimensión definido; confianza no high |
| B02 | supporting-only | score null |
| B03 | unknown/N-A | contribution null; no cero |
| B04 | dos lecturas mismo evento | deduplicar antes de confianza |
| B05 | 2 direct independientes coherentes | confianza puede subir |
| B06 | conflicto mismo evento | fail-closed / no score-safe |
| B07 | 2 de 8 aplicables puntuadas | global null |
| B08 | >=3 y <60% aplicables | global null |
| B09 | >=3 y >=60% aplicables | global elegible, sujeto a calibration ID |
| B10 | prelaunch | sin global operativo si política lo excluye |
| B11 | browser/replay/finalization mismo run | mismas dimensiones/overall/calibration identity |
| B12 | run v2 histórico bajo código v4 | usa v2 explícita o rechaza; nunca recalibra silenciosamente |
| B13 | env scoring_version no registrado | fail-closed |
| B14 | cambiar bandas sin cambiar calibration version | prohibido |

## 13. Decisión humana requerida

DEC-B puede marcarse APPROVED solo si se confirma:

1. contribuciones ordinales baseline o sus reemplazos;
2. direct-required + supporting cap;
3. neutralidad null;
4. gate 3 dimensiones + 60% aplicables;
5. igual ponderación o alternativa;
6. política de score global insuficiente;
7. tratamiento de confianza;
8. **no aprobar todavía bandas 26/51/76 salvo decisión expresa**;
9. binding obligatorio de `scoring_version` a calibration identity/version;
10. replay/finalization sin defaults implícitos.

## 14. Dependencias

- DEC-A define aplicabilidad.
- DEC-C define qué evidence existe.
- DEC-D deduplica/correlaciona.
- DEC-B calibra después.

No cerrar B antes de A/C/D.

## 15. Estado

**DEC-B = READY_FOR_HUMAN_REVIEW / NO APROBADO.**

Bloqueo principal: reproducibilidad de calibración v2/v4 no está ligada de forma explícita a la identidad del run/result en las rutas autoritativas inspeccionadas.

## Changelog

- **0.1.1 / 2026-11-03:** estado de decisión reconciliado con hoja humana A–H; el contenido técnico permanece como referencia histórica y PLAN_ONLY sigue vigente.

- **0.1.0 / 2026-11-01:** paquete DEC-B; contribuciones, confianza, cobertura, overall y bloqueo P0 de binding v2/v4.
