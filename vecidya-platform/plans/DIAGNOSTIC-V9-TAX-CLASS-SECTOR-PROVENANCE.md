# V9 — Resolución estática del origen de opciones de sector
Versión 0.1.0 · 2026-10-31 · PLAN_ONLY

## Archivos verificados
- qbv2-reviewed-classification.ts SHA 8807cbe1b920923e667b7afb9b64df350b35ae95
- qbv2-reviewed-evidence.ts SHA d3bb5edc0b504dd0257a73fccadf38dbc777540e
- qa03b/bank.ts SHA b4772d73e1d8b5044ba2011088db978c364097f0
- qa03b/editorial-copy.ts SHA 4f600136c6761669e99a2d9f9302afb0f084d195
- qa03b/specialty-candidate-bank.ts SHA 0bc44cddc1dc2f03230bd5ece30847fce984a12b

## Cadena de composición identificada
REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3 = REVIEWED_CANDIDATE_QUESTIONS_V2.map(question => copia con evidenceMigration/evidenceV3 cuando corresponda). No agrega opciones ni cambia values.

qa03b/bank.ts define replacement.q2_sector v3 con options = historicalBank(q2_sector).options + unknown. Su aplicación al banco se debe confirmar en el ensamblador de QA03B.

QA03B_EDITORIAL_BASE_QUESTIONS_V9 = REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3.map(applyQA03BEditorialCopy). applyQA03BEditorialCopy reemplaza prompt, hint y prompts de variantes; no reemplaza options.

QA03B_CANDIDATE_SECTOR_V4 toma las opciones de QA03B_EDITORIAL_BASE_QUESTIONS_V9, excluye other/unknown, añade cuatro valores y reintroduce other/unknown existentes. No debe asumirse que parte de replacement.q2_sector v3: **son ramas de composición distintas en los archivos examinados**.

## Corrección de inferencia anterior
La estimación de 20 opciones para el candidato v4 NO está sustentada por esta cadena: QA03B_EDITORIAL_BASE_QUESTIONS_V9 procede directamente de REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3 y no de qa03b/bank.ts. Si esa base reviewed contiene las 15 opciones del reviewed v2 y ninguna otra, v4 contendría 19, no 20. La presencia de unknown en el replacement de qa03b/bank.ts no demuestra su presencia en QA03B_EDITORIAL_BASE_QUESTIONS_V9. Verificar origen exacto de REVIEWED_CANDIDATE_QUESTIONS_V2 antes de certificar el número.

## Riesgos
- No mezclar la versión numérica de q2_sector con el nombre del array REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3: el array V3 indica vista de evidencia, no que todas las preguntas sean versión 3.
- No declarar unknown presente en el candidato v4 sin comprobar su origen.
- El fallback para unknown/other y la edición de respuestas dependen del banco exacto que use la sesión, no de otro candidato paralelo.

## Próxima verificación focal
1. Inspeccionar REVIEWED_CANDIDATE_QUESTIONS_V2 y su q2_sector real.
2. Inspeccionar ensamblaje final QA03B para establecer si usa el replacement de bank.ts.
3. Comprobar option values exactos, únicos, unknown y other por cada export.
4. Solo con autorización, ejecutar pruebas focales de clasificación y replay.

No se ejecutaron tests, no se alteró código ni producción.

## Changelog
0.1.0: distinción de dos cadenas de composición y rectificación del conteo condicional.


## Fe de erratas v0.1.1 — importación comprobada
La conclusión anterior de dos ramas independientes para el candidato especializado es incorrecta. El archivo `qa03b/specialty-candidate-bank.ts` importa `REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3` desde `./bank`; el export local de `qa03b/bank.ts` se crea mediante `historicalBank.map(evolve)`, y `evolve` aplica `replacement.q2_sector` con la opción `unknown`. El candidato especializado v4 sí la hereda. Conteo estático esperado: 20 (15 históricas, una unknown y cuatro nuevas). No se ha ejecutado test. Esta nota prevalece sobre las inferencias anteriores.

Changelog v0.1.1: rectificada la procedencia del candidato v4.
