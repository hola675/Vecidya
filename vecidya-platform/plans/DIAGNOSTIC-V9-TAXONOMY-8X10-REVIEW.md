# Diagnóstico V9 — CONSOL-01: matriz de taxonomía 8×10 para dictamen
Versión 0.1.0 | 2026-10-31 | PLAN_ONLY | ESTADO: PROPUESTA NO APROBADA

## 0. Fuentes y alcance
Derivado de plans/DIAGNOSTIC-V9-MASTER-FINALIZATION-PLAN.md (secciones 24, 42–48 y 60), plans/DIAGNOSTIC-V9-EVALUATION-MODEL-V1.md y registro de cierre v0.2.0. La decisión V9-TAX-A aprueba **auditar las ocho dimensiones candidatas**, no su taxonomía final. Esta matriz es conceptual, NO resultado de ejecutar el grafo, medir cobertura o revisar las 90 preguntas/opciones. No cambiar código ni aprobar scoring.

## 1. Dimensiones candidatas y dictamen provisional
| ID técnico existente | Nombre público candidato ES | Significado que SÍ puede evaluar | Exclusiones/alertas |
| --- | --- | --- | --- |
| clarity_positioning | Claridad de la oferta y propósito | Destinatario, propuesta comprensible y siguiente valor | No exigir ventas, monetización ni oferta publicada |
| digital_foundation | Presencia y accesibilidad digital | Canales pertinentes disponibles, información coherente y acceso | No exigir web propia ni perfiles sociales por defecto |
| discovery | Descubrimiento y alcance | Vías pertinentes para que destinatarios encuentren la actividad | No exigir publicidad pagada, tráfico o crecimiento |
| trust_reputation | Confianza y señales de respaldo | Señales de confianza pertinentes al sector y etapa | No penalizar ausencia de reseñas públicas |
| conversion_access | Contacto y siguiente paso | Claridad y fricción para contactar, solicitar, reservar o actuar | No equiparar conversión con venta o pago |
| relationship_recurrence | Relación y continuidad | Seguimiento pertinente y continuidad consentida | No exigir recurrencia ni contacto sin permiso |
| measurement_optimization | Medición y aprendizaje | Observación, revisión y mejora proporcionales a la etapa | No exigir CRM, analítica avanzada ni actividad inexistente |
| digital_readiness | Capacidad para actuar digitalmente | Responsables, procesos y recursos para ejecutar mejoras | No puntuar capacidad operativa general como digital sin evidencia |

**Dictamen provisional:** RETAIN_AS_CANDIDATE las ocho; REVIEW_OVERLAP digital_foundation/discovery, clarity_positioning/conversion_access, relationship_recurrence/digital_readiness y discovery/measurement_optimization. No aprobar fusiones ni pesos sin TAX-G2/TAX-G3.

## 2. Matriz conceptual 8×10
Leyenda: E = dimensión posiblemente pertinente, sujeta a evidencia directa y aplicabilidad; C = pertinencia condicionada por modalidad, objetivo o etapa; N = no inferir puntuación; no es un resultado de alcanzabilidad.
Los códigos C01–C10 son los escenarios del plan maestro; validar descripción literal y subvariantes contra la matriz de escenarios antes de aprobar esta tabla.

| Dimensión | C01 | C02 | C03 | C04 | C05 | C06 | C07 | C08 | C09 | C10 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| clarity_positioning | E | E | E | E | E | E | E | E | E | E |
| digital_foundation | C | C | C | C | C | C | C | C | C | C |
| discovery | C | C | C | C | C | C | C | C | C | C |
| trust_reputation | C | C | C | C | C | C | C | C | C | C |
| conversion_access | C | C | C | C | C | C | C | C | C | C |
| relationship_recurrence | C | C | C | C | C | C | C | C | C | C |
| measurement_optimization | C | C | C | C | C | C | C | C | C | C |
| digital_readiness | C | C | C | C | C | C | C | C | C | C |

**Importante:** esta matriz no pretende certificar cobertura; marcar todo C como condicionada evita inventar aplicabilidad donde no hay inventario de rutas. Para C02/C03 (sin ventas o pausa), C05 (beneficiario/pagador distinto), C06 (citas), C07 (ecommerce sin consentimiento), C08 (gastronomía no publicada) y C10 (sector desconocido), aplicar las excepciones descritas en el plan maestro. No asignar nivel a dimensión por el mero hecho de estar marcada E/C.

## 3. Reglas de evidencia propuestas para ratificación
1. Clasificación/estado/sector/objetivos son contexto, nunca puntuación por sí mismos.
2. Cada evidencia debe tener dimensión, rol direct/supporting/contextual, fuente, versión, aplicabilidad y procedencia; apoyar no sustituye evidencia directa.
3. El mismo hecho no se contará dos veces por provenir de preguntas diferentes; sin identidad de evento fiable, marcar conflicto/indeterminación y abstenerse.
4. unknown, none, not_applicable, not_published y unanswered deben tener tratamiento diferenciado. V9-SEM-A solo autoriza diseñar esta separación.
5. Ante evidencia crítica faltante, repreguntar solo con consentimiento cuando exceda 24; máximo 5 turnos adicionales. Si sigue faltando, abstenerse de nivel según D-V9-017.
6. Las conclusiones públicas serán breves (D-V9-010); trazabilidad completa permanece interna, versionada.

## 4. Riesgos por escenario a contrastar con el banco real
| Caso | Preguntas candidatas citadas por el plan maestro | Verificación pendiente |
| --- | --- | --- |
| C02/C03 preparación o pausa | q2_startup_demand_signal; q2_demand_trend | No inferir ventas o tendencia por interés ni aplicar preguntas de negocio activo |
| C05 destinatario distinto del pagador | q2_buyer_recipient_relation; q2_nonprofit_support_type | Separar beneficiario, comprador y donante |
| C06 citas | q2_appointments_rebooking y sustituta dental | Alcanzabilidad, exclusión mutua y fallback |
| C07 ecommerce | q2_ecommerce_cart_followup; q2_ecommerce_cart_visibility | Consentimiento no equivale a desempeño; visibilidad no implica permiso |
| C08 gastronomía | q2_food_menu_visibility; q2_presence_offer_clarity | No publicado ≠ no aplicable; sustitución sin huecos |
| C10 desconocido | q2_sector y selectores de especialidad | Ruta genérica, neutralidad y abstención |
| Transversal | q2_local_presence_consistency; q2_local_discovery; q2_ecommerce_traffic_sources | Distinguir evidencia directa/apoyo y no duplicar hechos |

## 5. Gates de aceptación TAX-G1–G3
- TAX-G1 (OPEN): aprobación humana de nombres, definición, exclusiones y aplicabilidad de cada dimensión.
- TAX-G2 (PARTIAL): inventario por pregunta/opción/versión, es/en, evidenceV3, reglas, directness, origen y SHA; registrar revisión humana y solapamientos. No confundir mapeo QBV2 con evidencia aprobada V9.
- TAX-G3 (OPEN): trazas de alcanzabilidad C01–C10, presupuesto 24+5 y suficiencia de evidencia. Sin ejecución de pruebas durante PLAN_ONLY; especificar las futuras pruebas focalizadas.
- TAX-G4 (OPEN): pesos, umbrales y calibración; solo después de TAX-G1–G3.

## 6. Dictamen solicitado al responsable, cuando exista evidencia
Aprobar / revisar / fusionar / marcar condicional por dimensión con ejemplos C01–C10; no solicitar aprobación global sobre una matriz todavía no contrastada. La salida de CONSOL-01 será TAXONOMY_APPROVED únicamente con acta explícita y versiones.

## Changelog
- 0.1.0 / 2026-10-31: matriz conceptual conservadora 8×10, definiciones y gates; solo documentación.
