# V9 — Contrato de señales derivadas y migración de respuestas
Versión 0.1.0 · 2026-10-31 · PLAN_ONLY

## Hechos observados
- qbv2-engine.ts SHA 3ee64669b626c954495d5b194da6e07a42f252d1: deriveSignalsV2 recorre respuestas activas, busca cada pregunta en el banco suministrado y lee option.produces por value.
- Opciones sin produces no emiten señales; preguntas contradictionRole=confirms no producen contexto ordinario.
- foldSignalProductions en qbv2-signals.ts SHA 3563ae11c8e385067c240c52cfb741192a67ccba ordena entradas por questionId y resuelve colisiones con fuerza de procedencia y desempate estable.
- resolveEligibleQuestionsV2 filtra IDs inexistentes en el banco, deriva señales y contexto y reduce respuestas hasta que las claves activas se estabilizan.
- qa03b/bank.ts: q2_delivery opción remote_service no declara produces; otras opciones como physical_location sí declaran deliveryMode.

## Riesgos para V9
1. Mismo questionId y mismo value NO garantizan misma señal si cambia option.produces entre bancos.
2. Una respuesta válida pero sin produces puede seguir presente sin aportar el campo esperado al contexto.
3. Cambiar sector o nicho puede cambiar elegibilidad y eliminar respuestas activas al reconciliar.
4. El fallback de la sesión usa QUESTION_BANK_V2; los bancos QA03B candidatos no se activan automáticamente.

## Revisión focal pendiente
- Comparar para cada valor de q2_sector V2/V3/V4: kind, produces, provenance, y contexto derivado.
- Revisar q2_delivery remote_service: determinar si la ausencia de produces es intencional o defecto, comprobando contrato de deliveryMode y consumidores.
- Probar un cambio de sector y la rederivación de nicho, sin conservar señales obsoletas.
- Verificar que unknown no produzca nicheGroup ni se transforme en other.
- Confirmar que las observaciones generales no aportan scoring antes de calibración.

## Límites
No se ha probado un defecto de runtime en remote_service; solo se constata ausencia de produces en su definición. No hay tests ejecutados, cambios de código, CI ni despliegue.

## Changelog
0.1.0: cadena answers→produces→signals→context→eligibility y riesgos de migración.