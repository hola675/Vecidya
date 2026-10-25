# QA-03B — Plan ejecutable de especialización y recuperación QBV2

Estado: **candidato aislado**; no desplegar, fusionar ni cambiar la identidad de sesiones hasta certificar y aprobar el corte. PR dependiente del catálogo editorial de QA-03B.

## 1. Recuento verificable y alcance

- Banco histórico: 87 definiciones originales, de las que 2 confirmaciones son fixture-only. Banco productivo antiguo: **85**.
- QA-03B: **45** preguntas únicas; 38 importadas del banco reviewed-evidence y 7 definidas en el contrato QA-03B. De las 38 importadas, 37 comparten ID con QBV2 y una es nueva (`q2_discovery_reliable_reach`).
- Preguntas QBV2 productivas sin ese ID en QA-03B: **48** (no 21).
- QA-03B existente: 25 mapeos de evidencia R3 y 20 preguntas pendientes o solo contextuales.
- Catálogo de nichos: 31 especialidades de `taxonomy.ts`. Actualmente `q2_sector` declara una familia; no hay pregunta activa que produzca un `declaredNicheId`.

El objetivo no es elevar la duración de la entrevista. Conservar `ROUTE_HARD_CAP=24`, base <=18, `targetMax=16`, reservas y límites por módulo. Se añade una pregunta solo cuando resuelve contexto indispensable o evidencia aplicable aún insuficiente.

## 2. Cómo se decide una pregunta

1. Sesión pública > respuestas > `resolveEligibleQuestionsV2`: convergencia decreciente y eliminación de respuestas obsoletas.
2. `deriveContractSignals` / `resolveContractContext`: entidad, actividad, crecimiento, modelo, comprador, familia, componentes operativos, objetivos y fricciones.
3. `buildCandidateQuestionPlanV3`: analiza condiciones `appliesWhen`/`materialAppliesWhen`, campos sin resolver, ramas que puede abrir cada opción, dimensiones aplicables con evidencia directa ausente y evidencia de apoyo a dimensiones ya observadas.
4. Orden determinista: confirmación > contexto > desbloqueo > metas/fricciones > evidencia transversal > especializada > prospectiva > refinamiento; presupuesto por módulo.
5. `qa03b/qbv2-candidate-session.ts`: tras cada respuesta replanifica; al editar una respuesta previa elimina las posteriores que queden inelegibles.
6. `qbv2-candidate-scoring.ts`: solo evidencia `migrated` con contrato R3 válido modifica puntuación. La reconstrucción del Worker utiliza el mismo banco e identidad.

Una pregunta `pending` no se vuelve automáticamente valiosa para el planificador. Los simples `archetypeIncludes("b2b")`, `"creator"` o `"professional"` heredados pueden quedar fuera del contexto QA-03B, que deriva `archetypeComponents` principalmente de entrega; revisar compradores/sector/modelo para cada ruta.

## 3. Experimento de clasificación por nicho (PR actual)

El banco candidato exporta **7** preguntas condicionales `q2_niche_<grupo>` de `qa03b/specialty-candidate-bank.ts`:
- health_wellness — dentista, medicina general, psiquiatría, medspa
- beauty_personal_care — peluquería, barbería, estética de mascotas móvil
- financial_tax_insurance — preparación de impuestos, seguros
- home_services — climatización, plomería, reparación móvil
- automotive — taller mecánico, detallado móvil
- food_hospitality — restaurante, cafetería, food truck
- technology_software — startup de software, mercado de dos lados

Cada selector aparece solo con `q2_sector=<grupo>`, usa exclusivamente valores existentes de `NICHE_REGISTRY`, produce `kind: "niche"` solo para una elección explícita, y ofrece «Otra especialidad» y «Todavía no lo sé» sin inventar el nicho ni fabricar datos. No se exige especialización en los grupos con un solo ejemplo; tampoco se inventan nombres no registrados.

Deuda de cobertura deliberada: `q2_sector` no contempla como opciones específicas `ecommerce`, `creator`, `b2b_services` ni `nonprofit_community`, aunque existen en `NICHE_GROUP_REGISTRY`. Corregir ese desfase requiere revisar sus opciones, versión semántica, copias, pruebas y política de sesiones; **no alterar silenciosamente q2_sector/v3**.

## 4. Primera migración de evidencia candidata — implementada sin activar

| ID histórico | Ruta candidata | Papel epistemológico |
|---|---|---|
| `q2_startup_problem_clarity` | estado en preparación | Claridad de problema + destinatario, evidencia directa de clarity_positioning |
| `q2_startup_validation_evidence` | estado en preparación | Validación del problema, evidencia de apoyo de clarity_positioning |
| `q2_startup_offer_readiness` | estado en preparación | Concreción de oferta, evidencia directa de clarity_positioning |
| `q2_ecommerce_checkout_friction` | ecommerce activo con clientes | Dificultades reales del pago, evidencia directa de conversion_access |
| `q2_nonprofit_support_type` | organización o ingreso por aportes | Solo contexto/routing, nunca puntuación automática |
| `q2_nonprofit_donation_clarity` | operación y financiación por donaciones o mezcla | Facilidad observable para aportar, evidencia directa de conversion_access |

Estos seis ID preservan las opciones originales del banco viejo; las puertas `appliesWhen` se adaptan explícitamente al contrato de QA-03B. La elegibilidad no implica selección: solo la evidencia y el contexto útiles justifican ocupar espacio de sesión.

## 5. Backlog completo de las 48 ausentes

### P1 — 21 candidatas con hueco identificable

Primer lote implementado (6): `q2_startup_problem_clarity`, `q2_startup_validation_evidence`, `q2_startup_offer_readiness`, `q2_ecommerce_checkout_friction`, `q2_nonprofit_support_type`, `q2_nonprofit_donation_clarity`.

Segundo lote pendiente de análisis de evidencias y opcionalidad (15):
- `q2_startup_demand_signal` — declaraciones de interés, pruebas, compromisos; no equiparar interés con venta
- `q2_ecommerce_cart_visibility` — capacidad limitada de observar abandono; no equivale por sí sola a medición madura
- `q2_ecommerce_cart_followup` — revisar permiso y si realmente se puede identificar/contactar
- `q2_ecommerce_repeat_purchase` — frecuencia de repetición; respetar compra normalmente única
- `q2_hospitality_flow_type` — contexto de reserva/paso espontáneo/pedido
- `q2_hospitality_reservation_noshow` — contexto de reservas; no mezclar automáticamente con citas clínicas
- `q2_hospitality_peak_capacity` — restricción de capacidad; no atribuirla automáticamente a inmadurez digital
- `q2_nonprofit_membership_lifecycle` — altas y renovaciones solo en programas de membresía
- `q2_b2b_qualification` — cualificación de interés B2B con compradores identificados
- `q2_creator_channel_concentration` — dependencia de plataforma, no prueba de visibilidad
- `q2_local_repeat_customers` — repetición solo si tiene sentido para la oferta
- `q2_service_area_clarity` — contexto para desplazamiento, no score automático
- `q2_operations_process_ownership` — claridad de responsables cuando hay varias personas
- `q2_followup_status_visibility` — seguimiento activo de asuntos pendientes
- `q2_measurement_source_confidence` — atribución conocida/fiable del origen

### P2 — 19 condicionales; verificar redundancia/routing

`q2_local_discovery`, `q2_service_quote_practice`, `q2_appointments_booking_method`, `q2_professional_referral_dependency`, `q2_professional_followup_after_consult`, `q2_ecommerce_acquisition_dependency`, `q2_hospitality_delivery_takeaway`, `q2_b2b_lead_source`, `q2_b2b_sales_cycle`, `q2_b2b_decision_makers`, `q2_creator_conversion`, `q2_nonprofit_participation`, `q2_operations_bottleneck`, `q2_operations_manual_impact`, `q2_operations_dependency`, `q2_followup_ownership`, `q2_startup_first_channel`, `q2_startup_next_milestone`, `q2_operations_automation_adoption`.

### P3 — 8 no prioritarias en su estado histórico

`q2_local_foot_traffic`, `q2_service_repeat_referral`, `q2_retail_promotions`, `q2_creator_content_consistency`, `q2_creator_monetization_model`, `q2_measurement_outcome_tracking`, `q2_measurement_decision_review`, `q2_conversion_interest_to_action`. Motivos: señal digital débil, mezcla de conceptos o duplicidad con QA-03B.

## 6. Política de migración y aceptación

Para cada candidato exigir **ID y opciones conservadas si la semántica es igual**, justificación de cambios de versión si se altera, guardias de estado/historia/sector/comprador, respuesta neutral para incertidumbre, mapeo por opción de R3 (direct, supporting o context_only), aplicabilidad R4, comparación contra baseline, caso de usuario y test de edición/retroceso.

Antes del cutover:
- 20 perfiles existentes y nuevas matrices por nicho, ideas, organizaciones, comercio híbrido, pausados y sin historial.
- Inventario y trazas de por qué se pregunta/se omite; evitar «no useful» cuando una dimensión importante sigue abierta sin observación segura.
- Certificar igualdad de puntuación para las 45 preguntas anteriores ante las mismas respuestas si no se incorporó evidencia nueva.
- Certificar que añadir opciones de nicho no inventa un arquetipo. Distinguir equipo remunerado de varios proveedores de citas.
- Cerrar identidad `QUESTION_BANK_ID`, `PLANNER_ID`, `SESSION_SCHEMA`, migración de sesiones, validación estricta de respuestas y replay del Worker.
- No activar automáticamente la futura versión en producción desde el banco candidato; un cutover requiere PR independiente y pruebas reales completas.
