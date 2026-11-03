# Diagnostic V9 — DEC-C: paquete de decisión editorial del banco 77/82/90

**Versión:** 0.1.0  
**Fecha:** 2026-11-01  
**Estado:** PLAN_ONLY · RATIFICADO VÍA HOJA A–H · IMPLEMENTACIÓN NO AUTORIZADA  
**Rama:** `feat/diagnostic-v9-lex-graph-p1b`

## Nota de autoridad documental

El estado de decisión de este paquete es histórico y queda **supersedido para status** por `DIAGNOSTIC-V9-HUMAN-DECISION-SHEET-A-H.md`. Las propuestas, riesgos y criterios técnicos de este archivo siguen siendo referencia; cualquier frase interna “NO APROBADO”, “READY_FOR_HUMAN_REVIEW” u “OPEN” describe el momento de redacción original y **no reabre** la decisión humana ya registrada. PLAN_ONLY sigue vigente para runtime.

## 1. Objetivo

DEC-C debe decidir qué catálogo editorial podrá convertirse en banco V9 canónico sin confundir:
- existencia en código candidato;
- decisión editorial de diseño;
- evidenceV3 calibrada;
- activación en replay/runtime;
- certificación de rutas.

No se modifica código, banco activo, scorer, replay ni versiones.

## 2. Composición real

### Banco 77
`QA03B_SPECIALTY_BRANCH_CANDIDATE_BANK_V2`.

Estado documental acumulado:
- **77/77 fichas** con decisión editorial delegada de diseño;
- **18 KEEP**;
- **59 REWRITE**;
- **0 REMOVE** en el inventario delegado;
- estas decisiones no equivalen a implementación ni certificación.

Fuente principal: `DIAGNOSTIC-V9-EDITORIAL-LOTE-01.md` v1.3.0+.

### Banco 82
`QA03B_EXTENDED_CANDIDATE_BANK_V3` = 77 + 5 ADD.

Cinco IDs nuevos, v1, cinco opciones cada uno:
1. `q2_nonprofit_participation_entry`
2. `q2_education_enrollment_entry`
3. `q2_real_estate_inquiry_entry`
4. `q2_creative_brief_intake`
5. `q2_retail_purchase_next_step`

Los cinco:
- `routingRole=deepening`;
- prioridad refinement;
- `evidenceMigration=pending`;
- sin `evidenceV3`;
- no sustituyen por sí mismos las 77;
- no están autorizados para scoring.

Balance documental existente:
- 4 complementos condicionales;
- 1 sustitución futura condicionada (real estate);
- 0 sustituciones ejecutadas.

### Banco 90
`QA03B_GENERAL_BALANCED_CANDIDATE_BANK_V4` = 82 + 8 probes generales.

IDs:
1. `q2_general_offer_comprehension`
2. `q2_general_contact_information_consistency`
3. `q2_general_discoverability_path`
4. `q2_general_verifiable_trust_signals`
5. `q2_general_first_action_path`
6. `q2_general_pending_step_continuity`
7. `q2_general_outcome_measure_definition`
8. `q2_general_digital_execution_reliability`

Cada uno propone cubrir una dimensión distinta, pero permanece:
- `evidenceMigration=pending`;
- no puntuable;
- aislado del replay V9 fijado;
- sujeto a DEC-A/DEC-D/DEC-B.

## 3. Distinción obligatoria entre “decisión editorial” y “contrato activo”

### KEEP
Significa: la identidad/pregunta puede conservarse como base de diseño.

NO significa:
- copy bilingüe certificado;
- evidence aprobada;
- replay activado;
- que no requiera ajustes menores.

### REWRITE
Significa: existe una intención editorial documentada de nueva semántica/copy/versionado.

NO significa:
- que la versión objetivo exista en runtime;
- que se pueda reinterpretar la versión histórica;
- que una opción nueva herede evidence automáticamente.

Cada REWRITE debe implementarse como cambio versionado y volver a pasar gates de elegibilidad/evidence.

### ADD
Significa: nueva pregunta candidata.

NO significa:
- core;
- score;
- sustitución;
- pregunta obligatoria;
- ampliación automática del presupuesto.

## 4. Propuesta DEC-C1 — banco 77 como baseline efectivo

**Propuesta:** mantener el banco 77 como baseline de replay/runtime mientras DEC-C no se cierre.

Motivos:
- es el banco fijado en el replay V9 actual;
- CLASS-02 ya trazó su identidad/versionado;
- CLASS-03 demuestra que sustituir una fuente migrada por un ADD pending puede reducir evidencia certificable.

**Fallback seguro:** 77 sin activar 82/90.

**Estado:** PROPUESTO, no aprobado.

## 5. Propuesta DEC-C2 — aceptar 18 KEEP como candidatos de continuidad

**Propuesta:** aceptar los 18 KEEP como identidades que pueden conservarse en el futuro banco canónico, sujeto a:
- revisión ES/EN;
- compatibilidad de opciones/versiones;
- elegibilidad;
- evidence/deduplicación.

No confundir “KEEP” con “copiar bytes sin revisión”.

**Estado:** PROPUESTO.

## 6. Propuesta DEC-C3 — 59 REWRITE como backlog versionado, no reinterpretación

**Propuesta:** mantener las 59 decisiones REWRITE como backlog editorial aprobado solo a nivel de intención cuando exista aceptación humana.

Regla obligatoria futura:
- si cambia significado de option/value → nueva versión;
- no reinterpretar respuestas históricas;
- no migrar evidence por semejanza lingüística;
- actualizar replay/restore solo con política explícita.

**Estado:** PROPUESTO.

## 7. Propuesta DEC-C4 — cinco ADD del banco 82

### q2_nonprofit_participation_entry
**Propuesta:** RETAIN_AS_CANDIDATE.  
Constructo distinto de donación/membresía. No requiere pago.

### q2_education_enrollment_entry
**Propuesta:** RETAIN_AS_CANDIDATE.  
Entrada/inscripción ≠ pago, asistencia o plataforma.

### q2_real_estate_inquiry_entry
**Propuesta:** HOLD_FOR_SUBSTITUTION.  
CLASS-03 dejó bloqueada la sustitución de `q2_professional_intake_flow` hasta resolver:
- clarity vs conversion;
- `referral_only`;
- deduplicación;
- replay.

Puede permanecer ADD pending, pero no reemplazar ni puntuar.

### q2_creative_brief_intake
**Propuesta:** RETAIN_AS_CANDIDATE.  
No mapear a digital_readiness por el solo hecho de tratar un proceso operativo.

### q2_retail_purchase_next_step
**Propuesta:** RETAIN_AS_CANDIDATE.  
Compra física ≠ catálogo ≠ checkout ecommerce.

**Decisión conjunta propuesta:** conservar los cinco en el catálogo experimental 82; no promover ninguno a scoring todavía.

## 8. Propuesta DEC-C5 — ocho probes generales

Los ocho probes son útiles como cobertura editorial transversal, pero no deben activarse juntos con observaciones sectoriales equivalentes sin DEC-D.

**Propuesta:**
- RETAIN_AS_CANDIDATE los 8;
- mantener `pending`;
- usar DEC-A para validar constructo;
- usar DEC-D para correlación/deduplicación;
- usar DEC-B para cualquier contribution/calibración;
- solo después decidir cuáles se vuelven direct/supporting o quedan context-only.

### Riesgo P0
El scorer cuenta preguntas distintas como observaciones distintas salvo correlación compartida. Dos preguntas que describan el mismo hecho podrían inflar score/confianza.

Por ello los probes generales NO pueden migrarse en bloque a evidenceV3.

## 9. Estado de evidence en el conjunto 82/90

La reconstrucción documental de 82 detectó:
- 40 mappings V3;
- 42 sin mapping detectable.

Los 13 ADD del delta 77→90 permanecen pending.

**Interpretación:** el objetivo editorial no debe ser “hacer que 90 puntúen”. Context-only/pending/N-A son estados válidos si preservan semántica y routing.

## 10. Pruebas históricas y límite de evidencia

Existe una ejecución histórica focal para el candidato 90 en un SHA anterior (`231fba058803...`) que no certifica el HEAD actual ni las decisiones editoriales humanas.

No usar:
- PASS histórico;
- assert de longitud 90;
- unicidad de IDs;
como aprobación editorial o autorización para activar el banco.

## 11. Gates editoriales propuestos antes de banco canónico

### C-G1 — identidad y copy
Cada pregunta/opción:
- ID;
- versión;
- ES/EN;
- kind;
- neutralidad;
- help;
- condición de entrada.

### C-G2 — semántica
Cada opción debe distinguir:
- capability state;
- unknown;
- not_applicable;
- none/context-only;
- no evidencia.

### C-G3 — evidence
Para cada mapping:
- dimensión DEC-A;
- direct/supporting/contextual;
- observation/construct identity DEC-D;
- compatibilidad de versión.

### C-G4 — routing
- especialista vs genérica;
- fallback;
- cambios de sector;
- budget 24+5;
- no huecos.

### C-G5 — revisión humana
KEEP/REWRITE/REMOVE/ADD/DEFER final por pregunta/opción.

### C-G6 — runtime
Solo tras G1–G5:
- banco versionado;
- replay fijado;
- restore;
- pruebas focales.

## 12. Matriz de decisión propuesta

| Grupo | Cantidad | Propuesta |
|---|---:|---|
| 77 baseline | 77 | Mantener como contrato efectivo hasta corte autorizado |
| KEEP documentales | 18 | Candidatos de continuidad, revisión final requerida |
| REWRITE documentales | 59 | Backlog versionado; no reinterpretación histórica |
| ADD sectoriales | 5 | Mantener experimental/pending |
| Probes generales | 8 | Mantener experimental/pending |
| Total catálogo experimental | 90 | Catálogo, NO 90 turnos y NO 90 fuentes de score |

## 13. Decisión humana requerida

DEC-C puede marcarse APPROVED solo si el responsable confirma explícitamente:

1. 77 sigue siendo baseline hasta implementación/corte.
2. 18 KEEP pueden conservar identidad.
3. 59 REWRITE se implementarán versionados, no reinterpretados.
4. Cinco ADD permanecen candidatos sin scoring.
5. Real estate no sustituye aún la genérica.
6. Ocho generales permanecen pending hasta DEC-A/D/B.
7. El objetivo “90” es catálogo máximo candidato, no obligación de activación completa.
8. Ninguna pregunta se considera aprobada solo porque exista en código.

## 14. Dependencias

- DEC-A define dimensiones/aplicabilidad.
- DEC-D define independencia/correlación.
- DEC-B calibra solo evidence aprobada.
- DEC-F usa el banco aprobado para routing/prioridades.

DEC-C puede quedar lista para revisión humana antes de cerrar B/D, pero no puede habilitar scoring.

## Changelog

- **0.1.0 / 2026-11-01:** paquete DEC-C 77/82/90; 18 KEEP/59 REWRITE; cinco ADD; ocho probes; gates y propuesta conservadora de activación.
