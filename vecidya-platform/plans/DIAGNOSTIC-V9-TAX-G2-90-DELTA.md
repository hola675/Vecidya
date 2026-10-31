# Diagnóstico V9 — TAX-G2: conciliación incremental 90 y puertas de cierre
Versión 0.1.0 | 2026-10-31 | PLAN_ONLY / SIN CERTIFICACIÓN NUEVA

## 1. Por qué no repetir el inventario
La sección 74 del plan maestro y el documento editorial v1.6.0 ya contienen una reconstrucción estática de **82/82 IDs**, con 40 mapas V3 detectados y 42 sin mapa detectable. La sección 75 y el documento editorial v1.7.0 ya contienen una auditoría de dimensiones (36 directas, 4 supporting) y una matriz de aceptación conceptual 8×10. Las secciones 76–79 incorporan ocho preguntas generales hasta 90, metadatos semánticos y pruebas focales históricas. Por tanto, NO se declara que TAX-G2 comience desde cero ni se solicita crear otro inventario 82.

## 2. Delta exacto a conciliar (82 → 90)
| Conjunto | Tamaño | Situación de evidencia | Trabajo pendiente |
| --- | ---: | --- | --- |
| Base editorial | 77 | 77 fichas con dictamen documental KEEP/REWRITE, sin implementación editorial integral | Aprobación de copy/opciones ES/EN y paridad de versiones |
| Cinco complementos | +5 | evidenceMigration=pending; sin evidenceV3; real estate tiene sustitución bloqueada | Compatibilidad de sustitución, guardias y fallback |
| Ocho generales | +8 | 7 directas condicionadas + 1 supporting-only como PROPUESTA; 40 values y 16 neutrales en metadata aislada | Correlación, selección por información nueva, pruebas de paridad y calibración |
| Total candidato | 90 | Catálogo, no entrevista de 90 turnos | Contratos completos y trazas C01–C10 |

## 3. Registros que ya existen y deben reutilizarse
- plans/DIAGNOSTIC-V9-EDITORIAL-LOTE-01.md v1.3.0: 77 fichas con dictamen.
- Mismo archivo v1.6.0: 82 IDs, linaje y versiones compuestas.
- Mismo archivo v1.7.0: ocho dimensiones y matriz 8×10 documental.
- Mismo archivo v1.8.0/1.9.0: ocho generales y borrador de evidencia.
- Mismo archivo v2.0.0: pruebas focales y riesgos del scorer.
- plans/DIAGNOSTIC-V9-TAX-G2-EVIDENCE-CLOSURE.md v0.1.0: ocho bloqueos P0.
Revalidar versiones actuales en HEAD antes de copiar cualquier dato. No duplicar ni sustituir decisiones humanas previas.

## 4. Bloqueos ordenados por dependencia
| Orden | Gate | Decisión/contrato exigido | Evidencia de cierre |
| --- | --- | --- | --- |
| 1 | TAX-CLASS | Separar sector/actividad, modelo, canal, etapa y destinatario; mantener puente para q2_sector y selectores | Tabla values antiguos→nuevos, guardias y replay |
| 2 | TAX-NEUTRAL | Distinguir unknown/none/not_applicable/not_published/unanswered y ausencia de actividad | Tabla opción×dimensión×aplicabilidad |
| 3 | TAX-PARITY | Sustituciones dental/food/agency y futura real estate con evidencia y fallback equivalente | Trazas por gate y score no perdido |
| 4 | TAX-DIRECT | Quitar presunción de digital_readiness por procesos manuales | Mapa de evidencia directa/apoyo/contexto por opción |
| 5 | TAX-CORRELATE | Confirmar procedencia del evento y regla una contribución por hecho, sin descartar hechos independientes | Contrato eventKey/constructKey/periodKey + replay y conflictos |
| 6 | TAX-EDITORIAL | Revisar 13 adiciones y 77 propuestas sin aprobar automáticamente | Matriz ES/EN por pregunta y opción, dictamen humano |
| 7 | TAX-ROUTES | Probar C01–C10, edición, sustitución, historial, abstención y 24+5 | Trazas focales sobre SHA autorizado |
| 8 | TAX-SCORE | Aprobar calibración, confianza y umbrales para resultados públicos | Casos esperados por dimensión e índice, versión activa |

## 5. Casos de regresión a preparar (NO EJECUTADOS AQUÍ)
- R01: cambio de sector/modelo no deja selectores huérfanos ni contamina replay.
- R02: food_menu_visibility not_published no equivale a not_applicable.
- R03: inmobiliaria sin evidencia V3 no suprime professional_intake_flow.
- R04: proceso manual no se puntúa como madurez digital.
- R05: dos preguntas sobre un mismo evento generan una sola contribución, dos eventos distintos se conservan.
- R06: ecommerce sin permiso no activa seguimiento, CRM ni puntuación negativa.
- R07: prelaunch sin ventas produce abstención apropiada, sin índice operativo.
- R08: ocho generales pending no alteran score del banco 82.
- R09: supporting-only de medición no crea porcentaje por sí sola.
- R10: 24+5 exige consentimiento explícito y cuenta turnos de decisión.
- R11: cambio de idioma preserva respuestas y versiones.
- R12: C01–C10 sin pérdida de evidencia crítica o fallback.

## 6. Semáforo actual
- TAX-G2: **PARCIAL**. Inventario estático de 82 existente; delta de ocho generales documentado, falta validación integral por opción/guardia y aprobación editorial.
- TAX-G3: **OPEN**. Matriz conceptual 8×10 existe; no equivale a alcanzabilidad ejecutada.
- F02/F03/F05: **OPEN**.
- Scorer P0: **OPEN**; correlador aislado no conectado.
- PLAN_ONLY: vigente para este trabajo documental; las excepciones anteriores para banco experimental no autorizan nuevas modificaciones de código.
- CI focal histórico: no es certificación del HEAD actual.

## 7. Próxima acción documental verificable
Extraer de los documentos existentes los contratos y propuestas de las 13 adiciones en un cuadro por ID, con value/semántica, regla de entrada, constructo, solapamiento, versión y aprobación; referenciar la fuente en vez de inventar campos. Luego construir el contrato TAX-CLASS y TAX-NEUTRAL antes de pedir aprobación de taxonomía definitiva.

## Changelog
- 0.1.0 / 2026-10-31: reconciliación incremental 82→90 y gates sin duplicar inventario existente; solo Markdown.
