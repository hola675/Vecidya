# QA-03B — Fase 5: ramas especializadas sustitutivas

**Estado:** banco candidato aislado; no activado en el diagnóstico público.  
**PR:** #124.  
**Certificación:** GitHub Actions run 40245041437 — typecheck, build, regresión Diagnóstico/Aprende y **1.761/1.761** unitarias PASS.

## Objetivo

Permitir que un nicho conocido cambie una pregunta genérica por otra más específica **sin contar dos veces la misma evidencia y sin obligar a preguntar el nicho cuando solo cambia la redacción/precisión de una observación ya disponible**.

Banco anterior de especialidades: 74 definiciones. Banco candidato de esta fase: **77**.

## Tres ramas implementadas

| Nicho | Pregunta especializada | Sustituye | Evidencia |
| --- | --- | --- | --- |
| Dentista | `q2_dental_care_continuation` | `q2_appointments_rebooking` | `relationship_recurrence`, directa |
| Restaurante/cafetería/food truck | `q2_food_menu_visibility` | `q2_presence_offer_clarity` | `clarity_positioning`, directa |
| Agencia de marketing B2B | `q2_marketing_agency_scope_clarity` | `q2_presence_offer_clarity` | `clarity_positioning`, directa |

Las preguntas especializadas usan alternativas `unknown`/`not_applicable` neutrales. El selector `q2_niche_*` nunca produce evidencia de una capacidad digital.

## Hallazgo A/B inicial y corrección

Primera implementación desde sesión vacía:
- Dental: 23 → 24 preguntas, misma evidencia.
- Restaurante: 20 → 22, 9 → 10 evidencias.
- Agencia: 22 → 23, misma evidencia.

El coste adicional provenía de preguntar el nicho para desbloquear una observación cuyo significado era, en dos casos, semánticamente equivalente a una pregunta genérica. Además, un selector podía aparecer tarde después de haber contestado la pregunta genérica, sustituirla y provocar más de 24 **interacciones históricas** aunque solo hubiera 24 respuestas activas.

Se corrigió el planificador candidato con dos reglas:

1. Calcula una **firma semántica de evidencia** (dimensión, directness y mapping de estados). Si el hijo especializado tiene exactamente la misma firma que una pregunta genérica ya elegible, el nicho no cuenta como desbloqueo suficiente.
2. Una observación equivalente **ya contestada** también satisface la necesidad: el motor no pregunta el nicho tarde para repetir la misma evidencia con copy especializado.

## Resultado final desde sesión anónima

| Perfil | Banco 74 | Banco 77 | Evidencia 74 | Evidencia 77 |
| --- | ---: | ---: | ---: | ---: |
| Dental / seguimiento | 23 | **23** | 10 | **10** |
| Restaurante / claridad | 20 | **20** | 9 | **9** |
| Agencia / claridad | 22 | **22** | 11 | **11** |

En los tres casos: **0 preguntas añadidas, 0 retiradas, 0 pérdida de evidencia y mismas dimensiones pendientes**. Al no conocer todavía el nicho, la sesión usa la pregunta genérica.

## Cuando el nicho ya está conocido

Las pruebas también certifican el caso opuesto:
- `dentist` → la pregunta dental es elegible y la genérica de rebooking deja de serlo.
- `restaurant/cafe/food_truck` → visibilidad de menú sustituye a claridad genérica.
- `marketing_agency` + B2B → claridad de alcance sustituye a claridad genérica.
- Otros nichos o `other/unknown` conservan la pregunta genérica.

En esas sustituciones, la cantidad de preguntas seleccionadas no aumenta y la evidencia solo procede de la pregunta observacional, nunca del identificador de nicho.

## Consecuencia de arquitectura

El banco ya puede **usar** un nicho sin coste adicional cuando ese dato existe, pero el diagnóstico anónimo todavía necesita una forma de **capturarlo sin otra pantalla**. Preguntarlo como un paso separado solo está justificado si abre una observación incremental, no si sirve únicamente para adaptar el copy.

La siguiente fase debe prototipar un contrato V9 de **interacción de clasificación compuesta**: sector y especialidad pueden producir dos respuestas/contextos, pero deben contabilizarse como una sola interacción visible y reproducirse de forma determinista en sesión/Worker. No modificar V8 en sitio.

## Puertas pendientes

- Prototipo V9 de interacción compuesta y coste de ruta por interacción, no por número bruto de claves de respuesta.
- Transcript/replay capaz de demostrar que sector+nicho se capturaron en un único paso.
- Edición: cambiar sector debe invalidar el nicho anterior y cualquier rama especializada dependiente.
- Worker debe reconstruir exactamente el mismo contexto.
- UI accesible móvil/desktop para selección jerárquica sin una lista plana de 31 nichos.
- E2E y compatibilidad V8/V9 antes de cualquier cutover.
