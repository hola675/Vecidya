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

- **Estado editorial delegado:** 8 fichas de este lote con decisión de diseño; **16/16 fichas de Lotes 01+02 tienen dictamen documental**, no certificación de los 77 componentes del banco completo. En Lote 02: **2 KEEP**, **6 REWRITE**; ninguna pregunta se elimina o activa.
- **Cuestiones verificadas:** q2_delivery es multi (no error de tipo); no hay duplicación literal demostrada de valor nonprofit_community en sector compuesto. Queda **mezcla conceptual de ejes**, no duplicado de ID probado.
- **Bloqueos P0 del próximo agente, no autorizados aún:** cerrar taxonomía sectorial con migración de selector B2B/creadores/ONG; corregir ausencia de neutralidad en fricción; preservar C05 sin financiación; no inventar evidencia de madurez. La separación de no publicado/no aplica/no sé de la decisión SEM-A será aplicada al lote de preguntas de presencia digital, donde corresponde.
- **Pruebas futuras (NO EJECUTADAS):** opciones únicas en sector; elegibilidad de todos los nichos, cambio sector/nicho y replay; validación multi/exclusividad delivery; C02/C03/C05/C06/C08/C09/C10; ausencia de score por objetivo, fricción, sector, modalidad o financiación; equivalencia es/en; presupuesto 24+5 y consentimiento; V8 sin cambios.
- **Límites invariables:** diseño/editorial solamente. No TS, tests, CI, D1, rutas, despliegue, merge ni producción. Ningún value propuesto o cambio de versión se considera implementado.

**Estado resultante:** EDITORIAL_DESIGN_16_OF_16_LOTES_01_02; LANGUAGE_AND_COGNITIVE_VALIDATION_PENDING; F02_OPEN; PLAN_ONLY.

### Changelog

- **0.5.0 / 2026-10-31:** Lote 02 completo ES/EN, ocho decisiones editoriales delegadas, neutralidad y guardias; corregidas dos hipótesis iniciales de auditoría tras consultar el banco compuesto. No se alteró código ni se ejecutaron tests.


## Lote editorial 03 — presencia, descubrimiento, confianza y acceso (2026-10-31)

**Versión documental acumulada 0.6.0 — DECISIONES EDITORIALES DELEGADAS / PLAN_ONLY.** Ocho preguntas del candidato V9 analizadas desde fuentes del HEAD inicial ed4375b7b0046ec39b34b8b2a6fca01e5e8a5dd1. Se conserva este documento editorial y se amplía por lotes sin crear archivos Markdown adicionales. La aprobación delegada comprende únicamente la especificación de diseño ES/EN; **ningún texto, value, regla, scoring ni versionado ha sido modificado en la aplicación**. Las pruebas de comprensión lingüística, evaluación y E2E no se han ejecutado.

### Contratos y fronteras comprobados antes de decidir

- Composición: qa03b/specialty-branches-wave1.ts ← specialty-candidate-bank.ts ← qa03b/editorial-copy.ts aplicado sobre qa03b/bank.ts ← qbv2-reviewed-evidence.ts, qbv2-reviewed-transversal.ts, qbv2-reviewed-local-trust.ts, qbv2-reviewed-discovery.ts y qbv2-reviewed-local-appointments-professional.ts. Las elegibilidades adicionales se deben componer sin invalidar el fallback genérico.
- En el candidato, q2_presence_digital_base admite active/prelaunch a través de override en bank.ts; q2_presence_offer_clarity requiere una presencia reliable/partial y su sustitución gastronómica depende de **más** condiciones. No extender la pregunta de claridad a negocios sin presencia solo porque «falta digitalización».
- q2_reputation_flow conserva guardia añadida de operating AND historial de personas reales, incluso si las reseñas originales tenían criterio de activity=active. q2_service_response_speed exige servicio local y operación. q2_professional_authority_signals depende además de necesidad de confianza y sector profesional.
- La evidencia V3 existente asocia base y datos locales a digital_foundation; claridad a clarity_positioning; adquisición regular a discovery; reseñas y experiencia profesional a trust_reputation; primera respuesta a conversion_access. Estas son **dimensiones candidatas**, no taxonomía final ratificada. q2_food_menu_visibility declara evidencia directa de clarity_positioning solo cuando resulta elegible.
- **Regla editorial obligatoria D-V9-SEM-A:** not_published = ausencia observada de publicación; not_applicable = una exigencia que legítimamente no corresponde al modelo; unknown = no hay conocimiento fiable. No son intercambiables ni significan automáticamente weak. La ausencia de presencia pública puede ser evidencia de digital_foundation=missing *si aplica*, pero **no** prueba clarity_positioning=weak ni trust_reputation=weak. Los valores existentes se preservan históricamente por versión.

### Resumen de las ocho resoluciones

| Ficha | ID | Versión fuente → versión objetivo* | Resolución | Motivo principal |
| --- | --- | --- | --- | --- |
| 17 | q2_presence_digital_base | 2 → 3* | **REWRITE** | Distinguir presencia ausente, presencia no necesaria en contexto y desconocimiento sin inferir calidad de oferta |
| 18 | q2_presence_offer_clarity | 2 → 3* | **REWRITE** | Añadir estado sin oferta publicada, preservar no aplicable auténtico y fallback |
| 19 | q2_local_presence_consistency | 2 → 3* | **REWRITE** | Separar datos publicados incorrectos, datos sin publicar y campos legítimamente no aplicables |
| 20 | q2_discovery_reliable_reach | 1 → 1 | **KEEP / COPY_REFINED** | Cinco opciones ya distinguen fiabilidad, búsqueda no activa y desconocimiento |
| 21 | q2_reputation_flow | 3 → 4* | **REWRITE** | No exigir reseñas por volumen; reconocer ausencia de publicación y confidencialidad |
| 22 | q2_service_response_speed | 2 → 3* | **REWRITE** | Separar respuesta tardía de ausencia de nuevas consultas e inaplicabilidad real |
| 23 | q2_professional_authority_signals | 2 → 3* | **REWRITE** | No exigir cartera pública con datos confidenciales; separar falta de publicación y N/A |
| 24 | q2_food_menu_visibility | 1 → 2* | **REWRITE / SEM-A crítica** | La opción actual not_applicable significa «todavía no muestro», contradicción semántica |

*Versiones objetivo **propuestas** para una futura implementación V9, no nuevos contratos activos ni autorización de cambios de valores en QBV2/V8. La pregunta 20 no necesita nueva identidad semántica por esta revisión. Decisiones: **1 KEEP, 7 REWRITE, 0 REMOVE**.

### Ficha 17 — q2_presence_digital_base · v2 actual, v3 objetivo

**ES editorial:** «Si alguien busca tu actividad en internet, ¿encuentra información pública vigente para conocerte y contactarte?»  
**EN editorial:** “If someone looks for your activity online, can they find up-to-date public information to learn about you and contact you?”  
**Ayuda ES:** «Puede ser una web, ficha, perfil o plataforma. Importa que la información sea correcta y accesible; no necesitas tener una web propia.»  
**Help EN:** “It may be a website, listing, public profile, or platform. The information should be accurate and accessible; you don't need to own a website.”

| value existente | ES futuro | EN futuro | Lectura de diseño |
| --- | --- | --- | --- |
| reliable_presence | Sí, encuentro al menos un lugar con información correcta y actualizada. | Yes, there is at least one place with accurate, current information. | Evidencia de digital_foundation establecida, si aplica y está respaldada |
| partial_presence | Hay información pública, pero está incompleta o desactualizada. | Public information exists, but it is incomplete or out of date. | Parcial, no inferir claridad de oferta |
| no_reliable_presence | No encuentro un lugar público con información fiable y actualizada. | There is no public place with reliable, up-to-date information. | Puede ser foundation=missing si la presencia resulta pertinente; equivale a ausencia/no publicación en el canal, NO a «claridad débil» |
| not_applicable | La actividad no necesita que el público pueda encontrarla directamente por internet. | This activity does not need to be directly discoverable by the public online. | Neutral solo con justificación del modelo y gate; «no lo necesito» sin contexto no prueba N/A |
| unknown | No lo he comprobado o no tengo información suficiente. | I haven't checked or don't have enough information. | kind=unknown; abstención |

**Elegibilidad observada:** override de bank.ts admite active/prelaunch; en pausa no inferir disponibilidad presente. **Tipo:** single. **Evidencia:** mapeo directness=direct de digital_foundation v2, pero el diseño necesita rúbrica de pertinencia para validar not_applicable. **Decisión:** REWRITE semántica de opción N/A y ayuda con identidad futura; evitar añadir un nuevo value not_published redundante con no_reliable_presence sin demostrar diferencia observable. **Controles:** C02, C03, C08, C10 y negocio que depende de un marketplace.

### Ficha 18 — q2_presence_offer_clarity · v2 → v3 objetivo

**ES editorial:** «Cuando alguien ve tu información pública en internet, ¿entiende qué ofreces sin tener que preguntarte?»  
**EN editorial:** “When someone sees your public information online, can they understand what you offer without having to ask?”  
**Ayuda ES:** «Evalúa lo que aparece publicado, no las ventas. Si no has publicado aún la oferta, indícalo; no confundas eso con información publicada que resulta difícil de entender.»  
**Help EN:** “Assess what is published, not sales. If the offer hasn't been published yet, say so; that is different from published information that is hard to understand.”

| value | ES | EN | Lectura |
| --- | --- | --- | --- |
| clear | La oferta publicada se entiende claramente. | The published offer is clear. | clarity_positioning: established si hay evidencia directa |
| partial | Se entiende en parte, pero faltan detalles importantes. | It is partly clear, but important details are missing. | partial |
| unclear | La oferta está publicada, pero resulta difícil entenderla. | The offer is published but hard to understand. | weak sobre contenido existente, no sobre ausencia de sitio |
| not_published **NEW** | Todavía no he publicado qué ofrezco en ese lugar. | I haven't published what I offer there yet. | Estado de publicación contextual; **no** convertir automáticamente en clarity weak |
| not_applicable | Mostrar una oferta pública en ese lugar no corresponde a mi actividad. | Publishing an offer in that location isn't appropriate for this activity. | Neutral con justificación; no alternativa fácil a no publicado |
| unknown | No lo he comprobado desde la perspectiva de alguien nuevo. | I haven't checked it from a new visitor's perspective. | incertidumbre |

**Tipo:** single. **Elegibilidad observada:** materialAppliesWhen exige actividad active/prelaunch y base digital reliable/partial; specialty branch agrega exclusión cuando reemplazo gastronómico o agencia es efectivamente elegible. **Evidencia:** clarity_positioning v2 con directness=direct; nuevo not_published debe pasar a context_only/abstención de claridad hasta rúbrica aprobada. **Decisión:** REWRITE v3 para separar tres valores y no quitar la pregunta genérica si su reemplazo no es elegible. **Controles:** C02, C08 y agencia con presencia incompleta. No preguntar cuando q2_presence_digital_base=no_reliable_presence.

### Ficha 19 — q2_local_presence_consistency · v2 → v3 objetivo

**ES editorial:** «Cuando alguien busca tu actividad en internet, ¿encuentra correctos los datos necesarios para contactarte o visitarte?»  
**EN editorial:** “When someone finds your activity online, are the details they need to contact or visit you accurate?”  
**Ayuda ES:** «Considera teléfono, WhatsApp, dirección y horarios solo cuando correspondan. No se exige local físico a un negocio que no atiende presencialmente.»  
**Help EN:** “Consider phone, messaging, address, and opening hours only when relevant. A physical address isn't required for an activity that doesn't serve people in person.”

| value | ES | EN | Lectura |
| --- | --- | --- | --- |
| consistent | Los datos que corresponden a mi actividad son correctos y actuales. | The relevant details are accurate and up to date. | digital_foundation established |
| partial | Algunos datos publicados están incompletos o desactualizados. | Some published details are incomplete or outdated. | partial |
| no | Los datos publicados son incorrectos o no permiten contactarme. | Published details are wrong or don't allow people to contact me. | weak solo de datos publicados si la actividad los necesita |
| not_published **NEW** | No he publicado todavía los datos que corresponden a mi actividad. | I haven't yet published the details relevant to my activity. | Estado de publicación; evaluar relevancia antes de asignar missing |
| not_applicable **NEW** | No necesito publicar datos locales de visita o atención presencial. | I don't need to publish local visit or in-person service details. | Neutral solo respecto a datos locales, no equivale a «sin contacto digital» |
| unknown | No lo he revisado recientemente. | I haven't checked recently. | incertidumbre |

**Tipo:** single. **Elegibilidad observada:** active + arquetipos local/retail/hospitality, sin guardia de presencia digital explícita en pregunta base; diseñar gate que no repita pregunta cuando ya se sabe que no existe ubicación pública. **Evidencia:** digital_foundation directness=direct v2; **no sumar** esta observación y q2_presence_digital_base como dos pruebas independientes del mismo fallo. **Decisión:** REWRITE para separar disponibilidad, corrección y N/A de ubicación; evitar penalización de quien trabaja exclusivamente a domicilio. **Controles:** C06, C08 y negocio sin local físico.

### Ficha 20 — q2_discovery_reliable_reach · KEEP v1

**ES editorial:** «En los últimos meses, ¿has logrado llegar con constancia a personas nuevas interesadas en lo que ofreces?»  
**EN editorial:** “In recent months, have you consistently reached new people interested in what you offer?”  
**Ayuda ES:** «Cuenta cualquier medio: recomendaciones, búsqueda, redes sociales, anuncios o contactos directos. Si ahora no buscas personas nuevas, indícalo.»  
**Help EN:** “Count any channel: referrals, search, social media, advertising, or direct outreach. If you aren't trying to reach new people right now, say so.”

| value | ES | EN | Lectura |
| --- | --- | --- | --- |
| reliable | Sí, llega gente nueva de forma bastante constante. | Yes, new people reach us fairly consistently. | discovery established, sujeto a evidencia |
| irregular | Algunas veces, pero de manera poco constante. | Sometimes, but not consistently. | partial |
| weak | No tengo una vía que genere interés nuevo con constancia. | I don't have a channel that consistently generates new interest. | weak solo si captar personas nuevas es objetivo pertinente |
| not_seeking | Ahora mismo no estamos buscando llegar a personas nuevas. | We're not currently trying to reach new people. | context_only, no weak ni not_applicable universal |
| unknown | No tengo datos para determinarlo. | I don't have enough information to tell. | incertidumbre |

**Tipo:** single. **Elegibilidad de origen:** activity=active; no pregunta de resultados reales en un proyecto en preparación ni en pausa. **Evidencia:** discovery directness=direct v1, pero «consistencia» no significa necesariamente ventas. **Decisión:** KEEP sin introducir values nuevos; matizar el objetivo y respetar not_seeking. **Controles:** C02, C03, C05, C09; si no hay evidencia digital específica, no afirmar crecimiento por canal.

### Ficha 21 — q2_reputation_flow · v3 → v4 objetivo

**ES editorial:** «¿Las personas que quieren conocerte pueden consultar reseñas, testimonios u otras experiencias públicas verificables?»  
**EN editorial:** “Can people who want to learn about you find public reviews, testimonials, or other verifiable accounts of past experience?”  
**Ayuda ES:** «No necesitas un número mínimo de reseñas. Respeta las obligaciones de confidencialidad y los casos en que publicar experiencias de clientes no corresponde.»  
**Help EN:** “There is no minimum review count. Respect confidentiality and situations where publishing client experiences isn't appropriate.”

| value | ES | EN | Lectura |
| --- | --- | --- | --- |
| strong | Hay referencias públicas suficientes y vigentes para conocer experiencias reales. | There are enough current public references to understand real experiences. | established solo tras rúbrica de calidad, no cantidad arbitraria |
| partial | Hay algunas referencias, pero son limitadas o incompletas. | Some references exist, but they're limited or incomplete. | partial |
| weak | Las referencias publicadas son difíciles de verificar o aportan muy poca información útil. | Published references are hard to verify or provide little useful information. | weak del contenido publicado cuando es pertinente |
| not_published **NEW** | No publicamos reseñas ni testimonios actualmente. | We don't currently publish reviews or testimonials. | Contextual; no etiquetar automáticamente confianza débil |
| not_applicable **NEW** | Publicar experiencias individuales no corresponde por confidencialidad u otra razón legítima. | Publishing individual experiences isn't appropriate because of confidentiality or another legitimate reason. | N/A condicionado, no penalizar sector legal/salud |
| unknown | No sé qué puede encontrar una persona nueva. | I'm not sure what a new person can find. | incertidumbre |

**Elegibilidad compuesta:** q2_operational_status=operating AND q2_has_customers=yes, más condición activity=active. **Evidencia:** trust_reputation directness=direct v3; distinguir referencias reales, autorización para publicarlas y calidad de evidencia. **Decisión:** REWRITE; no imponer reseñas como única señal de confianza; estudiar sustitución por credenciales autorizadas cuando la privacidad impide testimonios, sin sumar la misma evidencia dos veces. **Controles:** C04, C05 y especialidades con confidencialidad.

### Ficha 22 — q2_service_response_speed · v2 → v3 objetivo

**ES editorial:** «Cuando alguien te contacta por primera vez, ¿recibe una respuesta útil dentro de un plazo razonable para tu actividad?»  
**EN editorial:** “When someone contacts you for the first time, do they receive a useful reply within a reasonable time for your activity?”  
**Ayuda ES:** «Cuenta llamadas, mensajes y formularios reales. No presupongas atención inmediata o 24/7; considera el horario y tipo de servicio.»  
**Help EN:** “Consider actual calls, messages, and forms. Don't assume immediate or 24/7 service; consider your operating hours and service type.”

| value | ES | EN | Lectura |
| --- | --- | --- | --- |
| strong | Casi siempre respondemos de manera útil y a tiempo. | We almost always provide a helpful, timely response. | conversion_access established si hay casos observables |
| partial | Respondemos, pero a veces con demoras relevantes. | We reply, but sometimes with meaningful delays. | partial |
| weak | Frecuentemente las primeras consultas quedan sin respuesta o llegan demasiado tarde. | Initial inquiries are often unanswered or answered too late. | weak |
| no_inquiries **NEW** | Todavía no hemos recibido primeras consultas de ese tipo. | We haven't received initial inquiries of that kind yet. | insuficiencia de observaciones, no N/A ni weak |
| not_applicable **NEW** | Nuestra actividad no recibe consultas iniciales directas por este medio/proceso. | Our activity doesn't receive direct first inquiries through this process. | N/A con verificación de modalidad; no usar si existe otro canal donde sí responder |
| unknown | No tengo registros o información suficiente. | I don't have records or enough information. | incertidumbre |

**Elegibilidad:** servicio local activo por arquetipo local_service y guardia operating en bank.ts; actualmente no exige historial positivo, lo que justifica no_inquiries. **Evidencia:** conversion_access directness=direct v2; la ausencia de consultas no prueba mala atención. **Decisión:** REWRITE con dos states adicionales y reglas de plazo contextual, no SLA ficticio. **Controles:** C02, C06 y negocio sin mensajes entrantes; respuesta automática no equivale a respuesta útil.

### Ficha 23 — q2_professional_authority_signals · v2 → v3 objetivo

**ES editorial:** «Si alguien no te conoce, ¿puede verificar información apropiada que respalde tu experiencia profesional?»  
**EN editorial:** “If someone doesn't know you, can they verify appropriate information about your professional experience?”  
**Ayuda ES:** «Puede ser trayectoria, credenciales, trabajos públicos o información permitida. No reveles expedientes ni datos de clientes.»  
**Help EN:** “This may include experience, credentials, publicly shareable work, or other permitted information. Don't disclose client records or private data.”

| value | ES | EN | Lectura |
| --- | --- | --- | --- |
| clearly_visible | Sí, hay información pública suficiente, pertinente y fácil de comprobar. | Yes, relevant public information is easy to find and verify. | trust_reputation established si demuestra experiencia relevante |
| partial | Existe algo de información, pero está dispersa o incompleta. | Some information exists, but it's scattered or incomplete. | partial |
| not_really | Hay información pública, pero no permite comprobar adecuadamente la experiencia. | Some public information exists, but it doesn't adequately support the claimed experience. | weak solo respecto a evidencia publicada |
| not_published **NEW** | No publicamos información sobre experiencia o credenciales. | We don't currently publish experience or credential information. | publicación ausente; confianza general en abstención |
| not_applicable **NEW** | Publicar ese tipo de evidencia no está permitido o no corresponde en esta actividad. | Publishing that type of evidence isn't allowed or isn't appropriate for this activity. | N/A condicionado; revisar alternativa segura |
| unknown | No sé qué puede encontrar o comprobar alguien nuevo. | I'm not sure what a new person can find or verify. | incertidumbre |

**Elegibilidad observada:** activity=active, sector profesional legal/finanzas/servicios profesionales/inmobiliario y meta o fricción de confianza; no universal. **Evidencia:** trust_reputation directness=direct v2. **Decisión:** REWRITE para no penalizar ausencia de portafolio público por deberes de privacidad; evaluar credenciales verificables no confidenciales. **Controles:** C04 y profesiones reguladas; no inferir legalidad ni permiso de uso de marcas/certificaciones.

### Ficha 24 — q2_food_menu_visibility · v1 → v2 objetivo

**ES editorial:** «Si alguien encuentra tu restaurante, cafetería o comida móvil en internet, ¿puede ver una selección actual de lo que ofreces?»  
**EN editorial:** “If someone finds your restaurant, café, or mobile food business online, can they see an up-to-date selection of what you offer?”  
**Ayuda ES:** «La selección puede estar en tu web, perfil o ficha pública. No hace falta mostrar todo el inventario ni revelar precios si no corresponde. Distingue no publicado de una oferta publicada poco clara.»  
**Help EN:** “The selection may appear on your website, public profile, or listing. You don't need to show every item or disclose prices where inappropriate. Distinguish unpublished information from an unclear published offer.”

| value | ES | EN | Lectura |
| --- | --- | --- | --- |
| clear | Sí, la selección publicada es suficientemente clara y está actualizada. | Yes, the published selection is clear enough and up to date. | clarity_positioning established si evidencia directa |
| partial | Se muestra una parte, pero faltan datos importantes o actualidad. | Part of the offer is shown, but important details or updates are missing. | partial |
| unclear | Hay una oferta publicada, pero cuesta saber qué se puede pedir. | An offer is published, but it's hard to tell what can be ordered. | weak respecto a contenido publicado |
| not_published **NEW** | Todavía no hemos publicado una selección de la oferta en ese lugar. | We haven't published a selection of our offer there yet. | estado de publicación; **no equivale a not_applicable ni a claridad weak automática** |
| not_applicable | No existe una selección predeterminada que corresponda publicar para este tipo de servicio. | There is no predefined selection appropriate to publish for this service. | N/A con validación de modelo; no usar por ausencia de página |
| unknown | No lo hemos comprobado desde la perspectiva de quien nos encuentra. | We haven't checked what someone finding us can see. | incertidumbre |

**Elegibilidad del banco vigente:** operating AND has_customers=yes AND q2_sector=food_hospitality AND nicho restaurant/cafe/food_truck AND q2_goal=explain AND base digital reliable/partial. No preguntar a un alojamiento puro, negocio pausado o restaurante sin presencia digital fiable; en esos casos conservar respuesta de base digital y abstenerse de declarar claridad débil sin observación directa. **Evidencia actual:** clarity_positioning directness=direct, not_applicable actualmente mapea N/A aunque la etiqueta dice «todavía no muestro». **Decisión:** REWRITE v2 y value nuevo not_published, versionar evidenceV3; no remapear las respuestas v1 de forma silenciosa. **Controles:** C08 y sustitución segura de q2_presence_offer_clarity cuando el reemplazo efectivamente sea elegible.

### Contrato único de evidencia, elegibilidad y riesgos

1. **Inventario focal de fuente:** ocho preguntas actuales, **36 opciones** (5+5+4+5+4+4+4+5). Es inventario por lectura de las definiciones citadas y overrides conocidos, no extracción ejecutada del banco final. **Propuesta de diseño:** 46 opciones (5+6+6+5+6+6+6+6), 10 opciones netas adicionales, sujeto a revisión de identidad/versiones. Los ocho IDs siguen siendo los mismos; **siete requieren futura versión** y uno solo copy. No afirmar que las 46 opciones existen en runtime.
2. **No mezclar dimensiones:** digital_foundation puede estar missing; eso no asigna automáticamente weak a claridad, confianza o adquisición. La calidad de respuesta inicial es acceso, no volumen de venta. No duplicar evidencia entre base y consistencia local, ni entre reseñas y credenciales.
3. **Reglas neutrales:** unknown implica incertidumbre; not_applicable exige justificación y gate contextual; not_published representa una observación de publicación ausente. No decidir automáticamente un score de madurez global por ausencia de sitio, menú o testimonios. Donde «no publicado» sea una ausencia relevante, discutir rúbrica de fundamento digital, no reinterpretar claridad desde otra dimensión.
4. **F03/F04 futura:** activar solo cuando el selector/engine independiente valide los contextos con respuestas reales, fallback de oferta genérica, replanificación al editar sector o presencia, versiones, replay y 24+5. No heredar imports QBV2 activos en el motor nuevo.
5. **Casos negativos futuros:** C02 (prelaunch, sin historial), C03 (pausa), C04 (profesional sin portafolio público por privacidad), C05 (organización sin donaciones/reseñas), C06 (servicios locales), C07 (ecommerce sin autorización de contacto), C08 (restaurante sin presencia), C09 (híbrido; evitar doble puntaje), C10 (sector cambiado/no conocido). Especificaciones para pruebas focalizadas posteriores; **no pruebas ejecutadas**.
6. **Gates no cumplidos:** validar equivalencia ES/EN con usuarios, comprensión cognitiva, categoría not_applicable por contexto, concordancia de cada value con evidencia, aprobación de taxonomía final y recorridos de extremo a extremo. Ningún cambio de scoring se encuentra autorizado por esta documentación.

**Estado documental:** Lote 03 **8/8 decisiones delegadas**, 1 KEEP / 7 REWRITE; acumulado **24/24 fichas editoriales decididas** (6 KEEP / 18 REWRITE), no 24/77 preguntas implantadas ni certificadas. F02 sigue ABIERTA; V9 sigue PLAN_ONLY; no se ha hecho merge, deploy, ejecución CI, cambio TS/TSX/SQL/test ni publicación.

### Changelog
- **0.6.0 (2026-10-31):** Lote 03 completo con ocho fichas bilingües, semántica publicada/N/A/unknown, gates de evidencia y replanificación; 1 KEEP / 7 REWRITE, sin cambios en código o producción.


## Lote editorial 04 — seguimiento, consentimiento y continuidad (2026-10-31)

**Edición documental consolidada 0.7.0 — DESIGN_APPROVED_BY_DELEGATION / PLAN_ONLY.** Continuación de la autorización editorial delegada del propietario. Este lote desarrolla ocho preguntas existentes en el **candidato V9**, con ES/EN, opciones, guardias, señales, neutralidad y criterios de aceptación. Las decisiones de **diseño** están tomadas, pero ninguna versión/optionId/evidencia/guardia de destino se ha incorporado al runtime. No altera V8, GHL ni producción.

### Origen y distinciones verificadas

- HEAD de lectura previo a este lote: dd0e9ea558909a1a38c13de7a4cfd8eeee905e33. Contratos consultados: qa03b/bank.ts y editorial-copy.ts; qbv2-reviewed-commerce.ts, business-audience.ts, transversal.ts, local-appointments-professional.ts, specialized-entry.ts, evidence.ts; qbv2-lote-c.ts y qa03b/v9-editorial-review-matrix.ts como antecedentes. El candidato compuesto preserva identidad de las preguntas del banco reviewed salvo overrides expresos.
- **Tres hechos distintos:** disponer de un medio directo de contacto, contar con una base de autorización aplicable para ese uso y realizar efectivamente el seguimiento. Tener número/correo, seguir a alguien en una red o usar un CRM no prueba consentimiento ni efectividad.
- **Ecommerce C07:** q2_ecommerce_cart_followup existe en el legado qbv2-lote-c.ts y figura en un ledger editorial, pero no se ha localizado como pregunta de las 77 del banco candidato por las fuentes de ensamblaje revisadas. **No contarla como una de las ocho** ni suponer que ejecuta recordatorios. Es una deuda de arquitectura de permisos para recomendaciones, no una invitación a recuperar la pregunta antigua sin rediseño.
- **No imponer herramienta:** papel, memoria fiable, agenda o software pueden describir un proceso observable. Un CRM no es requisito obligatorio para que una respuesta sea favorable; una herramienta sin proceso no constituye evidencia suficiente.
- **Consentimiento por finalidad y canal:** clasificar como conocido/permitido solo cuando esté acreditado para el tipo de contacto. Si es incierto, no asumir permiso. La decisión editorial no es asesoría jurídica ni habilita el envío de mensajes; las bases legales y jurisdicción se verificarán en F07/F08 antes de implementar automatizaciones.
- **No doble contar:** seguimiento genérico y variante sectorial, proceso B2B y visibilidad de estado, recordatorio y nueva cita no son pruebas independientes de un mismo hecho. Si compiten, elegir una observación más específica con gate, sin duplicar puntuación.

### Matriz de decisiones — Lote 04

| # | ID | Fuente → objetivo V9* | Dictamen de diseño | Evidencia / guardia |
| --- | --- | --- | --- | --- |
| 25 | q2_retail_customer_capture | v2 → v3* | **REWRITE** | Vía contactable **con autorización**, no mera captura; retail activo con historial y meta/fricción de seguimiento |
| 26 | q2_creator_audience_ownership | v2 → v3* | **REWRITE** | Canal directo utilizable con permiso; creator activo, sin doble contar con retail |
| 27 | q2_followup_general_process | v2 → v2 | **KEEP / COPY_REFINED** | Continuidad real genérica; no repetir si hay especialista aplicable |
| 28 | q2_service_quote_followup | v2 → v3* | **REWRITE** | Seguimiento tras cotización y permiso; servicio local activo |
| 29 | q2_appointments_rebooking | v2 → v2 | **KEEP / COPY_REFINED** | Siguiente cita cuando realmente se necesita; atención por citas |
| 30 | q2_b2b_pipeline | v2 → v3* | **REWRITE** | Proceso B2B real hasta desenlace; distinguir sin oportunidades |
| 31 | q2_b2b_status_visibility | v2 → v2 | **KEEP / COPY_REFINED** | Recuperación del estado, evidencia de apoyo a digital_readiness |
| 32 | q2_appointments_confirmation_reminders | v2 → v3* | **REWRITE** | Recordatorio pre-cita sin suponer permiso ni asistencia |

*Versiones objetivo sugeridas solo para un futuro contrato V9. Primero verificar posibles colisiones en el HEAD, asegurar replay versionado y no remapear respuestas históricas v2.

### Ficha 25 — q2_retail_customer_capture · v2 → v3 objetivo

**ES:** «Después de una compra, ¿tienes una forma autorizada de volver a contactar al cliente cuando realmente corresponde?»  
**EN:** “After a purchase, do you have an authorized way to contact the customer again when it's appropriate?”  
**Ayuda ES:** «No basta con tener el teléfono o que siga tus redes: considera únicamente los medios que puedes utilizar legítimamente para ese propósito.»  
**Help EN:** “Having a phone number or a social media follower isn't enough. Count only channels you are allowed to use for that purpose.”

| value | ES propuesto | EN proposed | Interpretación de diseño |
| --- | --- | --- | --- |
| consistent | Sí, con la mayoría de clientes tengo un medio directo utilizable con autorización. | Yes, I have an authorized direct channel for most customers. | relación/contactabilidad directa, no prueba que escriba |
| partial | Solo con algunos clientes tengo ese medio autorizado. | I only have such an authorized channel for some customers. | parcial |
| no | Normalmente no conservo un medio directo para volver a contactar. | I usually don't retain a direct way to reach customers. | ausencia conocida de medio; no implica falta de permiso |
| no_permission **NEW** | Tengo algún dato de contacto, pero no autorización para usarlo con esa finalidad. | I have some contact details, but I'm not authorized to use them for that purpose. | Contextual / abstención de contacto; **no inferir consentimiento** |
| not_applicable | Mi actividad no requiere contacto posterior a la compra. | My activity doesn't require post-purchase contact. | N/A legítimo con contexto |
| unknown | No sé si disponemos de medios autorizados. | I'm not sure whether we have authorized contact channels. | incertidumbre |

**Actualidad:** single; materialAppliesWhen: retail activo + meta stop_losing o fricción follow_up; bank.ts añade operating AND q2_has_customers=yes. Evidencia R3J actual: relationship_recurrence directness=direct, consistent/partial/no/not_applicable/unknown. **Cambio crítico:** el nuevo no_permission no se mapeará a no=missing ni a established; exige criterio contextual y versión. **Escenario:** tienda con ventas, datos telefónicos recogidos para facturación pero sin permiso de contacto posterior; jamás recomendar envío directo por suposiciones. No almacenar teléfonos ni consentimientos a partir de esta respuesta de autodiagnóstico.

### Ficha 26 — q2_creator_audience_ownership · v2 → v3 objetivo

**ES:** «Además de publicar contenido, ¿puedes contactar directamente con parte de tu audiencia por un medio que estés autorizado a utilizar?»  
**EN:** “Beyond posting content, can you directly contact part of your audience through a channel you're allowed to use?”  
**Ayuda ES:** «Una persona seguidora no equivale a un contacto autorizado. No importa si usas correo, mensajería u otra vía: importa el permiso y la posibilidad real.»  
**Help EN:** “A follower isn't automatically an authorized contact. Email, messaging, or another channel can count only when it can actually and appropriately be used.”

| value | ES | EN | Semántica |
| --- | --- | --- | --- |
| direct_consistent | Sí, tengo una vía autorizada para comunicarme directamente con una parte significativa. | Yes, I have an authorized direct channel for a meaningful part of my audience. | vía directa declarada, no seguimiento probado |
| direct_limited | Solo puedo contactar directamente y con autorización a una parte pequeña. | I can directly and appropriately contact only a small part. | contacto limitado |
| platform_only | Dependo principalmente de las publicaciones de la plataforma para que vuelvan. | I mainly rely on the platform showing my posts again. | dependencia de plataforma, no conclusión de calidad |
| no_permission **NEW** | Tengo datos o medios, pero no autorización para contactar con esa finalidad. | I have contact details or channels, but no permission for this type of outreach. | contextual neutral; bloquear sugerencia de mensajes |
| not_applicable | No necesito comunicación directa posterior con la audiencia. | My activity doesn't require direct follow-up with my audience. | N/A por modelo |
| unknown | No sé qué canales puedo usar de manera autorizada. | I'm not sure which channels I'm allowed to use. | incertidumbre |

**Elegibilidad actual:** activity=active, businessModel=creator_audience y meta stop_losing o fricción follow_up; bank.ts agrega operating. **Evidencia:** origen reviewed marcado pending, sin mapeo R3 directo para creator; **no elevar por redacción** a relationship_recurrence established ni duplicar con retail. **Gate:** C09 creador con tienda; seleccionar la vía sectorial dominante sin dos scores de la misma lista. Los seguidores, audiencia y datos para otras finalidades no son permiso automático.

### Ficha 27 — q2_followup_general_process · KEEP v2

**ES:** «Cuando alguien espera una respuesta o un siguiente paso, ¿sueles retomar ese asunto a tiempo?»  
**EN:** “When someone is waiting for a reply or next step, do you usually follow up in time?”  
**Ayuda ES:** «Piensa en pendientes reales, no en la herramienta. Puedes organizarte de memoria, en una agenda, con notas o software.»  
**Help EN:** “Think of real pending matters, not the tool. You may use memory, a calendar, notes, or software.”

| value | ES | EN | Lectura |
| --- | --- | --- | --- |
| consistent | Normalmente retomo los pendientes a tiempo. | I usually follow up on time. | relationship_recurrence established si hecho observado |
| partial | Generalmente los retomo, aunque algunos se retrasan. | I generally follow up, although some cases are delayed. | partial |
| sometimes_lost | Con frecuencia algunos asuntos quedan sin retomar. | Some matters are frequently not followed up. | weak solo de continuidad real |
| not_applicable | No tengo actualmente asuntos que necesiten seguimiento posterior. | I currently have no matters that require follow-up. | N/A, sin evaluar capacidad |
| unknown | No sé qué suele suceder. | I'm not sure what normally happens. | incertidumbre |

**Elegibilidad observada:** activity=active, q2_friction=follow_up; excluye arquetipos local_service/appointments/retail, comprador B2B/mixed y creator, más guardia de operating. Es pregunta **fallback**, no universal. Evidencia R3E relationship_recurrence directness=direct. **KEEP:** conservar los cinco values y la separación proceso/herramienta; no añadir una obligación de CRM. **Control:** C02, C05 y C09; si una ruta especializada mide el mismo hecho, no preguntar también esta genérica.

### Ficha 28 — q2_service_quote_followup · v2 → v3 objetivo

**ES:** «Después de enviar una cotización que queda sin respuesta, ¿qué suele pasar con el seguimiento que puedes realizar legítimamente?»  
**EN:** “After sending a quote that receives no reply, what usually happens with any follow-up you're permitted to make?”  
**Ayuda ES:** «Piensa en cotizaciones reales. No contactar no equivale a desorganización si la persona no autorizó ese contacto o no existe la práctica de enviar presupuestos.»  
**Help EN:** “Think of actual quotes. Not contacting someone isn't disorganization when outreach isn't authorized or your service doesn't use quotes.”

| value | ES | EN | Lectura |
| --- | --- | --- | --- |
| consistent | Normalmente hago seguimiento cuando tengo autorización para ello. | I usually follow up when I'm authorized to do so. | relationship_recurrence established, condicionado |
| sometimes | A veces hago seguimiento autorizado, pero no siempre. | I sometimes make authorized follow-ups, but not consistently. | partial |
| rarely | Puedo hacerlo legítimamente, pero normalmente no retomo la cotización. | I am allowed to follow up, but usually don't. | weak de continuidad observada |
| no_permission **NEW** | En esos casos no dispongo de autorización para volver a contactar. | In those cases, I don't have authorization to contact the person again. | abstención/estado contextual, no weak |
| not_applicable | Mi actividad no utiliza cotizaciones previas para contratar. | My activity doesn't use advance quotes for contracting. | N/A |
| unknown | No tengo información suficiente sobre lo que sucede. | I don't have enough information about what happens. | incertidumbre |

**Elegibilidad observada:** servicio local activo; meta opportunities o fricción conversion/follow_up o respuesta inicial weak; bank.ts agrega operating. Evidence R3E relationship_recurrence directness=direct v2. **REWRITE:** añade no_permission solo en V9, con contrato de evidencia contextual nuevo. Si no hubo cotizaciones, el motor debe abstenerse, no forzar respuesta rarely. **Control:** C06 servicio a domicilio, C07 sin permiso si alguna ruta futura aplica.

### Ficha 29 — q2_appointments_rebooking · KEEP v2

**ES:** «Cuando una persona necesita otra cita para continuar su atención, ¿cómo suele organizarse la siguiente?»  
**EN:** “When someone needs another appointment to continue their care or service, how is the next one usually arranged?”  
**Ayuda ES:** «Cuenta servicios que realmente requieren volver. Una atención aislada sin siguiente cita necesaria no es un fallo de continuidad.»  
**Help EN:** “Consider services that actually require another visit. A one-off service with no need to return isn't a follow-up failure.”

| value | ES | EN | Lectura |
| --- | --- | --- | --- |
| proactive | Normalmente queda acordada la próxima cita con anticipación. | The next appointment is usually arranged in advance. | established |
| partial | Algunas se acuerdan de antemano y otras después. | Some are arranged in advance and others later. | partial |
| reactive | Normalmente la persona tiene que volver a contactarnos. | The person usually has to contact us again. | weak solo donde continuidad es pertinente |
| not_applicable | Mi servicio normalmente no necesita una siguiente cita. | My service usually doesn't require a follow-up appointment. | N/A legítimo |
| unknown | No sé cómo se resuelve normalmente. | I'm not sure how this usually works. | incertidumbre |

**Elegibilidad observada:** appointments activo + meta stop_losing o fricción follow_up; bank.ts añade operating AND has_customers=yes. Evidencia R3M relationship_recurrence directness=direct. **KEEP:** distinción entre cita de continuidad necesaria y «fidelización» arbitraria; en el nicho dental existe sustituto especializado condicionado. **Control:** C06, clínica, C10 sector cambiado; gate de exclusividad entre pregunta genérica y dental.

### Ficha 30 — q2_b2b_pipeline · v2 → v3 objetivo

**ES:** «Cuando una organización muestra interés en contratarte, ¿sigues un proceso que permita saber qué hacer después y cómo terminó esa oportunidad?»  
**EN:** “When an organization considers hiring you, do you follow a process that makes the next step and the final outcome clear?”  
**Ayuda ES:** «No es necesario usar un CRM. Importa que el proceso sea consistente y permita conocer el desenlace real, incluso si se lleva en agenda o notas.»  
**Help EN:** “A CRM isn't required. What matters is a consistent process that tracks the real outcome, even with notes or a calendar.”

| value | ES | EN | Lectura |
| --- | --- | --- | --- |
| defined | Sí, el proceso es claro y permite saber qué paso sigue hasta su desenlace. | Yes, the process is clear and tracks next steps through the outcome. | relationship_recurrence established |
| partial | Existe un proceso, pero no se sigue siempre de la misma forma. | There is a process, but it isn't followed consistently. | partial |
| informal | Se maneja cada oportunidad de forma distinta y a veces se pierde la continuidad. | Opportunities are handled inconsistently and continuity is sometimes lost. | weak si se observó |
| no_opportunities **NEW** | Todavía no tenemos oportunidades reales de ese tipo que permitan observar el proceso. | We haven't had real opportunities of that type to assess the process. | insufficient_history/context_only, no weak |
| unknown | No sé si contamos con un proceso consistente. | I'm not sure whether we have a consistent process. | incertidumbre |

**Elegibilidad de origen:** futureB2BApplicability() AND q2_has_customers=yes; bank.ts impone operating y comprador b2b/mixed para módulo b2b. **Tensión:** haber atendido personas antes no prueba tener oportunidades B2B comparables; no_opportunities cubre ese vacío. Evidencia R3L relationship_recurrence directness=direct para defined/partial/informal, sin score para el valor nuevo. **REWRITE:** nueva versión sin exigir software, sin convertir intención de vender en pipeline observado. **Control:** C04 profesional, C05 entidad con subvenciones que no vende, C09 multiactividad.

### Ficha 31 — q2_b2b_status_visibility · KEEP v2

**ES:** «Cuando tienes oportunidades abiertas con empresas u organizaciones, ¿puedes recuperar fácilmente en qué quedó cada una?»  
**EN:** “When you have open opportunities with businesses or organizations, can you easily find out the status of each one?”  
**Ayuda ES:** «No importa si consultas notas, agenda, memoria fiable u otro sistema. Se evalúa poder recuperar el estado, no qué herramienta posees.»  
**Help EN:** “Notes, a calendar, reliable memory, or another system may work. This checks whether you can retrieve the status, not which tool you own.”

| value | ES | EN | Lectura |
| --- | --- | --- | --- |
| clear | Normalmente puedo recuperar el estado de cada oportunidad. | I can usually find the status of each opportunity. | digital_readiness, apoyo |
| partial | Algunas veces necesito reconstruir información para saberlo. | Sometimes I need to piece information back together. | parcial |
| lose_track | A veces no logro recuperar el estado de una oportunidad. | Sometimes I can't recover the status of an opportunity. | débil en recuperar datos, no venta |
| not_applicable | No mantengo oportunidades abiertas entre conversaciones. | I don't keep opportunities open between conversations. | N/A |
| unknown | No tengo información suficiente para evaluarlo. | I don't have enough information to assess it. | incertidumbre |

**Elegibilidad observada:** actividad activa + comprador b2b/mixed + meta organize o fricción operations; bank.ts añade operating y buyerGuard. Evidencia R3F **digital_readiness supporting**, no direct. **KEEP:** cinco values; la existencia de pipeline no prueba recuperar estado ni viceversa; evitar sumarlo como otra observación directa de relationship_recurrence. **Control:** B2B de una sola transacción, organización sin contrataciones, notas sin software.

### Ficha 32 — q2_appointments_confirmation_reminders · v2 → v3 objetivo

**ES:** «Cuando una cita ya está confirmada, ¿con qué frecuencia enviáis un recordatorio por un medio que podéis utilizar adecuadamente?»  
**EN:** “Once an appointment is confirmed, how often do you send a reminder through a channel you're allowed to use?”  
**Ayuda ES:** «Cuenta solo citas reales y recordatorios válidos. No supongas que tener un número permite enviar mensajes, ni que un recordatorio demuestra que la persona asistió.»  
**Help EN:** “Consider actual bookings and appropriate reminders. Having a number doesn't automatically authorize messaging, and a reminder doesn't prove attendance.”

| value | ES | EN | Lectura |
| --- | --- | --- | --- |
| consistent | Casi siempre enviamos un recordatorio cuando corresponde. | We send an appropriate reminder almost every time. | relationship_recurrence established en recordatorio, no en asistencia |
| sometimes | Lo enviamos en algunas citas, pero no siempre. | We send reminders for some appointments, but not all. | partial |
| rarely | Rara vez enviamos recordatorios aunque corresponda hacerlo. | We rarely send reminders even when they are appropriate. | weak solo del proceso pertinente |
| no_authorized_channel **NEW** | No contamos con un canal que podamos utilizar adecuadamente para enviar ese recordatorio. | We don't have a channel we can appropriately use to send that reminder. | contextual/abstención; no autoriza enviar |
| not_applicable | Para este tipo de citas, el recordatorio normalmente no corresponde. | Reminders usually aren't applicable to this type of appointment. | N/A justificado |
| unknown | No sé con qué frecuencia ocurre. | I'm not sure how often it happens. | incertidumbre |

**Elegibilidad observada:** appointments activo, appointmentAttendance=sometimes/often (medida en pregunta previa), más guardia operating AND has_customers=yes; no activar por intuición de ausencia. Evidencia R3K relationship_recurrence directness=direct v2: recordatorio no demuestra asistencia, causas del absentismo ni tasa. **REWRITE:** nueva opción sin canal adecuado y contexto de finalidad; nunca recomendar SMS/WhatsApp/email automáticamente sin verificación. **Control:** citas sin ausencias, C06, prácticas clínicas y C07 si otra ruta reutiliza seguimiento.

### Contrato transversal para F02/F03/F04/F05/F07/F08

1. **Opciones observadas:** 39 en ocho preguntas (5+5+5+5+5+4+5+5). **Diseño objetivo delegado:** 44 opciones (6+6+5+6+5+5+5+6), con cinco values nuevos en cinco preguntas; nada fue añadido a TS ni se modificaron scoringReadiness/evidenceV3. Tres KEEP, cinco REWRITE; no preguntas nuevas ni retiradas.
2. **Permisos y finalidades:** no_permission y no_authorized_channel **NO** equivalen a no guardar contacto, a no hacer seguimiento cuando es posible, ni a not_applicable general de todo el diagnóstico. Son impedimentos/contexto para acciones directas; no generar consejos para enviar campañas, mensajes o recordatorios por ese canal. unknown exige no inferir autorización.
3. **Evidencia:** relationship_recurrence directa en retail, seguimiento genérico, cotización, rebooking, proceso B2B y recordatorios **solo con hechos observados y pertinentes**. Creator pendiente de evidencia; B2B status es solo supporting para digital_readiness. Diferenciar contactabilidad, desempeño y resultados; no puntuar doble.
4. **C07 ecommerce sin permiso:** el cliente puede tener carrito y datos, pero sin canal legítimamente utilizable no se habilita recuperación de carrito. La opción de legado q2_ecommerce_cart_followup no certifica V9; cualquier propuesta futura exige banco nuevo, aplicabilidad, legalidad y tratamiento neutral, sin importarla automáticamente ni usar follow-up como sinónimo de permiso.
5. **Privacidad y separación comercial:** respuestas de autodiagnóstico no confieren permiso de marketing ni habilitan uso de contactos reales; Vecidya/CRM propios son conceptos distintos de GHL y no se conectan contactos o campañas de HighLevel por esta decisión. No capturar en este lote datos personales de clientes.
6. **Versionado y replay:** los cinco IDs con semántica/values nuevos requieren versiones independientes, trazas, replanificación si el usuario edita sector/comprador/estado/meta, prueba de selección de pregunta sustituida y retrocompatibilidad de sesiones históricas. No reinterpretar unknown/no/not_applicable antiguos en base a copy futuro.
7. **Aceptación focal futura (SIN EJECUCIÓN):** C03 paused con historial (no follow-up corriente); C04 profesional individual B2B; C05 nonprofit sin comprador ni donantes; C06 citas con y sin seguimiento necesario; C07 ecommerce no contactable; C09 creador+retail sin duplicación; C10 cambio de sector; guardias de permiso real, 24+5 e insuficiencia de evidencia. Los tests serán **focales**, no globales, después de autorización.
8. **No equivale a certificación:** diseño ES/EN especificado, falta revisión cognitiva bilingüe, conformidad legal contextual, integración de evidencias, pruebas, backend y lanzamiento. PLAN_ONLY sin modificación de código/CI/producción.

**Estado editorial acumulado:** cuatro lotes × ocho fichas = **32 decisiones de diseño** (Lote 01 3 KEEP/5 REWRITE; Lote 02 2/6; Lote 03 1/7; Lote 04 3/5) = **9 KEEP / 23 REWRITE**. No significa que 32/77 estén implementadas o certificadas; F02 permanece abierta y el banco candidato V9 de 77 permanece sin cambios de runtime.

### Changelog documental

- **0.7.0 / 2026-10-31:** lote 04 de ocho fichas ES/EN sobre contacto, consentimiento, seguimiento, citas y B2B; 3 KEEP / 5 REWRITE; cinco values futuros y gates de no contacto, sin código ni tests nuevos.


## Lote editorial 05 — medición, decisiones y operaciones

**Documento editorial acumulado v0.8.0 — DECIDIDO COMO DISEÑO DELEGADO / PLAN_ONLY.** Ocho fichas existentes del banco candidato V9 con opciones ES/EN, guardias, semántica de evidencia y condiciones de revisión. Se conservan los IDs actuales; nuevas versiones/values **solo propuestos**. No se cambia runtime, CI, tests, D1 ni producción. Los textos y contratos propuestos no equivalen a certificación cognitiva o bilingüe.

**Lectura de referencia:** HEAD 16e0a29def75e426e605e78c5dab1ffa70c000d3, qa03b/bank.ts, qa03b/editorial-copy.ts, qbv2-reviewed-operational-context.ts, qbv2-reviewed-transversal.ts y qbv2-reviewed-evidence.ts. Los IDs 33–36 y 40 se definen/añaden en qa03b/bank.ts; 37–39 provienen de las preguntas reviewed ensambladas por el banco. Evidencia de origen es declarativa y puede cambiar en el contrato V9 futuro; no se han ejecutado recorridos.

### Política de interpretación única

1. **Se miden tres hechos diferentes:** disponer de datos, registrar el desenlace de un caso y **utilizar** resultados para decidir. No convertir disponer de hojas/CRM/analytics en «optimización establecida».
2. **No duplicar evidencia directa de measurement_optimization:** q2_measurement_rate_estimate, result_recording, review_cycle y measurement_practice se solapan parcialmente. Selección sustituta por escenario y jerarquía de evidencias, no cuatro sumandos independientes. La pregunta de práctica global puede ser fallback sectorial mientras la desagregación sirve para resolver incertidumbre real, sin más turnos inútiles.
3. **No imponer ventas:** comunidades, ONG, proyectos en preparación, actividades sin oportunidades o servicios sin compra directa no deben responder un porcentaje comercial falso. Valor *not_transactional* (nuevo) es distinto de *no_opportunities* (todavía no ha ocurrido el caso) y de *unknown* (no sabe). La ausencia de casos da abstención, no «cero conversiones».
4. **Operación ≠ digitalización:** tareas repetibles, documentos accesibles, traspasos correctos y datos en papel describen capacidad de proceso; no demuestran por sí solos un sistema digital implantado. Las rúbricas de digital_readiness deben separar evidencia operativa de evidencia de ejecución digital y abstenerse si falta esta última.
5. **Escalas y reportes:** sin cantidades observadas, no inventar porcentajes, tendencias, ROI, resultados, puntuación de madurez ni comparaciones. «No aplica» y «No lo sé» son salidas válidas; «no uso herramientas» no penaliza cuando no existe necesidad digital pertinente.
6. **Ruta:** no presentar las ocho preguntas necesariamente a cada usuario; 24 interacciones estándar, +5 excepcional con consentimiento; C01–C10 y matriz 8×10 se auditarán en F03. El contexto del Lote 01 (estado/cliente/entidad) y Lote 02 (modelo/objetivo) gobierna guardias, no una presunción universal de negocio comercial.

### Tabla de decisiones del Lote 05

| # | ID | Fuente → versión objetivo futura* | Decisión | Riesgo que corrige |
| --- | --- | --- | --- | --- |
| 33 | q2_measurement_rate_estimate | v1 → v2* | **REWRITE** | Tasa comercial obligatoria en organizaciones sin ventas |
| 34 | q2_measurement_result_recording | v1 → v2* | **REWRITE** | Fallback solo si respuesta anterior=unknown; confunde tasa con seguimiento de desenlace |
| 35 | q2_measurement_review_cycle | v1 → v1 | **KEEP** | Se distingue revisión con decisiones del mero registro |
| 36 | q2_measurement_practice | v1 → v2* | **REWRITE** | Mezcla registrar y revisar, y puede duplicar evidencia de 33–35 |
| 37 | q2_process_systemization | v2 → v3* | **REWRITE** | Procesos manuales no prueban digital readiness y faltaba N/A de tareas no repetibles |
| 38 | q2_operations_information_base | v2 → v3* | **REWRITE** | Saber recuperar papel/agenda no demuestra capacidad digital directa |
| 39 | q2_operations_handoffs | v2 → v2 | **KEEP** | Ya es evidencia supporting, con guardia de más de una persona |
| 40 | q2_digital_tools_in_use | v1 → v1 | **KEEP** | Inventario de herramientas contextual, sin evidenceV3 directa |

*Los números objetivo implican verificar colisiones, contratos de signal/evidence, versionado y replay antes de programar. **3 KEEP / 5 REWRITE, 0 REMOVE**. Los ocho IDs son del banco candidato y no representan preguntas añadidas.

### Ficha 33 — q2_measurement_rate_estimate · REWRITE v2 objetivo · single

**ES:** «Cuando recibes consultas o solicitudes que pueden terminar en una compra o contratación, ¿puedes estimar qué proporción llega a concretarse?»  
**EN:** “When you receive inquiries that could lead to a purchase or contract, can you estimate what proportion actually moves forward?”  
**Ayuda ES:** «No calcules un porcentaje ahora. Importa si podrías obtenerlo habitualmente de información fiable. Si no hay compra directa o aún no existen esas consultas, elige la respuesta correspondiente.»  
**Help EN:** “Don't calculate a percentage now. What matters is whether your usual records could support a reliable estimate. If you don't use direct purchases or haven't had those inquiries, select that option.”

| value | ES aprobado para diseño | EN draft |
| --- | --- | --- |
| can_estimate | Sí, puedo estimarlo habitualmente con datos registrados. | Yes, I can usually estimate it from recorded data. |
| rough_estimate | Solo puedo hacer una estimación aproximada. | I can only make a rough estimate. |
| no_method | Hay consultas reales, pero no tengo una forma de calcularlo. | There are real inquiries, but I have no method to calculate it. |
| unknown | No sé si contamos con datos suficientes para estimarlo. | I don't know whether we have enough data to estimate it. |
| no_opportunities | Todavía no hemos recibido consultas de ese tipo. | We haven't received inquiries of that kind yet. |
| not_transactional **NEW** | Esta actividad no utiliza compras o contrataciones directas como resultado. | This activity doesn't use direct purchases or contracts as an outcome. |

**Elegibilidad actual:** operating AND hasRealCustomers=yes, sin verificación de modelo de compra. **Nuevo gate objetivo:** permitir solo si existe resultado transaccional pertinente o usar la salida neutral not_transactional y no continuar con este indicador. **Evidencia actual:** measurement_optimization direct; can_estimate=established, rough_estimate=partial, no_method=missing, unknown=uncertainty, no_opportunities=not_applicable. **Contrato futuro:** not_transactional=context_only/N/A verdadero, nunca missing. No mezclar «no hubo casos» con tasa 0 %, ni suponer que una ONG que atiende personas tiene ventas. **Pruebas a diseñar:** C02 prelaunch, C05 ONG gratis, C07 ecommerce sin consultas, C09 híbrido.

### Ficha 34 — q2_measurement_result_recording · REWRITE v2 objetivo · single

**ES:** «Cuando una consulta o pedido termina, ¿registras si se concretó la compra o contratación?»  
**EN:** “When an inquiry or order concludes, do you record whether the purchase or contract went ahead?”  
**Ayuda ES:** «No necesitas calcular un porcentaje. Esta pregunta es sobre anotar el desenlace de casos reales, aunque sea en papel. No corresponde si tu actividad no tiene ese tipo de resultado.»  
**Help EN:** “You don't need a percentage. This checks whether the outcome of real cases is recorded, even on paper. It doesn't apply if your activity has no such outcome.”

| value | ES | EN |
| --- | --- | --- |
| consistent | Sí, normalmente queda registrado el resultado final. | Yes, the final outcome is usually recorded. |
| sometimes | Solo algunos resultados quedan registrados. | Only some outcomes are recorded. |
| not_tracked | Hay casos reales, pero no registramos cómo terminaron. | There are real cases, but we don't record how they ended. |
| unknown | No sé si ese resultado se registra habitualmente. | I'm not sure whether those outcomes are usually recorded. |

**Elegibilidad actual:** operating AND history AND q2_measurement_rate_estimate=unknown. **Decisión REWRITE:** el texto conserva los cuatro values, pero cambia la lógica objetivo: usar como pregunta **sustituta o de aclaración** cuando la tasa no es fiable y existe actividad con desenlace comercial, en vez de abrirla universalmente tras un «no sé». Si la respuesta anterior es no_method o rough_estimate, el motor puede elegirla **solo si aclara evidencia** y cabe en presupuesto; no añadir siempre otro turno. Para no_transactional/no_opportunities, no preguntar, preservar abstención. **Evidencia actual:** measurement_optimization directa (consistent/partial/missing/uncertainty). **No doble contar** registros y estimación comercial. **Pruebas futuras:** cambio y replay de respuesta rate_estimate, deduplicación de evidencia.

### Ficha 35 — q2_measurement_review_cycle · KEEP v1 · single

**ES:** «¿Revisas los resultados de tu actividad con cierta frecuencia para decidir qué mejorar?»  
**EN:** “Do you review the results of your activity regularly to decide what to improve?”  
**Ayuda ES:** «Piensa en decisiones reales tomadas a partir de consultas, personas atendidas, pedidos, reservas u otros datos pertinentes. Tener una herramienta no cuenta como revisión.»  
**Help EN:** “Think of actual decisions based on relevant information such as inquiries, people served, orders, or bookings. Having a tool doesn't count as reviewing results.”

| value | ES | EN |
| --- | --- | --- |
| regular_decisions | Sí, reviso resultados con regularidad y los uso para decidir. | Yes, I review results regularly and use them to make decisions. |
| occasional_review | A veces los reviso, pero no siempre influyen en las decisiones. | I sometimes review them, but they don't always inform decisions. |
| no_review | No suelo revisar resultados para decidir cambios. | I don't usually review results to decide on changes. |
| unknown | No tengo información suficiente para responder. | I don't have enough information to answer. |

**Elegibilidad actual:** operating AND history. **Evidencia:** measurement_optimization directness=direct v1. **KEEP:** cuatro values; se evalúa uso efectivo para decidir, sin requerir software ni KPI comercial. **Gate:** si el caso carece de actividad suficiente, evitar la pregunta o seleccionar fallback de práctica con insuficiencia explícita; no convertir unknown en debilidad. **Riesgo:** no presentar junto con measurement_practice como dos pruebas separadas de la misma revisión de resultados.

### Ficha 36 — q2_measurement_practice · REWRITE v2 objetivo · single

**ES:** «En los últimos meses de actividad, ¿cómo has registrado y utilizado resultados para decidir mejoras?»  
**EN:** “During your recent period of activity, how have you recorded and used results to decide on improvements?”  
**Ayuda ES:** «Cuenta datos pertinentes para tu actividad: ventas, consultas, personas atendidas, participación, entregas o aportes. No necesitas programas ni estadísticas formales.»  
**Help EN:** “Consider results relevant to your activity: sales, inquiries, people served, participation, deliveries, or contributions. Formal software or statistics aren't required.”

| value | ES | EN |
| --- | --- | --- |
| consistent | Registramos resultados y los utilizamos regularmente para tomar decisiones. | We record results and regularly use them to make decisions. |
| partial | Registramos algunos resultados, pero los revisamos poco o no suelen orientar decisiones. | We record some results but rarely review them or use them in decisions. |
| reviews_without_records **NEW** | Revisamos resultados reales, aunque no los dejamos registrados de forma constante. | We review real outcomes, although we don't record them consistently. |
| none | No registramos ni revisamos resultados de forma habitual. | We don't routinely record or review results. |
| not_enough_activity | No ha habido actividad reciente suficiente para evaluar esta práctica. | There hasn't been enough recent activity to assess this practice. |
| unknown | No lo sé o no tengo información suficiente. | I'm not sure or don't have enough information. |

**Elegibilidad actual:** operating sin requisito hasRealCustomers=yes; salida not_enough_activity(kind=not_applicable) previene falso déficit en negocio nuevo. **Evidencia actual:** measurement_optimization direct v1 (consistent=established, partial=partial, none=weak, not_enough_activity=N/A, unknown=uncertainty). **Cambio:** reviews_without_records no puede leerse established: tiene uso observable pero registro débil; definir un estado parcial/contextual con identidad v2 después de calibración. **Regla de sustitución:** preferir esta pregunta inclusiva para ONG, servicios sociales o casos donde tasa y desenlace comercial no sean relevantes; no sumar sus respuestas y la de review_cycle como evidencia independiente. **Pruebas futuras:** C02, C05, actividad reciente insuficiente, revisión verbal sin registros.

### Ficha 37 — q2_process_systemization · REWRITE v3 objetivo · single

**ES:** «Cuando repites un mismo tipo de tarea, ¿sigues habitualmente un procedimiento que permite hacerla de forma consistente?»  
**EN:** “When you repeat the same kind of task, do you usually follow a process that keeps it consistent?”  
**Ayuda ES:** «Puede ser un procedimiento personal, con notas o compartido. Importa la repetibilidad, no cuántas personas trabajan ni si usas un sistema informático.»  
**Help EN:** “It may be a personal routine, written notes, or a shared process. Consistency matters, not team size or whether you use software.”

| value | ES | EN |
| --- | --- | --- |
| defined | Sí, la tarea suele seguir pasos claros y repetibles. | Yes, the task usually follows clear, repeatable steps. |
| partial | Algunas tareas siguen pasos claros y otras se improvisan. | Some tasks follow clear steps, while others are improvised. |
| informal | Las tareas recurrentes se resuelven sin una forma consistente. | Recurring tasks are handled without a consistent approach. |
| not_applicable **NEW** | No realizamos actualmente tareas comparables que se repitan. | We don't currently perform comparable recurring tasks. |
| unknown | No puedo determinar cómo sucede habitualmente. | I'm not sure how it's usually done. |

**Elegibilidad actual del reviewed:** q2_has_customers=yes, sin guardia propia de estado operating; **riesgo:** una operación pausada con historia previa puede parecer proceso presente. **Diseño futuro:** pedir solo sobre tareas actuales en operación o con variante histórica explícita (sin scoring actual para pausados); N/A si no existen tareas repetibles. **Evidencia R3I actual:** digital_readiness directness=direct, defined=established/partial=partial/informal=weak/unknown=uncertainty. **Decisión crítica:** proceso manual repetible **no certifica madurez digital**; redefinir como supporting/contextual de capacidad operativa, o exigir una segunda observación inequívocamente digital para puntuar digital_readiness. Cambiar evidenceV3 y versión **solo** en desarrollo autorizado; no reinterpretar v2. **Pruebas futuras:** profesional independiente sin empleados y ONG con tareas manuales.

### Ficha 38 — q2_operations_information_base · REWRITE v3 objetivo · single

**ES:** «Cuando necesitas retomar un trabajo, ¿puedes recuperar fácilmente la información correcta y actualizada?»  
**EN:** “When you need to resume work, can you easily find the correct, up-to-date information?”  
**Ayuda ES:** «La información puede estar en papel, agenda, documentos o aplicaciones. Esta pregunta mide recuperación fiable, no el uso obligatorio de herramientas digitales.»  
**Help EN:** “Information may be on paper, in a diary, documents, or applications. This checks reliable retrieval, not whether you use digital tools.”

| value | ES | EN |
| --- | --- | --- |
| easy_reliable | Sí, normalmente la encuentro completa y actualizada. | Yes, I can usually find complete, current information. |
| somewhat_scattered | La recupero, pero a veces debo consultar varias fuentes. | I can find it, but sometimes need to check several sources. |
| difficult_unreliable | A menudo cuesta encontrarla o saber cuál está vigente. | It's often hard to find or know which version is current. |
| not_applicable | Esta actividad no necesita recuperar información anterior para continuar tareas. | This activity doesn't require retrieving past information to continue tasks. |
| unknown | No lo sé o no lo he comprobado. | I don't know or haven't checked. |

**Elegibilidad actual:** operating AND (q2_goal=organize OR q2_friction=operations), y guardia de proceso actual agregada en qa03b/bank.ts. **Evidencia actual R3F:** digital_readiness directness=direct con easy_reliable/partial/difficult_unreliable/N/A/unknown. **Decisión REWRITE:** mantener cinco values, pero **versionar la evidencia futura** de recuperación manual como supporting/contextual, no directa de madurez digital; valorar separately si existe acceso digital verificable. No usar «digital tools» como condición obligatoria, tampoco puntuar como digital established solo porque un fichero en papel es fácil de recuperar. **Control:** empresa con carpetas ordenadas, organización sin conexión estable, C05. **No duplicar** con estado B2B (que ya es supporting).

### Ficha 39 — q2_operations_handoffs · KEEP v2 · single

**ES:** «Cuando alguien continúa un trabajo iniciado por otra persona, ¿recibe la información que necesita para seguir?»  
**EN:** “When someone continues work started by another person, do they receive the information they need?”  
**Ayuda ES:** «Piensa en entregas reales entre personas, aunque se hagan hablando, con notas, en papel o digitalmente.»  
**Help EN:** “Think of actual handoffs between people, whether spoken, written on paper, noted down, or shared digitally.”

| value | ES | EN |
| --- | --- | --- |
| complete | Sí, recibe información suficiente para continuar. | Yes, they receive enough information to continue. |
| partial | A veces faltan datos y hay que volver a preguntar. | Sometimes details are missing and someone must ask again. |
| incomplete | Con frecuencia faltan datos importantes para continuar. | Important information is often missing. |
| not_applicable | No hay trabajos que se transfieran entre personas. | Work isn't handed from one person to another. |
| unknown | No sé cómo funcionan normalmente esos traspasos. | I don't know how those handoffs usually work. |

**Elegibilidad actual:** operating + objetivo organize o fricción operations + q2_other_staff=yes; un autónomo sin colegas no recibe esta pregunta. **Evidencia:** digital_readiness **supporting** v2; no scoring directo por tamaño de equipo. **KEEP:** los cinco values ya distinguen N/A y unknown. **Control:** C04 individual, C05 voluntariado, cambios de respuesta sobre empleados con replay; no asumir que un traspaso verbal es necesariamente débil.

### Ficha 40 — q2_digital_tools_in_use · KEEP v1 · multi

**ES:** «¿Qué tipos de herramientas digitales utilizas hoy para organizar o dar seguimiento a tu actividad?»  
**EN:** “Which kinds of digital tools do you currently use to organize or follow up on your activity?”  
**Ayuda ES:** «Puedes elegir varias. Tener una herramienta no significa que el proceso funcione. Si ninguna corresponde o no usas herramientas digitales, indícalo sin penalización automática.»  
**Help EN:** “Choose all that apply. Having a tool doesn't prove the process works. If none apply or you don't use digital tools, say so without an automatic penalty.”

| value | ES | EN |
| --- | --- | --- |
| calendar_scheduling | Agenda o calendario para coordinar fechas y citas. | Calendar or scheduling tools for appointments and dates. |
| documents_records | Documentos, hojas o registros digitales. | Digital documents, spreadsheets, or records. |
| tasks_projects | Herramientas para tareas y proyectos. | Task or project management tools. |
| customer_followup | Herramientas para registrar y retomar consultas pendientes. | Tools for logging inquiries and following up. |
| inventory_operations | Herramientas para inventario u operaciones. | Tools for inventory or operations. |
| other | Otro tipo de herramienta digital. | Another type of digital tool. |
| none | No utilizamos herramientas digitales para estas tareas. | We don't use digital tools for these tasks. |
| not_needed | Estas tareas no requieren herramientas digitales en nuestra actividad. | These tasks don't require digital tools in our activity. |
| unknown | No sé qué herramientas digitales utilizamos. | I'm not sure which digital tools we use. |

**Elegibilidad actual:** operating AND (objetivo organize/automate/stop_losing/measure OR fricción operations/follow_up). Multi: **none, not_needed y unknown son exclusivos**; other puede acompañar herramientas declaradas. **Evidencia:** el banco actual no declara evidenceV3 directa para esta pregunta; es **inventario de herramientas**, no puntuación de madurez. **KEEP:** no inferir integración, automatización, cumplimiento, licencias, seguridad o mejora de resultados por una casilla seleccionada. Para not_needed, contrastar aplicabilidad; desconocer beneficio de una herramienta no basta por sí solo para certificar N/A. **Control:** actividad con papel y procesos excelentes, empresa con software pero procesos deficientes y C05.

### Criterios de gate y consistencia del lote

- **Recuento de origen por lectura focal:** ocho preguntas y **41 opciones** (5+4+4+5+4+5+5+9). **Propuesta de diseño**: **44 opciones** (6+4+4+6+5+5+5+9); +3 options proyectadas y 5 nuevos contratos/versions objetivo, sin modificación del banco. No se certifica aquí el recuento de todo el conjunto de 77.
- **Resultado:** Lote 05 = **3 KEEP / 5 REWRITE**. Lotes 01–04 = 9 KEEP/23 REWRITE; **acumulado = 40 fichas con decisión de diseño (12 KEEP/28 REWRITE)**, no 40 rutas ejecutadas ni certificadas.
- **Matriz de evidencia:** evitar contar cuatro métricas de measurement_optimization como cuatro pruebas independientes. Una observación de uso de datos puede ser directa; un listado de herramientas es contextual; proceso manual/recuperación manual no demuestran por sí solos capacidad digital.
- **Presupuesto y abstención:** pregunta de tasa comercial solo si outcome transaccional pertinente; en C05 preferir practice/review de participación, beneficiarios o aportes. Proyectos C02 sin historia, C03 pausados y C08 sin presencia deben conservar resultados «no evaluable» allí donde falte observación.
- **Criterios focales futuros, NO ejecutados:** C02/C03/C05/C07/C09/C10, compatibilidad de score con one-evidence-per-construct, fallback entre tasa/registro/revisión, versionado y edición/replay, cambios de persona a equipo, N/A, multi/exclusivas y 24+5; validar ES/EN y legibilidad en móvil. No activar tests generales ni modificar código mientras PLAN_ONLY.
- **F02 sigue ABIERTA:** decisiones editoriales delegadas no son aprobación cognitiva humana, medición calibrada, scoring final ni despliegue; revisiones por sector, C01–C10 y matriz de 80 celdas siguen pendientes.

### Changelog
- **0.8.0:** lote 05 — ocho fichas bilingües con reglas de medición sin ventas, abstención, evidencia no duplicada y proceso manual; 3 KEEP/5 REWRITE, sin cambios TS/TSX, tests, CI ni producción.

## Lote editorial 06 — citas, ecommerce y especialidades

**Edición documental acumulada 0.9.0 — DISEÑO DELEGADO / PLAN_ONLY.** Esta sección completa ocho fichas reales del candidato V9. Los textos ES/EN, valores futuros, guardias y semánticas son **especificación editorial**, no modificación del banco o producción. Fuente estática: HEAD 0e18bde837d02e7f363b941d51c96574914e4560; qbv2-reviewed-specialized-entry.ts, qbv2-reviewed-local-appointments-professional.ts, qbv2-reviewed-commerce.ts, qbv2-reviewed-evidence.ts, qa03b/specialty-branches-wave1.ts, qa03b/bank.ts y qa03b/editorial-copy.ts. No se ejecutaron pruebas ni sesiones reales.

### Decisiones transversales

- **Citas:** consulta, intento de reservar, reserva confirmada, asistencia y siguiente cita son eventos diferentes. No derivar uno de otro sin observarlo; no convertir ausencia de citas en fracaso digital.

- **Comercio:** canales declarados no prueban atribución ni conversión. Catálogo no publicado es distinto de catálogo legítimamente no aplicable y de desconocimiento. No exigir carrito cuando se vende por conversación o marketplace.

- **Especialistas:** dental reemplaza rebooking genérico; agencia reemplaza claridad genérica solo si corresponde. Sin doble recuento de evidencia ni dos preguntas equivalentes.

- **Bloqueo P0:** la rama actual de agencia exige sector=b2b_services; la separación sector/modelo del Lote 02 necesita migración explícita de la guardia antes de introducir un nuevo selector. No romper la rama de agencia.

- **Versionado y neutralidad:** unknown, insufficient_history, not_published y not_applicable no se convierten automáticamente en weak; ningún value histórico se reinterpreta sin versión y replay. Las nuevas opciones solo son objetivo futuro.

- **Presupuesto:** ocho fichas de catálogo no son ocho turnos obligatorios para cada usuario; conservar 24 + hasta 5 con consentimiento. ES/EN requiere todavía validación cognitiva real.

### Matriz de dictámenes

| Ficha | ID | Fuente → objetivo futuro | Decisión |
| --- | --- | --- | --- |
| 41 | q2_appointments_noshow | v2 → v3 objetivo | **REWRITE** |
| 42 | q2_appointments_lead_to_booking | v2 → v3 objetivo | **REWRITE** |
| 43 | q2_appointments_booking_friction | v2 → v2 | **KEEP** |
| 44 | q2_ecommerce_traffic_sources | v3 → v4 objetivo | **REWRITE** |
| 45 | q2_ecommerce_product_discovery | v2 → v3 objetivo | **REWRITE** |
| 46 | q2_professional_intake_flow | v2 → v3 objetivo | **REWRITE** |
| 47 | q2_dental_care_continuation | v1 → v1 | **KEEP** |
| 48 | q2_marketing_agency_scope_clarity | v1 → v2 objetivo | **REWRITE** |

### Fichas completas del Lote 06

#### Ficha 41 — q2_appointments_noshow · v2 → v3 objetivo · REWRITE

**ES:** «De las citas que ya estaban reservadas, ¿con qué frecuencia la persona no asistió sin cancelarlas a tiempo?»  
**EN:** “Of appointments that were already booked, how often did the person fail to attend without canceling in time?”  
**Ayuda ES:** Considera un periodo reciente representativo. Una consulta sin reserva no cuenta como ausencia. En contextos clínicos puedes decir pacientes sin solicitar datos clínicos.  
**Help EN:** Use a representative recent period. An inquiry that never became a booking is not a no-show. In clinical contexts you may say patients without asking for health information.

| Value | Español propuesto | English draft |
| --- | --- | --- |
| rarely | Casi nunca. | Rarely. |
| sometimes | Algunas veces. | Sometimes. |
| often | Con frecuencia. | Often. |
| no_recent_bookings NEW | No hay suficientes citas reservadas recientes para evaluarlo. | There haven't been enough recent booked appointments to assess this. |
| unknown | No tengo información fiable para responder. | I don't have reliable information to answer. |

**Aplicabilidad/guardia:** Arquetipo appointments, historial de clientes=YES y operating por QA03B. No mostrar a proyectos preparando ni pausados como frecuencia actual.  
**Evidencia y neutralidad:** appointmentAttendance declarada por rarely/sometimes/often, sin evidenceV3 directa en la definición inspeccionada. Nueva opción: insuficiencia de historial/context_only, nunca puntuación weak. Puede condicionar recordatorios cuando sometimes/often; no inferir ausencia como fracaso.  
**Validación focal futura (no ejecutada):** C02, C03, C06; no activar recordatorios con no_recent_bookings ni unknown; conservar variante clinical.

#### Ficha 42 — q2_appointments_lead_to_booking · v2 → v3 objetivo · REWRITE

**ES:** «De las personas que realmente intentaron reservar una cita, ¿cuántas consiguieron confirmarla?»  
**EN:** “Of the people who actually tried to book an appointment, how many managed to confirm one?”  
**Ayuda ES:** Cuenta intentos de reserva reales, incluidos los que no se concretaron. Preguntar por un servicio no siempre es intentar reservarlo, y una cita no equivale a una venta.  
**Help EN:** Consider actual booking attempts, including those that failed. Asking about a service is not always an attempt to book, and a booking isn't necessarily a sale.

| Value | Español propuesto | English draft |
| --- | --- | --- |
| most | La mayoría consigue reservar. | Most manage to book. |
| mixed | Algunas personas reservan y otras no. | Some book and others don't. |
| few | Pocas consiguen reservar. | Few manage to book. |
| no_recent_requests NEW | No hemos tenido suficientes solicitudes recientes para evaluarlo. | We haven't had enough recent booking requests to assess this. |
| unknown | No dispongo de información fiable. | I don't have reliable information. |

**Aplicabilidad/guardia:** activeAppointments y, tras QA03B, operating AND historial real. El estado no_recent_requests excluye el deepening de booking_friction.  
**Evidencia y neutralidad:** Observación contextual de solicitud→reserva, sin evidencia V3 directa migrada en la definición inspeccionada. La opción nueva es insufficient_history/context_only: no equivaler a tasa cero.  
**Validación focal futura (no ejecutada):** C06 clínica nueva, C02 y C03; edición a mixed/few puede abrir booking_friction; never auto-translate inquiry as booked appointment.

#### Ficha 43 — q2_appointments_booking_friction · v2 → v2 · KEEP

**ES:** «Cuando alguien intenta reservar, ¿con qué frecuencia coordinar el horario requiere intentos o demoras innecesarias?»  
**EN:** “When someone tries to book, how often does arranging a time require unnecessary attempts or delays?”  
**Ayuda ES:** Solo cuenta obstáculos repetidos. El intercambio normal para elegir una hora no es un problema.  
**Help EN:** Only count recurring obstacles. A normal exchange to agree on a time isn't a problem.

| Value | Español propuesto | English draft |
| --- | --- | --- |
| rarely | Casi nunca; coordinar suele ser sencillo. | Rarely; arranging a time is usually straightforward. |
| sometimes | A veces requiere intentos o demoras innecesarias. | Sometimes it requires extra attempts or delays. |
| often | Con frecuencia se complica o demora. | It often becomes complicated or delayed. |
| unknown | No tengo datos suficientes. | I don't have enough information. |

**Aplicabilidad/guardia:** Material: activeAppointments AND q2_appointments_lead_to_booking in [mixed,few], sumado a operating AND historial en QA03B.  
**Evidencia y neutralidad:** conversion_access V3 directa: rarely=established, sometimes=partial, often=weak, unknown=uncertainty. La respuesta few no demuestra por sí misma que el obstáculo sea coordinar una hora.  
**Validación focal futura (no ejecutada):** Ruta mixed/few y contraste con most/no_recent_requests; no atribuir causa inventada ni duplicar evidencia del mismo evento.

#### Ficha 44 — q2_ecommerce_traffic_sources · v3 → v4 objetivo · REWRITE

**ES:** «¿Por cuáles canales han llegado habitualmente personas a tu tienda online durante el periodo reciente?»  
**EN:** “Which channels have regularly brought people to your online store during the recent period?”  
**Ayuda ES:** Selecciona solo fuentes que puedas identificar razonablemente. Haber pagado anuncios no demuestra que hayan generado visitas. Puedes marcar varias fuentes.  
**Help EN:** Select only sources you can reasonably identify. Running ads doesn't prove they generated visits. You may select several channels.

| Value | Español propuesto | English draft |
| --- | --- | --- |
| social | Redes sociales. | Social media. |
| search | Buscadores, como Google. | Search engines, such as Google. |
| ads | Anuncios pagados. | Paid advertising. |
| referral | Recomendaciones o referencias. | Referrals or recommendations. |
| marketplace | Marketplaces o plataformas de venta. | Marketplaces or selling platforms. |
| messaging | WhatsApp u otros mensajes. | WhatsApp or other messaging. |
| email | Correo electrónico o boletines. | Email or newsletters. |
| direct | Visitas directas de personas que ya conocen la tienda. | Direct visits from people who already know the store. |
| other | Otro canal identificado. | Another identified channel. |
| no_recent_visitors NEW | No hemos observado visitas recientes suficientes para identificar canales. | We haven't observed enough recent visits to identify channels. |
| unknown | No sabemos por dónde llegan. | We don't know which channels they use. |

**Aplicabilidad/guardia:** Ecommerce AND has_customers=yes; QA03B añade operating AND historial. Multi; fuentes identificadas combinables, unknown y no_recent_visitors exclusivos en contrato futuro.  
**Evidencia y neutralidad:** evidenceMigration=pending; no evidenceV3 directa. Un canal declarado no demuestra atribución, alcance, venta, consentimiento ni rendimiento publicitario. No inferir marketing activo.  
**Validación focal futura (no ejecutada):** C07 y C09, exclusividad de respuestas neutrales, desconocimiento del tráfico sin falsos valores, canal de mensajería no implica permiso de campañas.

#### Ficha 45 — q2_ecommerce_product_discovery · v2 → v3 objetivo · REWRITE

**ES:** «Si alguien entra por primera vez en tu tienda online, ¿puede encontrar fácilmente el producto que necesita?»  
**EN:** “When someone visits your online store for the first time, can they easily find the product they need?”  
**Ayuda ES:** Se evalúa la búsqueda en un catálogo visible, no todo el inventario. Si vendes por conversación y no necesitas catálogo navegable, distingue ese modelo de una tienda que aún no lo ha publicado.  
**Help EN:** This assesses finding products in a visible catalog, not listing every item. If you sell through conversation without needing a browsable catalog, distinguish that from one you intend to publish but haven't.

| Value | Español propuesto | English draft |
| --- | --- | --- |
| easy | Sí, puede encontrarlo fácilmente. | Yes, they can find it easily. |
| confusing | A veces es confuso encontrarlo. | Finding it is sometimes confusing. |
| difficult | Normalmente cuesta encontrarlo. | It is usually difficult to find. |
| not_published NEW | Necesitamos un catálogo navegable, pero aún no lo hemos publicado. | A browsable catalog is relevant, but we haven't published it yet. |
| not_applicable | No usamos catálogo navegable porque nuestro modelo de venta funciona de otra forma. | We don't use a browsable catalog because our selling model works differently. |
| unknown | No lo hemos probado desde fuera. | We haven't tested it from a visitor's perspective. |

**Aplicabilidad/guardia:** active + arquetipo ecommerce, sin exigir ventas anteriores. La ruta de venta por chat sin catálogo puede usar N/A legítimo, y aún permitir preguntas separadas sobre claridad de oferta o contacto.  
**Evidencia y neutralidad:** digital_foundation V3 directa actual: easy=established, confusing=partial, difficult=weak, not_applicable=N/A, unknown=uncertainty. not_published NEW requiere versión y rúbrica de publicación pertinente; no reinterpretar N/A histórico.  
**Validación focal futura (no ejecutada):** C07 marketplace/chat vs catálogo pendiente, C08 restaurante sin web, y no convertir not_published en debilidad de claridad general sin evidencia.

#### Ficha 46 — q2_professional_intake_flow · v2 → v3 objetivo · REWRITE

**ES:** «Cuando alguien quiere solicitar tu servicio profesional, ¿puede entender qué debe hacer a continuación?»  
**EN:** “When someone wants to request your professional service, can they understand what to do next?”  
**Ayuda ES:** Puede consistir en llamar, escribir, reservar o pedir una valoración. Se mide la claridad del paso siguiente, no la venta, la web propia ni datos confidenciales.  
**Help EN:** The next step may be to call, message, book, or request an assessment. This measures clarity, not sales, owning a website, or confidential data.

| Value | Español propuesto | English draft |
| --- | --- | --- |
| clear | El siguiente paso se explica claramente. | The next step is clearly explained. |
| partial | En general se entiende, pero hay dudas. | It is generally understandable, but some details are unclear. |
| unclear | La información existente no permite saber qué hacer después. | The existing information doesn't explain the next step. |
| not_published NEW | Todavía no hemos comunicado públicamente cómo solicitar el servicio. | We haven't publicly communicated how to request the service yet. |
| not_applicable NEW | Solo se accede mediante derivación o un circuito específico, no por solicitudes públicas directas. | Access is through referral or another defined process, not direct public inquiries. |
| unknown | No he comprobado qué entiende una persona nueva. | I haven't checked what a new person would understand. |

**Aplicabilidad/guardia:** activeProfessional: actividad active + sector legal/financial_tax_insurance/professional_services/real_estate.  
**Evidencia y neutralidad:** clarity_positioning V3 directa actual con cuatro values. not_published es publicación ausente, no contenido publicado confuso; not_applicable requiere ruta de acceso alternativa real; unknown es incertidumbre.  
**Validación focal futura (no ejecutada):** C04 profesional individual y C05 atención solo por derivación; no pedir datos de pacientes, expedientes o clientes.

#### Ficha 47 — q2_dental_care_continuation · v1 → v1 · KEEP

**ES:** «Cuando un paciente necesita continuar un tratamiento o acudir a un control, ¿cómo suele quedar organizada su siguiente cita?»  
**EN:** “When a patient needs to continue treatment or attend a follow-up check, how is the next appointment usually arranged?”  
**Ayuda ES:** Piensa solo en tratamientos o controles donde volver es necesario. No incluyas información clínica individual.  
**Help EN:** Consider only treatments or checkups that genuinely require another visit. Don't include individual medical details.

| Value | Español propuesto | English draft |
| --- | --- | --- |
| proactive | Normalmente acordamos la siguiente cita con anticipación. | We usually arrange the next appointment in advance. |
| partial | A veces la acordamos de antemano y otras después. | Sometimes we arrange it in advance and other times later. |
| reactive | El paciente suele tener que volver a contactar para continuar. | The patient usually has to contact us again to continue. |
| not_applicable | La mayoría de las atenciones no requiere otra cita. | Most visits don't require another appointment. |
| unknown | No tengo información suficiente. | I don't have enough information. |

**Aplicabilidad/guardia:** operating + historial=yes + q2_niche_health_wellness=dentist + archetype appointments + (goal stop_losing OR friction follow_up). Es sustituto de q2_appointments_rebooking del Lote 04.  
**Evidencia y neutralidad:** relationship_recurrence V3 directa de la rama especializada; no duplicar con rebooking genérico. No se recogen datos clínicos individuales.  
**Validación focal futura (no ejecutada):** C06 dentista con controles y visitas de una sola vez; cambio de nicho/goal replanifica y recupera fallback genérico.

#### Ficha 48 — q2_marketing_agency_scope_clarity · v1 → v2 objetivo · REWRITE

**ES:** «Si una empresa considera contratar tu agencia, ¿puede entender qué incluye el servicio, cuáles son los entregables y qué queda fuera?»  
**EN:** “If a company considers hiring your agency, can it understand what's included, the deliverables, and what's outside the scope?”  
**Ayuda ES:** Evalúa alcance, no promesas de resultados. Un servicio a medida puede explicar cómo se define el alcance sin publicar información confidencial.  
**Help EN:** Assess scope, not promises of results. Custom services can explain how scope is defined without publishing confidential details.

| Value | Español propuesto | English draft |
| --- | --- | --- |
| clear | El alcance y los entregables están explicados claramente. | The scope and deliverables are clearly explained. |
| partial | Se entiende lo esencial, pero hay límites o entregables ambiguos. | The essentials are clear, but some limits or deliverables are ambiguous. |
| unclear | Hay información publicada, pero no explica el alcance del servicio. | Information is published, but it doesn't explain the service scope. |
| not_published NEW | Todavía no publicamos una explicación del alcance. | We haven't published an explanation of scope yet. |
| not_applicable | No hay un alcance estándar publicable; el servicio se define individualmente mediante un proceso explicado. | There is no standardized scope to publish; each engagement is defined individually through an explained process. |
| unknown | No sabemos qué entiende una empresa nueva. | We don't know what a prospective client would understand. |

**Aplicabilidad/guardia:** operating+historial=yes, q2_sector=b2b_services, q2_niche_b2b_services=marketing_agency, goal explain, buyer b2b/mixed y presencia base reliable/partial. P0: Lote 02 pretende mover b2b_services fuera de sector; hay que migrar guardia y nicho juntos.  
**Evidencia y neutralidad:** clarity_positioning V3 directa actual; not_applicable v1 dice 'todavía no presento', semántica ambigua. Futuro not_published separado de N/A y contenido publicado poco claro; versión/replay y sustitución de q2_presence_offer_clarity.  
**Validación focal futura (no ejecutada):** C04/C09 agencias a medida y multiactividad, sector reclasificado, not_published vs N/A, fallback genérica y ninguna duplicación.

### Gate, inventario y cierre

- Fuente inspeccionada: **8 preguntas/41 opciones** (4+4+4+10+5+4+5+5); diseño objetivo **8 preguntas/48 opciones** (5+5+4+11+6+6+5+6), siete options nuevas y seis futuras versiones. Validar contra el banco compuesto ejecutado antes de implementación: lectura estática no equivale a certificación de inventario global.

- **Dictamen:** 2 KEEP / 6 REWRITE; con Lotes 01–05 acumulados **48 fichas con decisión (14 KEEP / 34 REWRITE)**. No significa 48 preguntas activadas ni 48/77 técnicamente certificadas.

- **C01–C10:** probar luego (solo con autorización para código) C02/C03 inactividad, C04 profesional, C05 entidad sin venta, C06 citas y odontología, C07 catálogo/canales, C08 sin web, C09 multiactividad/agencia y C10 reclasificación. Guardias, ediciones/replay, exclusividad, sustitución, evidenceV3, N/A y 24+5 deben cumplir pruebas focalizadas sin efectos sobre V8.

- **F02 abierto:** falta revisión del resto del banco, certificación lingüística y de comprensión, los 80 casos dimensión×escenario, calibración y handoff F00–F10. Se mantiene PLAN_ONLY: no TS/TSX, SQL, tests, CI, D1, UI, Worker, rutas, merge ni producción.

### Changelog

- **0.9.0:** dictamen editorial delegado Lote 06, ocho fichas ES/EN, seis rediseños y separación de no publicación, no aplicabilidad e insuficiencia de actividad. Solo documentación.
