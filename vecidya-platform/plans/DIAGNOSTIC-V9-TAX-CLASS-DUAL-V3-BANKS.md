# V9 — QA03B: colisión de nombres de bancos V3 y contrato de abstención
Versión 0.1.0 · 2026-10-31 · PLAN_ONLY

## Fuentes
- qa03b/bank.ts blob b4772d73e1d8b5044ba2011088db978c364097f0, líneas 136–151: evolve(question) aplica replacement[question.id] sobre historicalBank; exporta REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3 local.
- qbv2-reviewed-evidence.ts blob d3bb5edc0b504dd0257a73fccadf38dbc777540e, líneas 190–195: exporta OTRO REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3 basado en REVIEWED_CANDIDATE_QUESTIONS_V2; solo añade metadata.
- qbv2-reviewed-candidate.ts blob 03fdcf9c712e4a589d974abed31fe1a4fbb77922: incluye clasificación reviewed v2.
- specialty-candidate-bank.ts blob 0bc44cddc1dc2f03230bd5ece30847fce984a12b: candidato especializado v4.

## Hallazgo
Existen dos exports con el mismo identificador REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3, pero definidos en módulos diferentes. Son bancos diferentes; **no deben tratarse como alias ni fusionarse**.

En qa03b/bank.ts, evolve aplica replacement.q2_sector (version=3, unknown añadido), luego guardias operativas. En qbv2-reviewed-evidence.ts, el array homónimo conserva las opciones de la clasificación reviewed v2, sin unknown. El sector especializado v4 se construye a partir de la rama editorial reviewed, no del banco evolucionado qa03b/bank.ts.

## Contrato propuesto para unknown
1. Mantener respuesta desconocida como unknown/uncertainty, sin convertirla en other ni inferir nicheGroup.
2. En un futuro cambio de banco, no reescribir automáticamente respuestas antiguas: conservar id, version, value, fuente y fecha.
3. Diseñar opción explícita de abstención para el candidato v4 o una salida de UX equivalente; exigir aprobación antes de cambiar código.
4. Si no hay sector específico, no mostrar selectores condicionados a eqV2(q2_sector, group).
5. Revisar con casos focales: unknown v3; other v2; cambio unknown→sector; sector→unknown; replay antiguo y mezcla de versiones.
6. No asumir que falta de respuesta significa unknown: distinguir unanswered de respuesta explícita.

## Implicación para cierre
La discrepancia no es solo de cantidad de opciones: el mismo nombre de export V3 designa dos árboles de composición. CLASS-02B pasa a PARCIAL CON CAUSA IDENTIFICADA; CLASS-02D permanece abierto hasta aprobación y prueba.

## Changelog
0.1.0: documentada la colisión nominal y el contrato de abstención, sin cambios de runtime.
