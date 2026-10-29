# Diagnóstico V9 — Lote editorial 01: clasificación y contexto

Versión 0.1.0 | 2026-10-29 | PR #162 | Estado: análisis parcial, pendiente de revisión humana.

## Evidencia inspeccionada
Fuente principal: `app/features/diagnostic/qa03b/bank.ts`; el banco reutiliza preguntas históricas y aplica sustituciones locales. La matriz `v9-editorial-review-matrix.ts` no acredita aprobación humana. Este documento no cambia preguntas ni puntuaciones.

| ID | Evidencia observada en código | Riesgo / propuesta de comprobación | Estado |
|---|---|---|---|
| q2_entity | Versión 3; individual, business, organization, project, unknown | Verificar que proyectos con ingresos y profesionales con marca comercial no se clasifiquen erróneamente | REVIEW |
| q2_has_customers | Versión 3; yes, no, unknown; distingue experiencias reales de seguidores/interés | Verificar usuarios y beneficiarios sin compra; mantener histórico independiente de actividad actual | REVIEW |
| q2_operational_status | Versión 1; preparing, operating, paused, unknown; requiere q2_has_customers | Comprobar que pausa no implica ausencia de historial y que el orden de preguntas no bloquea preparación | REVIEW |
| q2_customer_buyer | Versión 3; b2c, b2b, mixed, no_direct_purchase, unknown | Separar comprador de beneficiario y validar donaciones/aportes sin compra directa | REVIEW |
| q2_monetization | Versión 3; variante prelaunch; incluye no_revenue_yet de kind none | Comprobar que expectativa de ingresos no se puntúe como ingresos reales; revisar semántica de none | REVIEW |
| q2_regularity | Presente en decisiones editoriales como copy_revised; definición completa no inspeccionada en esta pasada | Extraer opciones y evidencia antes de decidir | PENDING |
| q2_demand_trend | Marcada needs_semantic_review; definición completa no inspeccionada | No mezclar clientes, ventas, citas y pedidos sin contexto | PENDING |
| q2_capacity_signal | Marcada needs_semantic_review; definición completa no inspeccionada | Separar capacidad, demanda y causas; revisar multiselección | PENDING |

## Hipótesis que requieren validación
- La clasificación no es una nota de madurez.
- `unknown` debe producir incertidumbre, no evidencia negativa.
- La actividad en preparación puede recibir acciones útiles sin declarar ventas.
- La pausa mantiene historial, pero no permite asumir disponibilidad actual.
- La diferencia comprador/beneficiario debe sobrevivir a rutas sin compra directa.

## Casos de prueba focalizados propuestos
1. Proyecto en preparación, sin clientes ni ingresos: ruta válida y diagnóstico sin puntuación ficticia.
2. Profesional independiente con marca comercial: entidad individual sin confusión con empresa.
3. Organización con beneficiarios y donaciones: no exigir venta ni comprador directo.
4. Negocio en pausa con clientes históricos: historial yes y estado paused compatibles.
5. Cambio de sector o etapa: invalidación de respuestas especializadas no aplicables.
6. Desconocido en comprador o monetización: resultado con incertidumbre explícita.

## Acciones siguientes
Extraer fichas completas de las tres preguntas pendientes desde el banco efectivo y su evidencia, y revisar opciones una por una. Después contrastar dependencias y recorridos en tests focalizados existentes; no cambiar `value`, `kind` ni scoring sin aprobación semántica. Mantener Aprende, MiniWeb y GHL fuera de este lote.

## Changelog
0.1.0: primera revisión basada en código de cinco preguntas; tres pendientes de extracción. Solo documentación, sin tests ejecutados.

## Actualización 0.2.0 — extracción de las tres preguntas restantes (2026-10-29)
**Fuentes reales:** `app/features/diagnostic/qbv2-golden.ts` para regularidad y demanda; `app/features/diagnostic/qbv2-lote-a.ts` para capacidad. Estas definiciones se incorporan al banco histórico que utiliza el candidato V9. Se trata de análisis editorial, no aprobación ni cambio runtime.

### q2_regularity (v1, single, maturity)
- Pregunta: «¿Con qué regularidad tienes actividad con clientes (ventas, servicios, citas o pedidos)?»; variante nonprofit sobre personas atendidas o que apoyan.
- Elegibilidad: `q2_has_customers=yes`.
- Respuestas: `irregular` («De forma ocasional», señal `operatingRegularity=irregular`); `regular` («De forma regular y repetible», señal `operatingRegularity=regular`).
- No existe opción `unknown`; `scoringReadiness` indica dirección neutral, sin dimensión candidata.
- **Riesgo:** actividad en pausa con clientes históricos; diferencia entre actividad habitual y actividad actual; ausencia de respuesta de incertidumbre. **Decisión propuesta: DEFER** hasta revisar rutas y casos reales; no cambiar `value` sin versionar.

### q2_demand_trend (v1, single, maturity)
- Pregunta: «En los últimos meses, ¿cómo ha cambiado la cantidad de clientes o pedidos?»; variantes nonprofit (personas atendidas o que apoyan) y clínica (pacientes o citas).
- Elegibilidad: `q2_regularity=regular`.
- Respuestas: `increasing` («Ha aumentado de forma sostenida», señal `demandTrend=increasing_observed`); `flat` («Se ha mantenido más o menos igual», señal `demandTrend=flat_or_unknown`); `decreasing` («Ha disminuido», señal `demandTrend=decreasing_observed`).
- No hay `unknown`; `scoringReadiness` es neutral y sin dimensión candidata.
- **Riesgo:** `flat` produce una señal cuyo nombre mezcla estabilidad e incertidumbre; variaciones de terminología pueden mezclar demanda, clientes, citas y apoyos. **Decisión propuesta: DEFER / revisión semántica obligatoria**, no reinterpretar señales existentes sin versión.

### q2_capacity_signal (v1, multi, maturity)
- Pregunta: «En los últimos meses, ¿qué ha pasado con tu capacidad para atender la demanda? Elige todas las que apliquen.»
- Elegibilidad: `q2_regularity=regular`.
- Respuestas: `waitlist_growing` (crecimiento de espera/trabajo pendiente; `capacityPressure=true`); `expanded` (ampliación de personas/espacio/horas; `capacityExpansion=true`); `stable` (ninguna anterior, exclusiva; `capacityPressure=false`, `capacityExpansion=false`); `unknown` (exclusiva, `kind=unknown`).
- `scoringReadiness` neutral, sin dimensión candidata; presión y expansión pueden coexistir.
- **Riesgo:** `stable` puede interpretarse como ausencia de presión aunque solo indique ausencia de cambio; no deducir madurez ni crecimiento sostenible. **Decisión propuesta: DEFER** hasta comprobar evidencia y opciones.

### Hallazgo transversal: puerta de elegibilidad
`q2_demand_trend` y `q2_capacity_signal` son hermanas dependientes de `q2_regularity=regular`. Probar si una actividad irregular, en pausa o con información insuficiente necesita una pregunta alternativa para demanda/capacidad; no relajar la puerta sin demostrar utilidad y ausencia de contradicciones.

### Pruebas focalizadas propuestas (no ejecutadas)
1. `q2_has_customers=yes` + actividad en pausa: regularidad y tendencia no deben describir actividad actual como si estuviera operando.
2. `q2_regularity=irregular`: comprobar si demanda y capacidad quedan inaccesibles y si existe cobertura alternativa.
3. `q2_demand_trend=flat`: no equiparar estabilidad a incertidumbre ni atribuir score de crecimiento.
4. `q2_capacity_signal=[waitlist_growing,expanded]`: permitir coexistencia sin convertirla en conclusión automática.
5. `q2_capacity_signal=[stable,expanded]`: combinación inválida por exclusividad.
6. `q2_capacity_signal=unknown`: mantener incertidumbre, sin presión/expansión inferida.
7. Variantes nonprofit/clinical: comprobar que el concepto medido permanece coherente.

**Gate editorial:** 8 preguntas con primera inspección, **0 aprobadas** en este lote; falta validación de sus opciones, dependencias efectivas y casos cognitivos antes de KEEP/REWRITE/REMOVE definitivos.

## Changelog
- 0.2.0: extracción de opciones, señales y elegibilidad de regularidad, demanda y capacidad; riesgos y pruebas propuestas. Sin cambios de ejecución.
