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


## Lote 01 — propuesta bilingüe para aprobación (2026-10-30)

**Edición documental 0.3.0 — PLAN_ONLY — NO APROBADO EL CONTENIDO.** Se conserva el lote original de ocho preguntas de clasificación y contexto; no se redefine para incluir sector/especialidad, que corresponde a un lote posterior. Este anexo prepara una versión ES/EN para revisión del responsable. **Ningún texto, valor, regla ni señal siguiente fue modificado en TypeScript o publicado.**

### Decisiones del responsable aplicables a la revisión

- **TAX-A aprobada como método:** conservar las ocho dimensiones **candidatas** y revisar solapamientos, aplicabilidad y evidencia por C01–C10. No se aprueban pesos, niveles, nombres definitivos ni calibración.
- **SEM-A aprobada como regla editorial:** distinguir explícitamente **no publicado**, **no aplicable** y **no lo sé** cuando una pregunta admita esos estados. No asumir que «no publicado» = débil ni reutilizar un value existente con significado diferente; todo cambio semántico requiere versión, reglas de evidencia y revisión antes de código.
- **PERSIST-A aprobada como política de diseño:** los informes **autenticados** podrán guardar resultados estructurados vinculados a la cuenta, con controles de acceso, historial, eliminación y retención por definir antes de implementación; esto no modifica el borrador **anónimo, local y de siete días**, ni habilita registrar respuestas personales en la analítica agregada D1.
- **LOTES-8 aprobada:** revisión de ocho preguntas por lote. Aprobar la política de lotes no aprueba preguntas, variantes ni traducciones. El núcleo final se certificará para C01–C10, aunque las 77 preguntas históricas no tienen por qué publicarse todas.

**Fuentes de verdad inspeccionadas del HEAD 382632efca39ee52d8458440347e567151b91af4:** app/features/diagnostic/qa03b/bank.ts (blob b4772d73), qa03b/editorial-copy.ts, qbv2-golden.ts, qbv2-lote-a.ts; el ensamblaje actual aplica editorial-copy sobre bank.ts y después las especialidades. Los IDs y values en las fichas siguientes reproducen esa línea base. ES y EN marcados como «propuesta» son textos **para aprobar**, no textos ya activados. Las evidencias describen solo señales o intención contextual observables; no certifican ocho dimensiones ni calificaciones.

### Ficha 01 — q2_entity · versión observada 3

- **Objetivo:** distinguir persona independiente, negocio, organización y proyecto; no inferir constitución legal, ingresos ni madurez.
- **Tipo / elegibilidad:** single; pregunta de clasificación fundamental, sin guardia específica observada en bank.ts. **Evidencia:** declaración contextual entity; sin nota de madurez directa.
- **ES propuesta:** «¿Qué tipo de actividad quieres evaluar?»
- **EN draft:** “What type of activity would you like to assess?”
- **Ayuda ES:** «Puedes elegir un proyecto aunque ya genere ingresos; si trabajas por tu cuenta con una marca comercial, elige independiente.»
- **Help EN:** “Choose project even if it already earns income. If you work independently under a business name, choose independent.”

| value canónico | Opción ES propuesta | Option EN draft | Semántica |
| --- | --- | --- | --- |
| individual | Mi actividad como profesional o persona independiente, incluso con nombre comercial. | My work as a professional or independent provider, even under a business name. | Clasificación |
| business | Un negocio o empresa con actividad comercial. | A business or company carrying out commercial activity. | Clasificación |
| organization | Una organización o iniciativa comunitaria sin fines de lucro. | A nonprofit or community organization or initiative. | Clasificación |
| project | Un proyecto personal o colectivo que aún no tiene forma de negocio u organización. | A personal or group project that is not yet organized as a business or organization. | Clasificación |
| unknown | Aún no sé cómo clasificar mi actividad. | I'm not sure how to classify my activity yet. | kind=unknown; neutra |

**Dictamen propuesto:** KEEP con pulido lingüístico. Revisar C02/C04/C05; «project» no significa necesariamente sin ingresos.

### Ficha 02 — q2_has_customers · versión observada 3

- **Objetivo:** historial de interacción real (incluidos usuarios o beneficiarios), independiente del estado operativo actual; seguidores o interés sin uso real no cuentan.
- **Tipo / elegibilidad:** single; sin guardia específica observada. **Evidencia:** hasRealCustomers declarada; contexto, no prueba de ventas, digitalización o madurez.
- **ES propuesta:** «¿Alguna persona ha comprado, contratado, utilizado o recibido realmente lo que ofreces?»
- **EN draft:** “Has anyone actually bought, booked, used, or received what you offer?”
- **Ayuda ES:** «Cuenta experiencias reales anteriores, incluso si la actividad está en pausa. Los seguidores o interesados por sí solos no cuentan.»
- **Help EN:** “Count real past experiences, even if the activity is currently paused. Followers or expressions of interest alone do not count.”

| value | Opción ES propuesta | Option EN draft | Semántica |
| --- | --- | --- | --- |
| yes | Sí, ya hubo personas que compraron, contrataron, usaron o recibieron lo que ofrezco. | Yes, people have already bought, booked, used, or received what I offer. | Historial afirmativo; no implica ventas |
| no | No, todavía no ha ocurrido ninguna de esas situaciones. | No, none of those situations has happened yet. | Ausencia de historial; no «madurez débil» |
| unknown | No tengo información suficiente para responder. | I don't have enough information to answer. | kind=unknown |

**Dictamen:** KEEP. Proteger C03 (pausa con clientes históricos) y C05 (personas atendidas sin compra).

### Ficha 03 — q2_operational_status · versión observada 1

- **Objetivo:** etapa operativa hoy, separada de haber tenido clientes reales antes.
- **Tipo / elegibilidad:** single; regla real answered(q2_has_customers). **Evidencia:** estado de actividad contextual; no madurez digital.
- **ES propuesta:** «¿En qué situación está actualmente tu actividad?»
- **EN draft:** “What is the current status of your activity?”
- **Ayuda ES:** «Distingue lo que está disponible hoy de lo que estás preparando o has pausado, aunque antes hayas atendido a personas.»
- **Help EN:** “Distinguish what is available now from what you're preparing or have paused, even if you previously served people.”

| value | Opción ES propuesta | Option EN draft | Semántica |
| --- | --- | --- | --- |
| preparing | Todavía no está disponible; estoy preparando o validando la actividad. | It isn't available yet; I'm preparing or validating it. | Preparación, sin resultados inventados |
| operating | Ya está disponible para atender, vender, prestar servicios u ofrecer actividades. | It's currently available to serve people, sell products, provide services, or run activities. | Actividad actual |
| paused | Está temporalmente en pausa. | It's temporarily paused. | No equivale a fracaso |
| unknown | Todavía no tengo claro su estado. | I'm not sure of its status yet. | kind=unknown |

**Dictamen:** KEEP. La respuesta previa q2_has_customers=unknown está «contestada» en términos de guardia, no implica evidencia suficiente; auditar su tratamiento en F03.

### Ficha 04 — q2_customer_buyer · versión observada 3

- **Objetivo:** distinguir quién compra/contrata de quién usa o recibe; contemplar actividades sin transacción directa.
- **Tipo / elegibilidad:** single; no guardia específica en la sustitución QA03B. **Evidencia:** customerBuyer explícita solo para b2c/b2b/mixed; no_direct_purchase no genera señal comercial. No equivale a conversion_access.
- **ES propuesta:** «Si hay una compra o contratación directa, ¿quién suele realizarla?»
- **EN draft:** “If there is a direct purchase or contract, who usually makes it?”
- **Ayuda ES:** «Piensa en quien paga o contrata, que puede ser distinto de quien recibe la ayuda o el servicio. También puedes indicar que no hay compra directa.»
- **Help EN:** “Think of who pays or signs the agreement; this may differ from who benefits. You can also indicate that there is no direct purchase.”

| value | Opción ES propuesta | Option EN draft | Semántica |
| --- | --- | --- | --- |
| b2c | Personas individuales. | Individuals. | Clasifica comprador |
| b2b | Empresas, organizaciones o instituciones. | Businesses, organizations, or institutions. | Clasifica comprador |
| mixed | Tanto personas como organizaciones, habitualmente. | Both individuals and organizations, on a regular basis. | Clasifica comprador |
| no_direct_purchase | No hay compra directa; la actividad se sostiene mediante donaciones, fondos o aportes. | There is no direct purchase; the activity is supported by donations, grants, or contributions. | Respuesta contextual legítima; no marcar weak |
| unknown | Todavía no lo tengo claro. | I'm not sure yet. | kind=unknown |

**Dictamen:** REVISE solo copy/EN; revisar con C05 y casos de prestación gratuita no financiada mediante aportes. Si hay que ampliar el significado de no_direct_purchase, versionar; no hacerlo por traducción.

### Ficha 05 — q2_monetization · versión observada 3

- **Objetivo:** mecanismo principal de ingresos o aportes; en preparación se pregunta por lo **esperado**, no por ingresos observados.
- **Tipo / elegibilidad:** single; appliesWhen=undefined en sustitución QA03B (sin guardia de actividad). Variante prelaunch existente. **Evidencia:** monetizationMechanism declaración contextual para siete opciones; no_revenue_yet es kind=none y no prueba insuficiencia digital.
- **ES propuesta:** «¿Cuál es o sería la principal fuente de ingresos o aportes de tu actividad?»
- **EN draft:** “What is, or would be, the main source of income or contributions for your activity?”
- **Ayuda ES:** «Si está en pausa, piensa en la fuente anterior; si aún la preparas, piensa en lo que esperas, no en ingresos ya obtenidos.»
- **Help EN:** “If paused, consider the previous source; if preparing, choose what you expect, not income already received.”

| value | Opción ES propuesta | Option EN draft | Semántica |
| --- | --- | --- | --- |
| time_or_project | Cobro por tiempo, servicios o proyectos. | Fees for time, services, or projects. | Mecanismo principal |
| goods | Venta de productos o mercancías. | Sales of goods or products. | Mecanismo principal |
| licensed | Ejercicio profesional con licencia o habilitación. | Licensed or regulated professional practice. | Mecanismo principal; revisar variación por país |
| commission | Comisiones por ventas, referidos o intermediación. | Commissions from sales, referrals, or brokerage. | Mecanismo principal |
| audience | Ingresos procedentes de contenido o audiencia. | Income from content or an audience. | Mecanismo principal |
| recurring | Membresías, suscripciones o cuotas recurrentes. | Memberships, subscriptions, or recurring fees. | Mecanismo principal |
| mission | Donaciones, subvenciones, fondos u otros aportes para una misión. | Donations, grants, funding, or other mission contributions. | No equivale a venta |
| no_revenue_yet | Todavía no genera ingresos ni aportes por esta actividad. | This activity does not yet generate income or contributions. | kind=none; no penalizar madurez por sí solo |

**Atención editorial:** el array de etiquetas prelaunch contiene la clave services, pero el valor histórico del banco es time_or_project. Verificar la aplicación real de variantes antes de aprobar traducción o afirmar que ese texto se muestra. La opción unknown no existe en esta versión; **propuesta condicionada** de incorporarla en una nueva versión si las pruebas cognitivas muestran que la necesita. No agregar silenciosamente values ni cambiar el significado de no_revenue_yet.

**Dictamen:** REVISE semántica de etapa y variante; NO APPROVED.

### Ficha 06 — q2_regularity · versión observada 1

- **Objetivo:** frecuencia observada de actividad pasada reciente, no capacidad digital.
- **Tipo / elegibilidad efectiva QA03B:** single; operating AND q2_has_customers=yes (y su guardia heredada q2_has_customers=yes). La pausa excluye la lectura de operación actual. **Evidencia:** operatingRegularity, señal observada contextual; scoringReadiness sin dimensiones candidatas.
- **ES propuesta:** «Durante los últimos meses de actividad, ¿con qué frecuencia atendiste personas, recibiste pedidos o realizaste ventas?»
- **EN draft:** “During your recent months of operation, how frequently did you serve people, receive orders, or make sales?”
- **Ayuda ES:** «Piensa en el ritmo habitual de la actividad mientras operaba; no en una única semana excepcional.»
- **Help EN:** “Think of the usual pattern while the activity was operating, not a single unusual week.”

| value | Opción ES propuesta | Option EN draft | Semántica |
| --- | --- | --- | --- |
| irregular | De forma ocasional o sin una frecuencia constante. | Occasionally or without a consistent frequency. | operatingRegularity=irregular |
| regular | De forma regular y repetible. | Regularly and repeatedly. | operatingRegularity=regular |

**Atención editorial:** no existe opción unknown en la versión observada; no forzar regular/irregular sin conocimiento. Evaluar propuesta de unknown versionada y el sentido temporal en C03/C05. **Dictamen:** REVISE/HOLD de neutralidad y cronología.

### Ficha 07 — q2_demand_trend · versión observada 1

- **Objetivo:** tendencia observable de actividad medida con un indicador coherente por sector; no equiparar compradores, citas y beneficiarios.
- **Tipo / elegibilidad efectiva QA03B:** single; q2_regularity=regular AND operating AND q2_has_customers=yes. **Evidencia:** demandTrend observada; scoringReadiness sin dimensión candidata. Variante de terminología nonprofit/clinical existe.
- **ES propuesta:** «En los últimos meses, ¿ha aumentado, se ha mantenido o ha disminuido la cantidad de actividad que recibes?»
- **EN draft:** “Over the past few months, has the volume of activity you receive increased, stayed about the same, or decreased?”
- **Ayuda ES:** «Usa una misma medida relevante durante todo el periodo: clientes, citas, pedidos o personas atendidas. Si no dispones de datos, no adivines.»
- **Help EN:** “Use the same relevant measure throughout: customers, appointments, orders, or people served. Do not guess if you lack information.”

| value | Opción ES propuesta | Option EN draft | Semántica actual |
| --- | --- | --- | --- |
| increasing | Ha aumentado de manera sostenida. | It has increased steadily. | demandTrend=increasing_observed |
| flat | Se ha mantenido aproximadamente igual. | It has stayed about the same. | **Actual:** demandTrend=flat_or_unknown (ambigua) |
| decreasing | Ha disminuido. | It has decreased. | demandTrend=decreasing_observed |

**Atención editorial P0:** flat no debe significar simultáneamente estabilidad observada y desconocimiento. No reinterpretar flat_or_unknown en sesiones anteriores ni llamar unknown a flat; separar estados con versionado de señales y evaluar opción unknown nueva. Proteger variantes nonprofit/clinical y C03. **Dictamen:** REVISE/HOLD hasta resolver señal y neutralidad.

### Ficha 08 — q2_capacity_signal · versión observada 1

- **Objetivo:** distinguir presión de capacidad y expansión, sin inferir calidad o madurez digital a partir del tamaño.
- **Tipo / elegibilidad efectiva QA03B:** multi; q2_regularity=regular AND operating AND q2_has_customers=yes. **Evidencia:** capacityPressure/capacityExpansion observadas; scoringReadiness sin dimensión candidata.
- **ES propuesta:** «Durante los últimos meses, ¿qué situaciones describen tu capacidad para atender la actividad?»
- **EN draft:** “During the past few months, which situations describe your capacity to handle your activity?”
- **Ayuda ES:** «Puedes seleccionar tanto el aumento del trabajo pendiente como la ampliación de recursos. Las opciones “ninguna” y “no lo sé” son exclusivas.»
- **Help EN:** “You may select both growing backlogs and expanded resources. ‘None of these’ and ‘I'm not sure’ cannot be combined with other options.”

| value | Opción ES propuesta | Option EN draft | Semántica actual |
| --- | --- | --- | --- |
| waitlist_growing | Ha crecido la lista de espera o el trabajo pendiente. | The waiting list or backlog has grown. | capacityPressure=true |
| expanded | Hemos aumentado personal, horas, espacio o recursos para atender más. | We expanded staffing, hours, space, or resources to serve more. | capacityExpansion=true |
| stable | Ninguna de las situaciones anteriores; no he observado esos cambios. | None of the above; I have not observed those changes. | exclusive=true; señales actuales pressure=false / expansion=false |
| unknown | No tengo información suficiente para responder. | I don't have enough information to answer. | kind=unknown; exclusive=true |

**Atención editorial:** “estable” en la versión actual puede confundirse con demanda estable y no necesariamente ausencia de presión; revisar si la nueva redacción conserva el meaning del value, o exige opción/versionado diferente. Presión y expansión pueden coexistir sin contradicción; no equiparar crecimiento con buena madurez digital. **Dictamen:** REVISE/HOLD.

### Invariantes y puerta de aprobación del lote

1. **Identidad:** ocho IDs versionados, 34 opciones actuales (5+3+4+5+8+2+3+4); ninguna nueva opción o versión se integra por esta propuesta. Verificar las opciones contra el banco ejecutable antes del código.
2. **Neutralidad:** unknown, none y no_direct_purchase no equivalen a weak; **not_published** se reservará para preguntas donde la publicación sea observable y distinta de no aplicable (caso gastronómico en otro lote). No rellenar desconocidos con inferencia.
3. **Dependencias:** regularidad, demanda y capacidad son actividad observada; excluirlas de operación pausada y preparación a menos que una futura revisión defina otras mediciones y versiones. No inventar ventas para organizaciones o proyectos.
4. **Evidencia y taxonomía:** las señales de clasificación/operación del lote son contexto; no se transforman automáticamente en scores de las ocho dimensiones. Los límites de las dimensiones permanecen por revisar.
5. **Traducción:** estas formulaciones EN son drafts editoriales, no traducciones revisadas por bilingües ni contratos de variantes equivalentes aprobados.
6. **Revisión humana:** el responsable debe poder aprobar, corregir o diferir **cada ficha** y especialmente las decisiones sobre q2_monetization, q2_regularity, q2_demand_trend, q2_capacity_signal. La aprobación A/A/A y lotes de ocho no las aprueba.
7. **Límites:** no modificar código, tests, CI, esquema, producción ni PR merge. Sin pruebas ejecutadas para este anexo. El lote siguiente abordará sector, especialidad, modalidades y objetivos para completar la clasificación.

**Estado de salida:** CONTENT_DRAFT_8_OF_8, HUMAN_APPROVAL_0_OF_8, PLAN_ONLY. Lista para revisión editorial, no para uso público.

### Changelog documental

- 0.3.0 / 2026-10-30: se registran las cuatro decisiones de diseño recibidas; ocho fichas ES/EN con opciones, guardias, neutralidad, señales, riesgos y gating editorial. Solo documentación del candidato, sin implementación.


## 0.4.0 — Dictamen editorial autónomo delegado (2026-10-31)

**Autorización:** el responsable delegó expresamente el análisis crítico del Lote 01 y la toma de decisiones editoriales. **Alcance:** decisión de diseño y contenido ES/EN, exclusivamente documental. **No autoriza** TS/TSX, SQL, tests, CI, Worker, rutas, merge, despliegue ni activación de banco nuevo. Este apartado prevalece sobre los dictámenes *provisionales* de las versiones 0.1–0.3; no borra su historial.

### Criterios de decisión

- Las ocho fichas son **contexto y clasificación**, no evidencia directa de las ocho dimensiones de madurez digital candidatas. Nunca convertir preparar, pausar, ausencia de compras, estacionalidad, desconocimiento o insuficiencia de historial en una nota digital negativa.
- Separar *no lo sé* (desconocimiento), *insuficiente historial* (aún no hay periodos comparables), *no aplica* (la comparación no corresponde), *no existe* (hecho conocido) y *estable observado*. Especialmente, «no publicado» no equivale a «no aplicable» ni automáticamente a «débil»; su diseño corresponde al lote especializado.
- Una pregunta de catálogo **no** implica un turno universal adicional: el grafo seleccionará solo preguntas relevantes, sin romper 24+5 y el consentimiento excepcional.
- Los valores heredados y evidencias viejas permanecen intactos. Introducir valores nuevos o cambiar sus lecturas requiere identidad de versión V9 nueva y pruebas focalizadas posteriores; ninguna reinterpretación retroactiva V8/QBV2.
- La aprobación delegada de redacción **no** certifica comprensión cognitiva, accesibilidad, equivalencia lingüística evaluada por usuarios, scoring o implementación.

### Resolución del lote — ocho decisiones

| # | ID | Versión actual → versión objetivo V9* | Resolución editorial delegada | Justificación |
|---|---|---|---|---|
| 01 | q2_entity | 3 → 3 | **KEEP / APPROVED_COPY** | Mantiene independiente, negocio, ONG/proyecto y desconocido sin asumir situación legal |
| 02 | q2_has_customers | 3 → 3 | **KEEP / APPROVED_COPY** | Historial de usuarios/beneficiarios real ≠ ventas ni estado actual |
| 03 | q2_operational_status | 1 → 1 | **KEEP / APPROVED_COPY** | Preparando, operando, pausado, desconocido separados |
| 04 | q2_customer_buyer | 3 → 4* | **REWRITE / DESIGN_APPROVED** | No compra directa también cubre actividad gratuita sin donaciones |
| 05 | q2_monetization | 3 → 4* | **REWRITE / DESIGN_APPROVED** | Falta unknown; la variante prelaunch usa services en lugar del value time_or_project |
| 06 | q2_regularity | 1 → 2* | **REWRITE / DESIGN_APPROVED** | Dos respuestas obligan a elegir regular/irregular aun con estacionalidad, datos insuficientes o desconocimiento |
| 07 | q2_demand_trend | 1 → 2* | **REWRITE / DESIGN_APPROVED** | flat no puede producir simultáneamente estabilidad y desconocimiento (señal histórica flat_or_unknown) |
| 08 | q2_capacity_signal | 1 → 2* | **REWRITE / DESIGN_APPROVED** | stable v1 no demuestra ausencia de presión crónica; distinguir cambios, no aplicabilidad y desconocimiento |

*Las versiones objetivo son **propuestas de futura identidad de banco V9**, pendientes de verificar colisiones y de diseñar replay/migración de opciones. No se han introducido valores en el código.

### Contenido final de diseño del Lote 01 (ES/EN)

**01 · q2_entity (KEEP, v3)**

- **ES:** ¿Qué tipo de actividad quieres evaluar?
- **EN:** What type of activity would you like to assess?
- **Ayuda / Help:** No necesitas una empresa registrada; una persona independiente con nombre comercial puede elegir «independiente». / You don't need a registered company; a self-employed professional using a business name can choose “independent”.
- **Opciones / Options:** individual: Mi actividad profesional o independiente / My independent professional activity; business: Un negocio o empresa / A business or company; organization: Una organización o iniciativa comunitaria sin fines de lucro / A nonprofit or community organization or initiative; project: Un proyecto personal o colectivo que todavía no funciona como negocio u organización / A personal or group project not yet operating as a business or organization; unknown: Todavía no puedo clasificarla / I'm not yet sure how to classify it.
- **Aplicabilidad:** clasificación general, sin guardia específica observada. **Evidencia:** entidad declarada contextual, no scoring. **Control:** C02, C04, C05 y C10; proyecto con ingresos no se convierte automáticamente en negocio formal.

**02 · q2_has_customers (KEEP, v3)**

- **ES:** ¿Alguna persona ha comprado, contratado, utilizado o recibido realmente lo que ofreces?
- **EN:** Has anyone actually bought, hired you for, used, or received what you offer?
- **Ayuda / Help:** Cuenta actividad real anterior, incluso si hoy está en pausa; los seguidores o interesados por sí solos no cuentan. / Count actual past activity, even if you're currently paused; followers or expressions of interest alone don't count.
- **Opciones / Options:** yes: Sí, al menos una persona / Yes, at least one person; no: No, todavía no / No, not yet; unknown: No tengo información suficiente / I don't have enough information.
- **Aplicabilidad:** general. **Evidencia:** hasRealCustomers contextual; «sí» no prueba ventas ni actividad actual. **Control:** C03 pausa con historial y C05 beneficiarios sin compra. Una donación sin servicio o participante real no demuestra automáticamente usuarios atendidos.

**03 · q2_operational_status (KEEP, v1)**

- **ES:** ¿En qué situación está actualmente tu actividad?
- **EN:** What is the current status of your activity?
- **Ayuda / Help:** Responde sobre hoy, aunque hayas atendido personas anteriormente. / Answer based on today, even if you served people before.
- **Opciones / Options:** preparing: La estoy preparando o validando / I'm preparing or validating it; operating: Ya está disponible y funciona / It's currently operating and available; paused: Está temporalmente en pausa / It's temporarily paused; unknown: Todavía no lo tengo claro / I'm not yet sure.
- **Aplicabilidad real observada:** answered(q2_has_customers). La respuesta unknown al historial cuenta como respuesta registrada, **no como evidencia suficiente**. **Evidencia:** etapa operativa contextual, no madurez. **Control:** C02 y C03.

**04 · q2_customer_buyer (REWRITE, v4 objetivo)**

- **ES:** Cuando hay una compra o contratación directa, ¿quién la realiza o la realizaría?
- **EN:** When there is a direct purchase or contract, who makes it or would make it?
- **Ayuda / Help:** Quien paga puede ser distinto de quien recibe lo ofrecido. Selecciona «sin compra directa» también cuando la actividad es gratuita, aunque no reciba donaciones. / The payer may differ from the person receiving the service. Choose “no direct purchase” for free activities as well, even without donations.
- **Opciones / Options:** b2c: Personas individuales / Individuals; b2b: Empresas, organizaciones o instituciones / Businesses, organizations, or institutions; mixed: Personas y organizaciones de manera habitual / Both individuals and organizations regularly; no_direct_purchase: No hay compra ni contratación directa / There is no direct purchase or contract; unknown: Aún no lo sé / I'm not sure yet.
- **Aplicabilidad:** clasificación general sin asumir clientes previos; en preparación se refiere a posibles compradores. **Evidencia:** customerBuyer para b2c/b2b/mixed; no_direct_purchase es contexto, no «fracaso comercial». **Versionar** la ampliación del sentido original restringido a donaciones. **Control:** C05, C02 y relación comprador-beneficiario.

**05 · q2_monetization (REWRITE, v4 objetivo)**

- **ES:** ¿De dónde provienen, o esperas que provengan, principalmente los ingresos o aportes de esta actividad?
- **EN:** What is, or do you expect to be, the main source of income or contributions for this activity?
- **Ayuda / Help:** En pausa, indica la fuente anterior; en preparación, la prevista, sin afirmar que ya existe. / If paused, choose the previous source; if preparing, choose the expected source without claiming it already exists.
- **Opciones / Options (identidad explícita):**
  - time_or_project: Honorarios por servicios, tiempo o proyectos / Fees for services, time, or projects
  - goods: Venta de productos / Sales of products
  - licensed: Ejercicio profesional sujeto a licencia o habilitación / Licensed or regulated professional practice
  - commission: Comisiones por ventas, referidos o intermediación / Commissions from sales, referrals, or brokerage
  - audience: Ingresos por contenido, audiencia o patrocinios / Income from content, audiences, or sponsorships
  - recurring: Membresías, suscripciones o cuotas recurrentes / Memberships, subscriptions, or recurring fees
  - mission: Donaciones, subvenciones, fondos o aportes para la misión / Donations, grants, funds, or mission contributions
  - no_revenue_yet: No genera ingresos ni aportes, o no se esperan todavía / It has no income or contributions, or none are expected yet
  - unknown **NEW**: No lo tengo claro o no tengo información / I'm not sure or don't have enough information
- **Aplicabilidad:** transversal, con variante prelaunch que debe usar el value **time_or_project**, no services (clave errónea de la versión actual). **Evidencia:** mecanismo declarado y etapa prevista/real; no_revenue_yet=none conocido, unknown=incertidumbre; ninguno es debilidad digital. **Control:** C02/C03/C05. Ningún proyecto queda obligado a inventar ingresos.

**06 · q2_regularity (REWRITE, v2 objetivo)**

- **ES:** Durante el período reciente en que tu actividad ha operado, ¿qué patrón de atención, pedidos o servicios has observado?
- **EN:** During your recent period of operation, what pattern of service, orders, or customer activity have you observed?
- **Ayuda / Help:** Una actividad estacional puede seguir un patrón previsible aunque no funcione todo el año. / Seasonal activity may be predictable even if it doesn't operate year-round.
- **Opciones / Options:** irregular: Ocasional o imprevisible / Occasional or unpredictable; regular: Regular y repetible / Regular and repeatable; seasonal **NEW**: Por ciclos o temporadas previsibles / In predictable cycles or seasons; insufficient_history **NEW**: Acaba de comenzar; todavía hay poca historia / It just started; there isn't enough history; unknown **NEW**: No tengo información suficiente / I don't have enough information.
- **Aplicabilidad objetivo:** operating AND has_customers=yes. **Evidencia:** periodicidad observada; nunca nota digital, y seasonal no equivale a irregular. **Control:** C03, turismo/agro y operaciones nuevas. Abrir la tendencia tras seasonal requiere pruebas de períodos equivalentes, no autorización automática.

**07 · q2_demand_trend (REWRITE, v2 objetivo)**

- **ES:** Comparando períodos recientes equivalentes, ¿cómo ha cambiado el número de personas atendidas, citas, pedidos o solicitudes?
- **EN:** Comparing similar recent periods, how has the number of people served, appointments, orders, or requests changed?
- **Ayuda / Help:** Compara siempre el mismo indicador adecuado a tu actividad. No inventes una tendencia si faltan datos o períodos comparables. / Compare the same relevant measure. Don't guess a trend if data or comparable periods are missing.
- **Opciones / Options:** increasing: Ha aumentado / It has increased; flat: Se ha mantenido aproximadamente igual / It has remained about the same; decreasing: Ha disminuido / It has decreased; insufficient_history **NEW**: Aún no hay períodos suficientes para comparar / There aren't enough comparable periods yet; unknown **NEW**: No tengo datos fiables para responder / I don't have reliable information.
- **Aplicabilidad actual a preservar inicialmente:** operating AND has_customers=yes AND regularity=regular. No abrir automáticamente seasonal hasta definir periodos comparables. **Evidencia futura:** flat se convierte en estabilidad *observada* con señal V9 versionada **stable_observed** o identidad equivalente; la señal V8 flat_or_unknown **no se reinterpreta retroactivamente**. **Control:** ONG, clínica, negocio estacional y actividad recién iniciada; sin puntuar crecimiento como madurez digital.

**08 · q2_capacity_signal (REWRITE, v2 objetivo)**

- **ES:** Durante los últimos meses, ¿qué cambios has observado en tu capacidad para atender personas, pedidos o servicios?
- **EN:** Over the past few months, which changes have you observed in your capacity to serve people, fulfill orders, or provide services?
- **Ayuda / Help:** Puedes marcar a la vez una lista de espera creciente y una ampliación de recursos. «Ninguno», «No aplica» y «No lo sé» se responden por separado. / You can select both a growing backlog and expanded resources. “None”, “Not applicable”, and “I'm not sure” are exclusive.
- **Opciones / Options:**
  - waitlist_growing: Ha crecido la espera o el trabajo pendiente / Waiting times or the backlog have grown
  - expanded: Hemos ampliado horas, equipo, espacio o recursos / We have expanded hours, staffing, space, or resources
  - none_of_these_changes **NEW reemplazo de stable v1**: Ninguno de esos dos cambios / Neither of those two changes
  - not_applicable **NEW**: Esta comparación de capacidad no corresponde a mi actividad / This capacity comparison doesn't apply to my activity
  - unknown: No tengo información suficiente / I don't have enough information
- **Aplicabilidad inicial:** operating AND has_customers=yes AND regularity=regular; estacionalidad requiere comparación especializada. **Regla multi:** waitlist_growing + expanded pueden coexistir; las otras tres opciones son exclusivas. **Evidencia:** «ninguno de estos cambios» **no prueba ausencia de presión crónica** y no debe seguir generando automáticamente capacityPressure=false; modificar señales solo en V9 con nueva versión. Si not_applicable no está respaldado por actividad concreta, abstenerse de asignar evaluación. **Control:** presión crónica sin crecimiento, amplitud variable, actividad sin capacidad medible.

### Contrato de aprobación y deuda técnica

- **Inventario actual:** 8 preguntas, **34 opciones** canónicas del HEAD de origen bf691fcf4ce5ec823532e66ab3820ce85cfc68fd. **Diseño futuro propuesto y aprobado por delegación:** **41 opciones** (5+3+4+5+9+5+5+5), con IDs nuevos propuestos solo para V9, un valor histórico sustituido por identidad diferente y nuevas versiones; no se han añadido a la aplicación.
- **Resultado de decisión:** 3 KEEP, 5 REWRITE, 0 preguntas eliminadas. **8/8 decisiones editoriales tomadas**, no equivalen a 8/8 implementación ni 8/8 certificación lingüística. El documento 0.3.0 describía el estado previo a la delegación (0/8 decisiones humanas).
- **Pendiente antes de programar:** versión y replay de opciones, equivalencia es/en comprobada, escenario C01–C10 por pregunta, reglas de aplicabilidad frente a sector, N/A/unknown/insufficient_history, presupuesto de turnos, examen de campos de analítica y pruebas de comprensión. Ninguna dependencia QBV2 se traslada a runtime V9 autónomo.
- **Pruebas focalizadas futuras (NO ejecutadas):** C02/preparando, C03/pausa con historial, C04/profesional con marca, C05/grupo gratis sin aportes, C06/citas, C08/servicio gastronómico, C09/actividad multicanal/estacional, C10/sector desconocido; edición/replay y protección de V8. Cualquier semántica de v2/v4 exige identidad de banco y contrato de evidencia versionados.
- **Alcance de la delegación:** decisión editorial aprobada **como especificación de diseño**. No equivale a revisión humana independiente de campo, aceptación lingüística ES/EN real, calibración, auditoría de seguridad ni autorización para desarrollar. El responsable conserva poder de revocar este dictamen.

**Estado resultante: EDITORIAL_DECISIONS_8/8, ES_EN_SPEC_8/8, CODE_CHANGES_0, TESTS_NEW_0, PRODUCTION_CHANGES_0, PLAN_ONLY.**

### Changelog
- **0.4.0 (2026-10-31):** criterio editorial delegado: 3 KEEP y 5 REWRITE, ocho fichas ES/EN, neutralidad desambiguada y contratos de versiones objetivo, sin cambios de aplicación.


## Lote editorial 02 — sector, canales, públicos y objetivos (31-10-2026)

**Versión documental consolidada 0.5.0; estado: DESIGN_APPROVED_BY_DELEGATION / PLAN_ONLY.** Se reutiliza este documento editorial existente para no abrir otro Markdown; su nombre histórico conserva Lote 01, pero ahora contiene los lotes 01 y 02. El propietario delegó las decisiones editoriales críticas. **Ocho fichas nuevas de diseño, no ocho preguntas adicionales al banco.** No se cambió ningún contrato de ejecución ni se ejecutaron pruebas. La revisión distingue opción observada del banco y propuesta futura: en las tablas, **NEW** indica value inexistente en la versión citada.

**Snapshot de lectura de origen:** rama del PR maestro #162, HEAD d6514058a8f4251c50be905b2a98a7e24df176d0. Fuentes: qa03b/bank.ts, qa03b/specialty-candidate-bank.ts, qa03b/specialty-branches-wave1.ts, qa03b/editorial-copy.ts, qbv2-reviewed-foundation.ts, qbv2-reviewed-classification.ts, qbv2-golden.ts, qbv2-lote-d.ts, taxonomy.ts. Fuente de verdad: pregunta compuesta, no la antigua definición pública. La revisión es lectura estática, sin ejecución del ensamblaje.

### Resultado crítico: evidencias y falsas alarmas descartadas

1. **Confirmado:** q2_delivery es una pregunta **multi**, heredada de qbv2-reviewed-foundation.ts y ampliada en qa03b/bank.ts. La sospecha inicial basada en qbv2-golden.ts era incorrecta. No queda defecto de tipo single/multi probado. Sí existe tensión editorial con la opción other marcada como exclusive en el candidato.
2. **Confirmado:** el sector v4 compone un conjunto de veinte opciones desde la base R2C + unknown + cuatro nuevas; **no hay duplicado literal de nonprofit_community en esa base**, que utiliza community_social. La sospecha anterior de duplicado de value queda descartada. Existe **solapamiento conceptual** entre community_social y nonprofit_community y mezcla de canal/modelo con sector.
3. **Confirmado:** q2_friction presenta seis opciones sin unknown ni ninguna dificultad; la ruta fuerza una fricción subjetiva si la pregunta es obligatoria. No convertir esa selección en resultado probado.
4. **Confirmado:** q2_nonprofit_support_type carece de vía para organizaciones activas sin donaciones, cuotas o subvenciones; las cinco opciones existentes son donations/membership_dues/grants/mixed/unknown. Hay que distinguir ausencia real de financiación de desconocimiento.
5. **Confirmado:** el selector q2_niche_food_hospitality solo ofrece restaurant, cafe, food_truck, other y unknown pese a que el sector incluye alojamiento y otros tipos de hostelería. No deducir un nicho por el sector.
6. **Confirmado:** la regla de comprador-beneficiario es condicional y está ligada a comprador declarado y a ciertos contextos: no es una pregunta universal. El contexto de buyer/recipient jamás prueba conversión o confianza.

### Matriz de decisiones

| Ficha | Identificador | Versión de origen → versión objetivo* | Decisión de diseño | Prioridad |
| --- | --- | --- | --- | --- |
| 09 | q2_sector | v4 → v5* | **REWRITE / separar actividad, canal, modelo y forma jurídica** | P0, TAX-G1 |
| 10 | q2_delivery | v4 → v5* | **KEEP estructura multi / REWRITE opción other y ayuda** | P1 |
| 11 | q2_customer_reach | v3 → v3 | **KEEP / pulir contexto temporal y mezcla geográfica** | P1 |
| 12 | q2_buyer_recipient_relation | v1 → v2* | **REWRITE / incorporar relaciones mixtas** | P1 |
| 13 | q2_goal | v1 → v1 | **KEEP / objetivo voluntario, sin score** | P1 |
| 14 | q2_friction | v1 → v2* | **REWRITE / permitir ninguna principal e incertidumbre** | P0 |
| 15 | q2_nonprofit_support_type | v1 → v2* | **REWRITE / reconocer aportes en especie y ausencia real de fondos** | P0 |
| 16 | q2_niche_food_hospitality | v1 → v2* | **REWRITE / distinguir alojamiento y catering** | P1 |

*Los números objetivo indican posible versión nueva, **no versión aplicada**. Los changes de taxonomía pueden exigir renumerar identidad de pregunta, optionId, niche registry, sesión y replay. Ninguna cifra futura de opciones del banco se proclama certificada sin ejecutar el ensamblaje final.

### Ficha 09 — q2_sector (v4 actual, v5 objetivo) · single

**Objetivo:** clasificar la **actividad principal**, sin confundir dónde vende (online), a quién vende (B2B) o la estructura de su organización (sin lucro). **ES aprobada para diseño:** «¿A qué actividad o sector pertenece principalmente lo que ofreces?» **EN:** “Which field or industry best describes what you mainly offer?” **Ayuda ES:** «Elige lo que haces, no dónde lo vendes. Si tienes varias actividades, elige la principal; después indicaremos los canales y formas de atención.» **Help EN:** “Choose what you do, not where you sell it. If you have several activities, select the main one; we'll ask about channels and service methods separately.”

**Opciones y values de origen v4, con traducción propuesta:**

| value | ES | EN | Dictamen |
| --- | --- | --- | --- |
| health_wellness | Salud y bienestar | Health and wellness | KEEP |
| beauty_personal_care | Belleza y cuidado personal | Beauty and personal care | KEEP |
| legal | Servicios legales | Legal services | KEEP |
| financial_tax_insurance | Finanzas, impuestos y seguros | Finance, tax, and insurance | KEEP |
| professional_services | Servicios profesionales y consultoría | Professional services and consulting | KEEP |
| home_services | Servicios para el hogar y mantenimiento | Home services and maintenance | KEEP |
| automotive | Actividades automotrices | Automotive services and activities | KEEP |
| real_estate | Bienes raíces | Real estate | KEEP |
| food_hospitality | Alimentos, restauración y alojamiento | Food, dining, and hospitality | KEEP, refinar subnicho |
| retail | Comercio y tiendas | Retail and stores | KEEP |
| education_coaching | Educación y formación | Education and training | KEEP |
| creative_media | Actividades creativas y medios | Creative and media activities | KEEP |
| technology_software | Tecnología y software | Technology and software | KEEP |
| community_social | Servicios sociales, comunitarios o culturales | Social, community, or cultural services | KEEP, distinguir entidad |
| ecommerce | Comercio electrónico y tiendas online | E-commerce and online stores | MOVE TO CHANNEL/MODEL; no sector por sí solo |
| creator | Creación de contenido basada en audiencia | Audience-based content creation | MOVE TO ACTIVITY/MONETIZATION where relevant; no sector por defecto |
| b2b_services | Servicios especializados para empresas | Specialized services for businesses | MOVE TO CUSTOMER/MODEL; no confundir comprador con industria |
| nonprofit_community | Organizaciones sin fines de lucro y proyectos comunitarios | Nonprofit and community organizations | MOVE TO ENTITY/MISSION, resolver solapamiento |
| other | Otra actividad | Another activity | KEEP, contexto no inferido |
| unknown | Todavía no lo tengo claro | I'm not sure yet | KEEP, kind=unknown |

**Decisión:** aprobar la separación semántica de ejes, **no aprobar todavía** un listado definitivo de sectores ni eliminar cuatro values en código. La futura V9 deberá reubicar esas elecciones sin dejar sin ruta al nicho marketing_agency, creator y nonprofit; documentar mapeo explícito sector→especialidad y conservar C10 other/unknown. Proponer para la auditoría de cobertura **agropecuario**, **producción/manufactura** y **transporte/logística** como posibles sectores hoy ausentes: NEW-DESIGN-GAP, no nuevos IDs aprobados para runtime. **Elegibilidad actual:** clasificación core. **Evidencia:** nicheGroup explícita, no dimensión digital. **Neutralidad:** other y unknown no se convierten en sector supuesto. **Control:** C05, C07, C09, C10; comparar clasificaciones sin imponerles canal.

### Ficha 10 — q2_delivery (v4 actual, v5 objetivo) · multi

**Objetivo:** registrar formas reales de atención/entrega **simultáneas**; una clínica puede tener local, citas y atención remota a la vez. **ES:** «¿De qué formas atiendes a las personas o entregas lo que ofreces?» **EN:** “How do you serve people or deliver what you offer?” **Ayuda ES:** «Puedes elegir varias. En pausa indica las formas anteriores; en preparación, las que planeas. Tener web o redes no significa que exista pago en línea.» **Help EN:** “You can select more than one. If paused, choose previous methods; if preparing, choose planned ones. Having a website or social media doesn't necessarily mean online checkout.”

| value | ES | EN |
| --- | --- | --- |
| physical_location | En local, oficina o espacio propio | At my own premises, office, or facility |
| appointments | Mediante citas o sesiones reservadas | Through booked appointments or sessions |
| travels | Me desplazo al lugar de las personas | I travel to where people are |
| remote_service | Presto servicios a distancia por llamadas, video o internet | I provide services remotely by phone, video, or online |
| retail | Vendo productos en una tienda física | I sell products in a physical store |
| onsite | Las personas consumen o usan el servicio en el establecimiento | People consume or use the service on site |
| online_checkout | Las personas pueden elegir y pagar una compra por internet | People can select and pay for purchases online |
| other | Otra forma de atención o entrega | Another service or delivery method |
| unsure | Todavía no lo sé | I'm not sure yet |

**Contrato:** multi es correcto en el origen; NO corregirlo a partir de qbv2-golden.ts. En el diseño futuro, **other puede coexistir** con modos identificados, mientras unsure permanece **exclusiva y neutral**. Este ajuste cambia exclusividad y requiere versión nueva y validación de array/edición/replay. Solo los modos explícitamente declarados producen contexto; remote_service actualmente no contiene produces, por lo que su significado de modalidad deberá documentarse antes de usarlo para resolver arquetipo. **Elegibilidad:** clasificación core; variante prelaunch existente. **Evidencia:** deliveryMode/contexto, nunca capacidad digital probada. **Controles:** C02, C06, C07, C09 y q2_sector distinto de online_checkout.

### Ficha 11 — q2_customer_reach (v3) · single

**Objetivo:** alcance geográfico real o previsto, separado de canal digital. **ES:** «¿Dónde están principalmente las personas u organizaciones a las que atiendes o quieres llegar?» **EN:** “Where are the people or organizations you serve, or want to reach, mainly located?” **Ayuda ES:** «No confundas vender por internet con vender fuera de tu zona. Si estás preparando la actividad, responde según tu público previsto; si está en pausa, según el último período operativo.» **Help EN:** “Selling online doesn't necessarily mean serving a wider region. If you're preparing, choose your intended audience; if paused, use the last operating period.”

| value | ES | EN |
| --- | --- | --- |
| local | Principalmente en mi ciudad o zona cercana | Mainly in my city or nearby area |
| regional | Principalmente en varias ciudades de mi región | Mainly across several cities in my region |
| national | Principalmente en diferentes regiones del país | Mainly across regions of my country |
| global | En varios países | Across several countries |
| mixed | Tanto en mi zona como en lugares más lejanos de manera habitual | Both locally and farther away on a regular basis |
| unknown | Todavía no lo sé | I'm not sure yet |

**Decisión:** KEEP valores y versión; copiar solo por etapa sin atribuir alcance observado a un negocio que está preparando su lanzamiento. **Elegibilidad real en QA03B:** appliesWhen=undefined, distinta de la guardia contextIn del origen histórico. **Evidencia:** customerReach declarada; no demuestra visibilidad ni adquisición digital. **Neutralidad:** unknown. **Control:** negocio exclusivamente online pero local, ONG con beneficiarios, C02/C03/C09.

### Ficha 12 — q2_buyer_recipient_relation (v1 → v2 objetivo) · single

**Objetivo:** diferenciar quién contrata/paga y quién recibe/usa, sin inferir que toda compra es B2B o que ONG tiene comprador. **ES:** «Cuando alguien paga o contrata, ¿esa misma persona u organización recibe lo que ofreces?» **EN:** “When someone pays for or contracts a service, is that same person or organization the one receiving it?” **Ayuda ES:** «Una empresa puede contratar para sus empleados y una persona para un familiar. Si ocurre de ambas formas, elige “Depende”.» **Help EN:** “A company may contract for employees, or an individual for a relative. If both happen, choose ‘It varies’.”

| value | ES | EN |
| --- | --- | --- |
| same_party | Generalmente quien paga o contrata también recibe el servicio | Usually the buyer or contracting party also receives the service |
| third_party | Generalmente contrata para alguien diferente | Usually the buyer or contracting party arranges it for someone else |
| varies **NEW** | Depende: ocurren ambas situaciones de manera habitual | It varies: both situations occur regularly |
| unknown | No lo tengo claro | I'm not sure |

**Elegibilidad observada:** regla BUYER_RECIPIENT_RULE exige comprador b2c/b2b/mixed y además uno de ciertos contextos (B2B/mixed, organización, misión, salud o educación). La futura regla debe auditar también B2C que contrata para terceros sin convertir esta pregunta en universal. **Evidencia:** relación contextual, nunca confianza/conversión. **Neutralidad:** unknown; ausencia de compra directa es caso **no aplicable por ruta** (no forzar una opción), en línea con el Lote 01.

### Ficha 13 — q2_goal (v1) · single, objetivo voluntario

**Objetivo:** orientar la utilidad de las preguntas y las recomendaciones según la prioridad declarada, sin atribuir nivel de madurez. **ES:** «Si pudieras mejorar una cosa primero, ¿cuál te ayudaría más?» **EN:** “If you could improve one thing first, what would help you the most?” **Ayuda ES:** «Es opcional tener una prioridad definida. Puedes cambiarla y el diagnóstico seguirá revisando otras áreas importantes.» **Help EN:** “You don't need to have a clear priority. You can change it, and the assessment will still check other relevant areas.”

| value | ES | EN |
| --- | --- | --- |
| be_found | Que más personas adecuadas me encuentren | Help more of the right people find us |
| opportunities | Recibir más consultas, participantes u oportunidades | Get more inquiries, participants, or opportunities |
| explain | Explicar mejor qué hacemos y para quién | Better explain what we do and for whom |
| trust | Generar más confianza | Build more trust |
| stop_losing | Perder menos consultas o seguimientos pendientes | Lose fewer inquiries or follow-ups |
| organize | Organizar mejor contactos, tareas y procesos | Better organize contacts, tasks, and processes |
| automate | Reducir trabajo manual repetitivo | Reduce repetitive manual work |
| measure | Entender qué funciona y qué mejorar | Understand what works and what to improve |
| unsure | Todavía no tengo una prioridad clara | I don't have a clear priority yet |

**Decisión:** KEEP estructura y nueve values; **D-V9-009 sigue vigente**: los objetivos pueden sugerirse y confirmarse, jamás asignarse por deducción ni forzar un score. Si se hace opcional en UI, el evento de «omitir» no se convierte en unsure inventado. Mantener variantes de nonprofits (participación/apoyo) y prelaunch (primeras oportunidades). **Evidencia:** declaración de goal, no madurez. **Control:** C02/C05/C10, cambios de prioridad tras edición y presupuesto.

### Ficha 14 — q2_friction (v1 → v2 objetivo) · single

**Objetivo:** priorizar una dificultad **percibida**, no dictar una debilidad diagnóstica. **ES:** «¿Qué es lo que más dificulta avanzar ahora en tu actividad?» **EN:** “What is making it hardest to move forward with your activity right now?” **Ayuda ES:** «Si no identificas una dificultad principal o no tienes información suficiente, puedes indicarlo. Tu percepción no equivale a una evaluación técnica.» **Help EN:** “If you don't see a main obstacle or aren't sure, you can say so. Your perception isn't treated as technical proof.”

| value | ES | EN |
| --- | --- | --- |
| visibility | Pocas personas adecuadas nos encuentran | Too few of the right people find us |
| trust | Nos conocen, pero aún dudan en confiar | People know us but hesitate to trust us |
| conversion | Existe interés, pero pocas acciones se concretan | There is interest, but few actions are completed |
| follow_up | Se pierden contactos o asuntos por falta de seguimiento | Contacts or pending matters get lost through lack of follow-up |
| operations | Falta orden en tareas, información o procesos | Tasks, information, or processes aren't well organized |
| scale | Tenemos más solicitudes de las que podemos atender | We have more requests than we can handle |
| no_primary_issue **NEW** | No identifico una dificultad principal ahora | I don't see a main obstacle right now |
| unknown **NEW** | No lo tengo claro | I'm not sure |

**Decisión:** REWRITE con dos estados nuevos neutros. No convertir «no identifico problema» en score excelente, ni unknown en debilidad. **Elegibilidad actual:** core; futuro routing sensible a etapa y objetivo; en preparación se refiere a obstáculos actuales de validación, no a ventas hipotéticas. Conservar variantes nonprofit donde «apoyar/participar» sustituye lenguaje de compra. **Evidencia:** friction autodeclarada para selección/prioridad, nunca evidencia directa de nivel digital. **Control:** C02, C05 y C10.

### Ficha 15 — q2_nonprofit_support_type (v1 → v2 objetivo) · single

**Objetivo:** canal principal de apoyo **real**, sin asumir que toda organización cobra cuotas, tiene donaciones o recibe subvenciones. **ES:** «¿De qué manera se sostiene o recibe apoyo actualmente tu organización?» **EN:** “How is your organization currently funded or supported?” **Ayuda ES:** «Cuenta solo apoyo recibido de verdad. El voluntariado y las aportaciones en especie pueden sostener actividades sin ingresos monetarios. Si no hay apoyo, dilo.» **Help EN:** “Count support actually received. Volunteers and in-kind contributions may sustain activities without cash income. If there is no support, say so.”

| value | ES | EN |
| --- | --- | --- |
| donations | Donaciones económicas | Financial donations |
| membership_dues | Cuotas de membresía | Membership dues |
| grants | Subvenciones o fondos institucionales | Grants or institutional funding |
| mixed | Una combinación real de fuentes de apoyo | A real combination of support sources |
| volunteer_in_kind **NEW** | Principalmente voluntariado o aportes en especie | Mainly volunteers or in-kind contributions |
| no_support **NEW** | Todavía no recibe financiación ni apoyo externo | It doesn't currently receive funding or outside support |
| other **NEW** | Otro tipo de apoyo no incluido | Another type of support not listed |
| unknown | No dispongo de información suficiente | I don't have enough information |

**Decisión:** REWRITE versionado. El valor mixed de v1 solo cubría donaciones/cuotas/fondos; ampliar su definición requiere identidad v2, no reinterpretación histórica. Aportes internos/autogestión deben poder declararse sin forzarlos a donaciones (revisar other/no_support según ejemplos). **Elegibilidad del piloto:** operating AND (q2_entity=organization OR q2_monetization=mission). En pausa o antes de operar, no presentar como apoyo que existe hoy sin variante explícita. **Evidencia:** financiación/apoyo contextual, no madurez digital. **Neutralidad:** no_support es hecho conocido, unknown incertidumbre; en C05, donation_clarity y membership_lifecycle deben quedar fuera cuando no hay esas fuentes. **Control:** C05 con participación sin financiación, C03 y C02.

### Ficha 16 — q2_niche_food_hospitality (v1 → v2 objetivo) · single

**Objetivo:** distinguir modalidades concretas de hostelería y restauración, sin inventar especialidades a partir del sector. **ES:** «¿Qué tipo de actividad de alimentos u hospitalidad describe mejor lo que haces?» **EN:** “Which type of food or hospitality activity best describes what you do?” **Ayuda ES:** «Elige la especialidad principal. Si atiendes varias, escoge la predominante; las formas de entrega se preguntan por separado.» **Help EN:** “Choose the main specialty. If you do several, pick the main one; delivery methods are asked separately.”

| value | ES | EN |
| --- | --- | --- |
| restaurant | Restaurante | Restaurant |
| cafe | Cafetería | Café or coffee shop |
| food_truck | Comida móvil / food truck | Food truck or mobile food service |
| lodging **NEW** | Hospedaje y alojamiento | Lodging and accommodation |
| catering **NEW** | Catering y servicios de comida para eventos | Catering and food service for events |
| other | Otra especialidad de este sector | Another specialty in this field |
| unknown | Todavía no lo sé | I'm not sure yet |

**Decisión:** REWRITE con dos especialidades nuevas, que requieren actualizar registro NICHE_REGISTRY, versiones y arquetipos **solo tras aprobación técnica futura**, sin cambiar el resto de sectores automáticamente. **Elegibilidad actual:** q2_sector=food_hospitality; el evento de clasificación q2_sector + q2_niche_food_hospitality se registra unido en el prototipo, pero debe preservar el criterio real de turno de D020 (no empaquetar decisiones independientes artificialmente para eludir 24). **Evidencia:** nicho declarado, no score. **Neutralidad:** other no se convierte en restaurant; unknown no activa pruebas de menú. **Control:** C08 sin presencia online, hotel sin restaurante, actividad con catering y restaurante; menú especializado solo para restaurante/café/food truck cuando aplica.

### Gates de cierre y resumen

- **Estado editorial delegado:** 8 fichas de este lote con decisión de diseño; **16/16 fichas de Lotes 01+02 tienen dictamen documental**, no certificación de los 77 componentes del banco completo. En Lote 02: **3 KEEP**, **5 REWRITE**; ninguna pregunta se elimina o activa.
- **Cuestiones verificadas:** q2_delivery es multi (no error de tipo); no hay duplicación literal demostrada de valor nonprofit_community en sector compuesto. Queda **mezcla conceptual de ejes**, no duplicado de ID probado.
- **Bloqueos P0 del próximo agente, no autorizados aún:** cerrar taxonomía sectorial con migración de selector B2B/creadores/ONG; corregir ausencia de neutralidad en fricción; preservar C05 sin financiación; no inventar evidencia de madurez. La separación de no publicado/no aplica/no sé de la decisión SEM-A será aplicada al lote de preguntas de presencia digital, donde corresponde.
- **Pruebas futuras (NO EJECUTADAS):** opciones únicas en sector; elegibilidad de todos los nichos, cambio sector/nicho y replay; validación multi/exclusividad delivery; C02/C03/C05/C06/C08/C09/C10; ausencia de score por objetivo, fricción, sector, modalidad o financiación; equivalencia es/en; presupuesto 24+5 y consentimiento; V8 sin cambios.
- **Límites invariables:** diseño/editorial solamente. No TS, tests, CI, D1, rutas, despliegue, merge ni producción. Ningún value propuesto o cambio de versión se considera implementado.

**Estado resultante:** EDITORIAL_DESIGN_16_OF_16_LOTES_01_02; LANGUAGE_AND_COGNITIVE_VALIDATION_PENDING; F02_OPEN; PLAN_ONLY.

### Changelog

- **0.5.0 / 2026-10-31:** Lote 02 completo ES/EN, ocho decisiones editoriales delegadas, neutralidad y guardias; corregidas dos hipótesis iniciales de auditoría tras consultar el banco compuesto. No se alteró código ni se ejecutaron tests.
