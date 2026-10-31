# Diagnóstico V9 — TAX-CLASS: resolución del ensamblador de sector
Versión 0.1.0 · 2026-10-31 · PLAN_ONLY

## Evidencia de archivos
- qbv2-reviewed-classification.ts SHA 8807cbe1b920923e667b7afb9b64df350b35ae95: q2_sector reviewed version=2, 14 values específicos + other.
- qbv2-reviewed-candidate.ts SHA 03fdcf9c712e4a589d974abed31fe1a4fbb77922: REVIEWED_CANDIDATE_QUESTIONS_V2 incluye REVIEWED_CLASSIFICATION_QUESTIONS_V2.
- qbv2-reviewed-evidence.ts SHA d3bb5edc0b504dd0257a73fccadf38dbc777540e: REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3 solo añade metadata de evidencia; conserva options.
- qa03b/editorial-copy.ts SHA 4f600136c6761669e99a2d9f9302afb0f084d195: applyQA03BEditorialCopy cambia prompt/hint/variant prompts; no options.
- qa03b/specialty-candidate-bank.ts SHA 0bc44cddc1dc2f03230bd5ece30847fce984a12b: q2_sector candidato v4 conserva originales excepto temporalmente other/unknown, agrega cuatro values y repone los existentes.

## Resultado de lectura estática
La cadena de composición QA03B especializada parte del sector reviewed v2, que declara 15 opciones y NO declara unknown. Por ello el candidato v4 espera 19 opciones (15 + ecommerce, creator, b2b_services, nonprofit_community). El filtro de unknown no lo agrega si no existe.

El replacement q2_sector version=3 de qa03b/bank.ts (SHA b4772d73e1d8b5044ba2011088db978c364097f0) es una ruta distinta: añade unknown al historicalBank. No es la fuente del sector especializado v4.

La nomenclatura REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3 designa la vista de evidencia y NO modifica por sí misma question.version a 3.

## Incidencia y propuesta
CLASS-02-UNKNOWN: la ruta candidata especializada v4 carece de la respuesta neutral unknown que sí incorpora el replacement v3. Requiere decisión editorial/contrato versionado: añadir opción neutral al candidato futuro, o garantizar una ruta explícita de abstención compatible, sin reescribir sesiones previas. No implementar hasta autorización.

## Gates
- CLASS-02A: RESUELTO DOCUMENTALMENTE — fuente y expectativa 19 opciones; falta test focal para certificación.
- CLASS-02B: PARCIAL — diferencia v3/v4 unknown identificada; falta inspeccionar ensamblaje final del banco v3 y sesiones históricas.
- CLASS-02C: PARCIAL — consumidores focales conocidos, censo global abierto.
- CLASS-02D: OPEN — reglas de unknown/replay y aprobación.
- CLASS-02E: OPEN — pruebas focales no ejecutadas.

## Changelog
0.1.0: origen de q2_sector v4 trazado hasta clasificación reviewed v2; conteo 19 sustentado estáticamente; brecha unknown registrada.
