# Diagnostic V9 — CLASS-05 Closure Register

**Versión:** 0.1.1  
**Fecha:** 2026-11-01  
**Estado:** PLAN_ONLY · DOCUMENTACIÓN LISTA PARA REVISIÓN HUMANA · NO APROBADA  
**Rama:** `feat/diagnostic-v9-lex-graph-p1b`

## 1. Propósito

Consolidar CLASS-05 sin convertir propuestas documentadas en autorización de código.

CLASS-05 exige:
1. aprobación humana;
2. implementación aislada;
3. pruebas focales autorizadas.

Los ocho paquetes DEC-A…H ya están preparados. Ninguna decisión está marcada APPROVED por este registro.

## 2. Estado A–H

| DEC | Tema | Estado |
|---|---|---|
| A | Taxonomía/aplicabilidad 8×10 | READY_FOR_HUMAN_REVIEW |
| B | Calibración, score, confianza | READY_FOR_HUMAN_REVIEW |
| C | Banco editorial 77/82/90 | READY_FOR_HUMAN_REVIEW |
| D | Correlación/procedencia/replay | READY_FOR_HUMAN_REVIEW |
| E | Identidad, retención, informe | READY_FOR_HUMAN_REVIEW |
| F | Prioridad, presupuesto, fallbacks | READY_FOR_HUMAN_REVIEW |
| G | Aprende, servicios, GHL | READY_FOR_HUMAN_REVIEW |
| H | Main, corte, rollback | READY_FOR_HUMAN_REVIEW |

Fuente de estado: `DIAGNOSTIC-V9-CLASS05-APPROVAL-MATRIX.md` v0.1.8, blob `4a664f6feafd0bffafd74fc9acaa250f8c673353`.

## 3. Paquetes de decisión

### DEC-A
`DIAGNOSTIC-V9-DECA-DIMENSION-TAXONOMY-DECISION-PACK.md`

Propone:
- conservar ocho IDs técnicos;
- nombres/fronteras públicas;
- familias de aplicabilidad U/O/S;
- matriz 8×10;
- reglas de solapamiento.

Pendiente: aprobación humana de taxonomía y casos límite.

### DEC-B
`DIAGNOSTIC-V9-DECB-CALIBRATION-SCORE-DECISION-PACK.md`

Propone:
- contribuciones ordinales baseline;
- direct-required/supporting capped;
- neutralidad null;
- gate 3 dimensiones + 60% aplicables;
- igual ponderación provisional;
- no aprobar aún bandas públicas.

**Bloqueo P0:** pipeline candidato declara calibración v4, mientras Worker replay/finalización inspeccionados caen al default v2; `scoring_version` no está ligado estáticamente a una calibration identity.

### DEC-C
`DIAGNOSTIC-V9-DECC-EDITORIAL-BANK-90-DECISION-PACK.md`

Propone:
- banco 77 como baseline efectivo;
- 18 KEEP;
- 59 REWRITE versionados;
- cinco ADD del banco 82 pending;
- ocho probes del banco 90 pending;
- real estate sin sustitución todavía.

### DEC-D
`DIAGNOSTIC-V9-DECD-OBSERVATION-CORRELATION-DECISION-PACK.md`

Propone:
- constructKey/overlapGroup editorial;
- eventKey/periodKey runtime en grupos de solapamiento;
- correlación explícita/verificada;
- fail-closed ante conflicto/unmapped;
- persistencia/replay de deduplicación.

**Bloqueo P0:** questionId distinto no demuestra observación independiente.

### DEC-E
`DIAGNOSTIC-V9-DECE-IDENTITY-RETENTION-REPORT-DECISION-PACK.md`

Propone separación:
- borrador anónimo local;
- procesamiento de evaluación;
- resultado/informe identificado;
- analítica anónima agregada.

**Bloqueo P0:** prototipo actual persiste runs/eventos anónimos individuales en D1, mientras D-V9-029/033 aprobó borrador local y analítica D1 no reconstruible. Debe decidirse además si “D1 analytics-only” aplica a toda D1 o solo a su capa de analítica.

### DEC-F
`DIAGNOSTIC-V9-DECF-PRIORITY-BUDGET-FALLBACK-DECISION-PACK.md`

Propone:
- separar selector de preguntas de ranking de acciones;
- política 24 + hasta 5;
- definición de evidencia crítica;
- multicriterio impacto/urgencia/esfuerzo/objetivos sin pesos inventados;
- fallbacks verify/prepare/genérico.

**Bloqueo P0:** planner/Worker actual mantiene hard cap 24 y rechaza >24; política aprobada exige posibilidad 24+5 con consentimiento.

### DEC-G
`DIAGNOSTIC-V9-DECG-LEARN-SERVICES-GHL-DECISION-PACK.md`

Propone capas:
`Diagnóstico → acción → Aprende → servicios Vecidya → GHL opcional`.

Invariantes:
- acción útil sin compra;
- catálogos read-only posteriores al ranking;
- GHL no modifica evaluación ni recibe respuestas por defecto.

### DEC-H
`DIAGNOSTIC-V9-DECH-MAIN-CUTOVER-ROLLBACK-DECISION-PACK.md`

Estado Git revalidado:
- PR #162 open/draft/dirty;
- HEAD auditado al preparar paquete: `fb0fad4c84c093665e60c8e065c4abcb853235d8`;
- main: `e92c10e9ebcbb87768661eb383f16564340e63cf`;
- rama diverged: +657 / -50 desde merge-base;
- 10 rutas exactas modificadas en ambos lados;
- migraciones distintas 0030–0035 en main y rama V9.

**Bloqueo P0:** reconciliar historia de migraciones antes de F00.

## 4. Hoja ejecutiva y alcance condicional

Se añadieron dos artefactos de consolidación:

- `DIAGNOSTIC-V9-HUMAN-DECISION-SHEET-A-H.md` — recomendación compacta de disposición A–H; no es aprobación.
- `DIAGNOSTIC-V9-POST-APPROVAL-IMPLEMENTATION-SCOPE.md` — waves W0–W10 y orden incremental de ejecución condicionado a aprobación y levantamiento parcial de PLAN_ONLY.

Recomendación consolidada actual, **no aprobada**:
- A APPROVED;
- B APPROVED_WITH_FALLBACK;
- C APPROVED_WITH_FALLBACK;
- D APPROVED;
- E APPROVED_WITH_FALLBACK;
- F APPROVED;
- G APPROVED;
- H APPROVED_WITH_FALLBACK.

La hoja conserva los P0 y no autoriza código.

## 5. Orden recomendado de aprobación

1. **A** — definir qué se evalúa.
2. **C** — aprobar qué se pregunta.
3. **D** — definir cuándo dos evidencias son el mismo hecho.
4. **B** — calibrar después de A/C/D.
5. **F** — cerrar selección/ranking/presupuesto.
6. **E** — cerrar persistencia/identidad/informe.
7. **G** — cerrar enriquecimientos externos.
8. **H** — autorizar estrategia de integración/corte.

El orden evita calibrar un banco no aprobado o diseñar corte sobre contratos aún variables.

## 6. Condición de aprobación

Cada DEC debe registrar:
- APPROVED / APPROVED_WITH_FALLBACK / DEFERRED / REJECTED;
- aprobador;
- fecha;
- condiciones;
- fallback seguro.

La aprobación de una DEC no levanta PLAN_ONLY automáticamente.

## 7. Condición para READY_FOR_AGENT

Se requiere:
1. A–H aprobadas o diferidas con fallback explícito;
2. backlog F00–F10 reconciliado contra las decisiones finales;
3. scope de implementación permitido;
4. tests focales permitidos;
5. instrucción explícita de levantar PLAN_ONLY total o parcialmente.

## 8. Bloqueos transversales prioritarios

Antes de cualquier implementación amplia deben resolverse:

1. **Calibration binding:** v2/v4 + scoring_version.
2. **Observation correlation:** evitar doble conteo.
3. **Anonymous persistence:** local-only vs ledger D1 individual.
4. **24+5:** política aprobada vs hard cap 24.
5. **Migration collision:** main/V9 0030–0035.
6. **Restore/versioning:** bancos y resultados históricos.
7. **CLASS-01…04 tests:** no existen PASS actuales del SHA final.

## 9. Qué sigue permitido bajo PLAN_ONLY

- revisar A–H;
- corregir/afinar documentos;
- inventariar fuentes;
- preparar tareas F00–F10;
- preparar comandos focales futuros sin ejecutarlos.

No permitido:
- modificar TypeScript/SQL/tests/CI por estas decisiones;
- ejecutar tests para certificación;
- merge/rebase;
- renumerar migraciones;
- activar V9;
- deploy.

## 10. Estado final de CLASS-05

**CLASS-05 = DOCUMENTALMENTE PREPARADA / READY_FOR_HUMAN_REVIEW / NO APROBADA / NO READY_FOR_EXECUTION.**

El siguiente gate ya no es inventario técnico amplio: es revisión humana de A–H y resolución explícita de los bloqueos P0 antes de convertir el plan en ejecución.

## Changelog

- **0.1.1 / 2026-11-01:** se añaden hoja ejecutiva A–H y scope post-aprobación W0–W10; no cambia aprobación ni PLAN_ONLY.
- **0.1.0 / 2026-11-01:** cierre documental CLASS-05; ocho DEC listas para revisión humana, siete bloqueos transversales y gate READY_FOR_AGENT.
