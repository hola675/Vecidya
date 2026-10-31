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
