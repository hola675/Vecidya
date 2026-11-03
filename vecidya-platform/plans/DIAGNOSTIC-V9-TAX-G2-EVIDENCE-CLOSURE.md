# Diagnóstico V9 — TAX-G2: matriz de cierre transversal de evidencias
Versión: 0.1.0 | Fecha: 2026-10-31 | Estado: PLAN_ONLY / TAX-G2 PARCIAL / F02 OPEN
PR #162 · Rama feat/diagnostic-v9-lex-graph-p1b

## 1. Alcance y fuentes
Fuentes documentales: plans/DIAGNOSTIC-V9-MASTER-FINALIZATION-PLAN.md, especialmente secciones 44–47, 60, 68–72; plans/DIAGNOSTIC-V9-EDITORIAL-LOTE-01.md; plans/DIAGNOSTIC-V9-TAXONOMY-8X10-REVIEW.md.
No se ha ejecutado el banco, el grafo, CI ni pruebas. Esta matriz no reemplaza un inventario por opción con SHA ni acredita cobertura efectiva.

## 2. Base editorial ya documentada
- Lotes 01–10: 77 IDs con dictamen de diseño, 18 KEEP y 59 REWRITE; propuestas ES/EN no certificadas.
- Las 387 opciones y 15 variantes corresponden a inventario de referencia anterior, no a recuento actualizado.
- El plan registra ampliaciones experimentales posteriores 77→82→90; no confundir catálogo candidato con banco aprobado o cantidad de turnos.
- Las decisiones V9-TAX-A, V9-SEM-A, V9-PERSIST-A y V9-LOTES-8 autorizan criterios de diseño, no activación de scoring.
- TAX-G2 parcial; TAX-G3 no demostrado; F02 sigue OPEN.

## 3. Bloqueos P0 convertidos en fichas de resolución
| ID | Contradicción comprobada documentalmente | Fuente/ejemplos | Decisión editorial/técnica pendiente | Evidencia de cierre futura |
| --- | --- | --- | --- | --- |
| TAX-P0-01 | Sector, modelo comercial, canal y naturaleza de entidad se mezclan en q2_sector y selectores | q2_sector v4; q2_niche_b2b_services; marketing_agency | Taxonomía de clasificación, tabla de compatibilidad, guardias y replay | Mapa de todos los values, migración reversible, casos C09/C10 |
| TAX-P0-02 | Sustituciones de preguntas pueden omitir o duplicar señales | q2_marketing_agency_scope_clarity; q2_food_menu_visibility; q2_dental_care_continuation | Exclusión mutua y fallback genérico con revisión de contexto | Rutas C06/C08/C09/C10 y edición de respuestas |
| TAX-P0-03 | Organización manual se presenta como evidencia directa de madurez digital | q2_process_systemization; q2_operations_information_base; q2_b2b_qualification; q2_operations_process_ownership | Reclasificar a contexto/apoyo o exigir señal digital explícita | Matriz de directness por opción y casos sin CRM |
| TAX-P0-04 | Preguntas distintas pueden describir el mismo hecho | rate_estimate/result_recording/review_cycle/measurement_practice; seguimiento y recompra | Identidad de constructo/evento, correlación y abstención ante conflicto | Casos duplicado/independiente/ambiguo/replay |
| TAX-P0-05 | Semánticas neutrales mezcladas producen falsa puntuación | food_menu_visibility, ecommerce checkout, ausencia de consultas/reservas | Contratos distintos unknown/none/not_applicable/not_published/unanswered | Tabla por opción, elegibilidad y nivel permitido |
| TAX-P0-06 | Visibilidad de carrito no equivale a identidad ni consentimiento | q2_ecommerce_cart_visibility; q2_ecommerce_cart_followup v2 | Separar observación, permiso y acción; prohibir inferir autorización GHL | Casos sin contacto autorizado y privacidad |
| TAX-P0-07 | Validación de idea/prelaunch no demuestra madurez digital | q2_startup_demand_signal; q2_demand_trend; preguntas startup 51–53 | Separar interés, piloto, entrega real y canal digital; confirmar cambios de etapa | C02/C03, abstención y transición confirmada |
| TAX-P0-08 | Nichos incluyen modalidades/etapas en grupos que no les corresponden necesariamente | mobile_pet_grooming, software_startup, two_sided_marketplace | Clasificación sin pérdida histórica ni inferencia B2B | Compatibilidad de IDs y selección de nichos |

Nota: la sección 71 del plan registra estos riesgos como P0 de diseño, no como defectos reproducidos por tests. Se conservan como bloqueos de aceptación hasta verificar el código.

## 4. Prioridades P1
- Cobertura sectorial sin selector especializado: legal, real_estate y retail; usar fallback genérico cuando sea suficiente, ADD solo con hueco probado.
- Traducción ES/EN y accesibilidad: propuestas no equivalen a certificación de comprensión; definir revisión humana y pruebas futuras.
- Cruces de dimensiones: presencia/descubrimiento, claridad/contacto, relación/capacidad, descubrimiento/medición.

## 5. Esquema obligatorio para la matriz exhaustiva
Cada fila deberá contener:
questionId, questionVersionSource, questionVersionTarget, sourcePath, sourceBlobSha, sourceValue, optionKind, copyES, copyEN, appliesWhen, dependsOn, replacementOf, fallbackId, evidenceDimension, evidenceRole, evidenceMigration, neutralSemantics, constructKey, eventKeyProvenance, scenarioIds, editorialDecision, reviewer, approvalStatus, replayPolicy.
No completar campos no comprobados por inferencia: marcar NOT_VERIFIED. Las propuestas futuras deben separarse de valores y versiones activos.

## 6. Secuencia de cierre documental
1. Extraer de fuentes el inventario completo de preguntas y opciones para 77 y adiciones 82/90, conservando origen y SHA; no inventar recuentos.
2. Resolver TAX-P0-01, 02, 05 y 08: taxonomía/guardias/semántica antes de proponer migraciones.
3. Resolver TAX-P0-03, 04, 06 y 07: directness, eventos, consentimiento y prelaunch antes de calibrar.
4. Contrastar ocho dimensiones × C01–C10, con evidencia directa, neutral y abstención.
5. Definir revisión humana ES/EN, compatibilidad histórica y escenarios focales.
6. Presentar dictamen TAX-G1 y TAX-G2; no declarar PASS hasta que haya evidencias y aprobación explícita.

## 7. Criterios de salida
TAX-G2 READY_FOR_REVIEW solo cuando todas las opciones tengan linaje, rol, aplicabilidad y decisión documentada; TAX-G2 APPROVED requiere aprobación humana. TAX-G3 exige trazas ejecutables posteriores y presupuesto 24+5 certificado. F02 no se cierra por la suma de fichas.

## Changelog
- 0.1.0 / 2026-10-31: consolidación de ocho bloqueos P0, P1 y contrato de inventario con fuentes documentales. Sin código, CI ni despliegue.
