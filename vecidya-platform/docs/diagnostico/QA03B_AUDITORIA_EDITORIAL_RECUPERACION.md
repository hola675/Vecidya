# QA-03B — Auditoría editorial de las 21 preguntas recuperadas (dos lotes)

**Estado:** propuesta experimental revisada en código; no se ha desplegado ni conectado al motor público.

**Alcance de la revisión:** coherencia de enunciado, ayuda, significado y exhaustividad de opciones, término usado por perfil, elegibilidad, evidencia y riesgo de inferencia. El objetivo es medir el comportamiento relevante, **no preguntar más** ni puntuar señales indirectas de forma automática. Las 45 preguntas públicas permanecen inalteradas por esta recuperación.

## Matriz editorial, lote 1 (6 definiciones)

| ID | Enunciado original QBV2 | Enunciado revisado QA-03B candidato | Evaluación de opciones y decisión |
|---|---|---|---|
| `q2_startup_problem_clarity` | ¿Puedes decir qué problema concreto resuelve y para quién? | ¿Puedes explicar qué necesidad concreta resolvería tu proyecto y a qué personas ayudaría? | Las 5 opciones distinguen claridad del problema y del público; se conservan los valores. Evidencia directa de claridad, nunca prueba de negocio en marcha. |
| `q2_startup_validation_evidence` | ¿Qué has comprobado sobre el problema con las personas a las que quieres ayudar? | ¿Qué has comprobado con personas reales acerca del problema que quieres resolver? | Conversaciones ≠ pruebas ≠ problema que se repite; las 5 opciones mantienen esa jerarquía. Evidencia de apoyo, no se afirma venta. |
| `q2_startup_offer_readiness` | ¿Qué tan concreta es la oferta que podrías poner a prueba ahora? | ¿Qué tan definida está la oferta que podrías presentar y poner a prueba ahora? | Cinco opciones distinguen oferta clara, casi lista, en definición, ausente y desconocida. No se exige web ni empresa constituida. |
| `q2_ecommerce_checkout_friction` | ¿Qué tan seguido las personas empiezan a comprar pero no terminan el proceso de pago? | En tu tienda online, ¿con qué frecuencia las personas empiezan una compra, pero no terminan de pagar? | Se conservan rara vez/a veces/a menudo/desconocido. Ayuda separa abandono de pago de visita sin compra iniciada. |
| `q2_nonprofit_support_type` | ¿Cómo se sostiene principalmente tu organización? | ¿De qué manera se financia o recibe apoyo principalmente tu organización? | Donaciones, cuotas, subvenciones, mezcla o incertidumbre. **Solo contexto**: el tipo de financiación no equivale a calidad digital. |
| `q2_nonprofit_donation_clarity` | ¿Alguien que quiera apoyar económicamente a tu organización puede hacerlo fácilmente? | Si alguien quiere donar a tu organización, ¿encuentra fácilmente cómo hacerlo? | Las 4 opciones permiten observar claridad del acceso a donaciones. Solo aplica cuando hay donaciones reales, no a toda organización. |

Se añadieron ayudas explícitas a las seis formulaciones en `qa03b/specialty-candidate-bank.ts`. Las opciones del banco histórico conservan sus identificadores, significado y versiones semánticas en el primer lote.

## Matriz editorial, lote 2 (15 definiciones)

| ID | Problema detectado y enfoque revisado | Enunciado final propuesto | Opciones, versión y evidencia |
|---|---|---|---|
| `q2_startup_demand_signal` | «Acción concreta de demanda» era jerga y agrupaba interés con un primer cliente. | Al mostrar tu idea u oferta, ¿qué respuesta concreta has recibido hasta ahora? | Conserva ninguna/interés/solicitud/prueba pagada/compromiso/desconocido. **Pendiente de evidencia**: no transformar interés en venta. |
| `q2_ecommerce_cart_visibility` | «Te permite saber cuándo...» confundía visibilidad del abandono con identificar a la persona. | ¿Puedes saber si alguien añadió productos al carrito de tu tienda online y no completó la compra? | Sí/no/desconocido. Solo evidencia **de apoyo** a medición, no certifica atribución ni permiso de contacto. |
| `q2_ecommerce_cart_followup` | Presuponía que la persona que abandona el carrito es identificable y puede contactarse. | Cuando alguien abandona una compra y tienes permiso para contactarlo, ¿sueles enviarle un recordatorio? | **v2**: conserva siempre/a veces/casi nunca y añade «no puedo contactar con permiso» (N/A) + desconocido; no puntuar N/A negativamente. |
| `q2_ecommerce_repeat_purchase` | No distinguía repetición de compras de cantidad de ventas totales. | ¿Con qué frecuencia vuelve a comprar un cliente que ya compró antes en tu tienda online? | Conserva compras habituales/ocasionales/raras/N/A/desconocido. **Contexto pendiente**: no penalizar negocios de compra única. |
| `q2_hospitality_flow_type` | «¿Cómo llegan los clientes?» era abierto y no nombraba reservas/pedidos. | ¿Cómo llegan o solicitan atención habitualmente las personas en tu restaurante o negocio de hospedaje? | **v2**: reserva/visita espontánea/pedido/mezcla + desconocido. Solo contexto, no medir éxito digital. |
| `q2_hospitality_reservation_noshow` | No diferenciaba una reserva real de una consulta o cita profesional. | Cuando alguien reserva una mesa o alojamiento, ¿con qué frecuencia no se presenta? | **v2**: casi nunca/a veces/frecuentemente + desconocido; solo si se declaran reservas. Contextual. |
| `q2_hospitality_peak_capacity` | Mezclaba tiempos de espera con posible fallo tecnológico. | En los momentos de mayor demanda, ¿con qué frecuencia rechazas clientes o los haces esperar mucho por falta de capacidad? | Rara vez/a veces/a menudo/desconocido. **No puntuar** como falla digital la falta de espacio o personal. |
| `q2_b2b_qualification` | «Oportunidad real o solo curiosidad» resulta subjetivo sin criterios reconocibles. | Cuando una empresa pide información, ¿tienes criterios para saber si podría comprar o contratar lo que ofreces? | Sí claro/parcial/no/desconocido. Ayuda ejemplifica necesidad, presupuesto y plazos; B2B declarado, evidencia de preparación operativa. |
| `q2_creator_channel_concentration` | «Audiencia total» podía incluir perfiles sin seguidores reales. | ¿Hasta qué punto se concentra tu audiencia activa en una sola red social o plataforma? | Concentrada/en dos canales/diversificada/desconocida. **Solo contexto:** tener muchos canales no prueba buen descubrimiento. |
| `q2_nonprofit_membership_lifecycle` | Inscripción y renovación parecían un único paso, aunque pueden funcionar de forma diferente. | Si tu organización tiene miembros, ¿está claro cómo pueden incorporarse o renovar su membresía? | Sí/parcial/no/desconocido; ayuda indica que ambas fases deben ser claras para responder sí. Solo si hay cuotas/membresía real. |
| `q2_local_repeat_customers` | «¿Regresan?» obligaba a elegir «casi nunca» incluso cuando una recompra no aplica. | Entre las personas que ya compraron o visitaron tu negocio, ¿con qué frecuencia vuelven? | **v2**: opciones históricas + N/A por compra/visita única. Repetición es contexto, no puntuación automática. |
| `q2_service_area_clarity` | Debía referirse a desplazamientos rentables/viables, no al lugar donde vive el público. | ¿Tienes definida la zona hasta la que te conviene desplazarte para prestar tus servicios? | Conserva zona definida/flexible/sin límite/desconocido. **Contexto**: no asumir que atender áreas lejanas es fallo digital. |
| `q2_operations_process_ownership` | Debía preguntar por asignación habitual de responsabilidades, sin presuponer plantilla numerosa. | Cuando hay una tarea habitual importante, ¿está claro quién debe encargarse sin decidirlo otra vez? | Sí/parcial/improvisado/desconocido; evidencia directa de claridad operativa, aplicable también a una sola persona. |
| `q2_followup_status_visibility` | «Repasar de forma activa tus pendientes» no distinguía rutina frente a recuerdo casual. | ¿Con qué frecuencia revisas tus asuntos pendientes para comprobar si alguno necesita respuesta o seguimiento? | Habitual/solo al recordar/rara vez/desconocido. Diferenciar la **revisión** de ejecutar el seguimiento; evidencia directa de continuidad. |
| `q2_measurement_source_confidence` | «Con seguridad» sin explicación podía provocar respuestas intuitivas, no basadas en datos. | Cuando llega un nuevo cliente, ¿sabes por qué medio conoció tu negocio o trabajo? | Sí/a veces/casi nunca/desconocido; ayuda exige datos o preguntas reales. Mantiene variantes para clínica y organización. |

Todos estos enunciados tienen una ayuda en el código y se someten al validador de máximo 140 caracteres por ayuda. **Cuatro** preguntas cambian formalmente a v2 por ampliar el conjunto de opciones; los demás cambios son editoriales o de elegibilidad, sin alterar su contrato de respuesta.

## Regla de publicación y evidencia

- 21 recuperadas, de las cuales **12** tienen mapeos R3 explícitos (5 en lote 1 y 7 en lote 2), y **9** permanecen pendientes/contextuales (1 en lote 1 y 8 en lote 2).
- «Pendiente» significa **no activar para puntuar**. Si el planner no demuestra que una pregunta aporta contexto para una rama pertinente, no debe gastar tiempo del usuario.
- Si un enunciado cambia lo que una opción significa o se añade una alternativa neutral, revisar versión semántica, compatibilidad de sesiones, Worker/replay y reportes antes del cutover.
- El motor no debe inferir múltiples proveedores por seleccionar «dentista» ni asumir compra recurrente, reservas o consentimiento comercial por el solo nicho.
- Antes de publicar: contraste con usuarios de perfiles diferentes, validación editorial una por una y pruebas diferenciales por sector, estado y evidencia. Este documento es un registro revisado **para pruebas**, no aceptación definitiva de contenido público.
