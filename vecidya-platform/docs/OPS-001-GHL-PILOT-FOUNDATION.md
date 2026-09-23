# OPS-001 — GHL Pilot Foundation

**Estado:** PASS DOCUMENTAL / validación de cuenta pendiente
**Fecha:** 2026-09-23
**Versión Vecidya:** `0.3.0` (sin impacto de versión)
**Siguiente bloque:** OPS-002 — GHL Pilot Implementation

## Alcance y evidencia

OPS-001 define la operación futura de HighLevel como infraestructura externa,
sin implementar integración. No se añadieron tablas, migraciones, OAuth, API
calls, webhooks, secretos, CRM propio, checkout, billing automático, páginas,
precios públicos, cambios de producción ni WhatsApp/IA activos.

La documentación oficial consultada el 2026-09-23 fue:

- [HighLevel Pricing](https://www.gohighlevel.com/pricing): planes,
  subcuentas, funciones core, add-ons y rebilling.
- [HighLevel Pricing Guide](https://help.gohighlevel.com/support/solutions/articles/155000001156-highlevel-pricing-guide):
  wallets, telefonía, email, WhatsApp, workflows y reglas de rebilling.
- [AI Product Pricing](https://help.gohighlevel.com/support/solutions/articles/155000006652-ai-product):
  AI Employee, Conversation AI, Voice AI, Agent Studio y límites.
- [LC Phone Pricing & Billing Guide](https://help.gohighlevel.com/support/solutions/articles/48001223556-lc-phone-pricing-billing-guide):
  números, SMS/MMS, llamadas, carrier fees y compliance.

Estas fuentes son evidencia `DOC` externa. No hay acceso autenticado a una
cuenta HighLevel de Vecidya en este corte; por tanto, el plan contratado,
billing cycle, límites efectivos, Labs, productos habilitados y capacidades
bloqueadas quedan **NOT VERIFIED**. La cuenta real será la fuente de verdad
antes de vender, configurar o publicar cualquier oferta.

## 1. Plan HighLevel actual

| Dato | Estado OPS-001 |
| --- | --- |
| Cuenta real Vecidya | No proporcionada / no inspeccionada |
| Plan contratado | **NOT VERIFIED** |
| Billing cycle | **NOT VERIFIED** |
| Subcuentas permitidas | **NOT VERIFIED** |
| Límites, Labs y productos habilitados | **NOT VERIFIED** |
| Integración con Vecidya | No implementada (`CODE`/`STATUS`) |

Referencia pública vigente, no sustituto de la cuenta:

| Plan | Precio publicado | Subcuentas | Diferencia relevante |
| --- | ---: | ---: | --- |
| Starter | USD 97/mes o USD 970/año | 3 | Core features; sin rebilling de uso |
| Unlimited | USD 297/mes o USD 2.970/año | Ilimitadas | API básica; rebilling Phone/Email sin markup |
| Agency Pro | USD 497/mes o USD 4.970/año | Ilimitadas | SaaS Mode, alta automática, API avanzada y rebilling con markup |

No se debe presentar ninguna fila anterior como contratación de Vecidya.

## 2. Inventario de capacidades

La columna «Disponible en cuenta» no se infiere de la página de precios. Se
mantiene `NOT VERIFIED` hasta tener acceso a Agency View y a una subcuenta.

| Capacidad GHL | Disponible en cuenta | Coste/documentación | Limitación o dependencia | Uso Vecidya |
| --- | --- | --- | --- | --- |
| CRM, contactos, oportunidades, pipelines | NOT VERIFIED | Core según plan | Plan y configuración | System of record comercial |
| Conversaciones | NOT VERIFIED | Core; uso de canales aparte | Proveedor/canal | Conversación comercial |
| Forms, surveys, quizzes | NOT VERIFIED | Core según plan | Límites de cuenta por verificar | Captación estándar |
| Calendarios/booking | NOT VERIFIED | Core según plan | Calendarios y disponibilidad por configurar | Agenda |
| Funnels, websites, landings | NOT VERIFIED | Core según plan | Dominio, contenido y configuración | Landing estándar |
| Workflows, triggers, automations | NOT VERIFIED | Core; premium actions pueden costar por ejecución | Acciones disponibles y volumen | Seguimiento y automatización |
| Social Media Management/Planner | NOT VERIFIED | Core publicado; canales por verificar | Conexiones externas | Publicación social |
| Reviews/Reputation | NOT VERIFIED | Core; Reviews AI separado según plan | Fuentes y permisos | Solicitud/gestión de reseñas |
| Email/LC Email | NOT VERIFIED | Uso documentado: USD 0,675/1.000 emails | Entrega y wallet | Email operativo |
| SMS/MMS | NOT VERIFIED | Uso por segmento + carrier fees | País, registro y carrier | Canal opcional |
| LC Phone: números y llamadas | NOT VERIFIED | Números, minutos, recording, transcription y fees separados | País y compliance | Telefonía opcional |
| WhatsApp | NOT VERIFIED | Add-on USD 10/mes/subcuenta + uso por país/caso | WABA, Meta, plantillas y pricing | Addon + consumo |
| Conversation AI | NOT VERIFIED | Growth: 1.000 respuestas/mes; Unlimited: fair use; pay-per-use por tokens | Modelo, tokens y límites | Addon IA opcional |
| Voice AI | NOT VERIFIED | Growth: 100 min/mes; Unlimited: fair use; teléfono separado | Modelo, TTS, minutos y teléfono | Addon IA opcional |
| AI Employee | NOT VERIFIED | Growth USD 50; Unlimited USD 97 por location/mes | Fair use, overages y rebilling | No dentro de licencia base |
| Knowledge Base | NOT VERIFIED | Incluida según documentación AI/fair use | Contenido y permisos | Base de conocimiento futura |
| Agent Studio | NOT VERIFIED | Pay-per-use en todos los planes | Tokens, APIs y modelos | Fuera del piloto inicial |
| Workflow AI / Content AI / Reviews AI | NOT VERIFIED | Incluido o uso variable según producto/plan | Fair use y consumo | Auditar antes de ofertar |
| Reporting/dashboards | NOT VERIFIED | Core publicado; profundidad por plan | Datos y permisos | Reporte operativo |
| API/webhooks | NOT VERIFIED | API básica Unlimited; avanzada Pro | OAuth, scopes y límites | Solo fase futura |
| Subaccounts/locations | NOT VERIFIED | 3 Starter; ilimitadas Unlimited/Pro | Cuenta real y gobierno | 1 location por organización piloto |
| Snapshots | NOT VERIFIED | Disponibilidad/configuración por verificar | Plantillas, versiones y límites | Estandarización futura |

`Unlimited` no significa uso gratuito ilimitado: telefonía, mensajes, email,
carrier fees, IA por encima de límites y otros consumos pueden seguir siendo
cobrables. «Unlimited» de IA queda además sujeto a fair use.

## 3. Clasificación de costes

| Categoría | Elementos | Regla Vecidya |
| --- | --- | --- |
| **A. Incluido en plan GHL** | CRM, contactos, pipelines, conversaciones, forms, calendars, workflows, landings, social y reporting cuando el plan/cuenta los habilite | Puede sustentar la configuración de una licencia, pero no garantiza que esté disponible en la cuenta real |
| **B. Addon mensual** | WhatsApp (referencia USD 10/location), AI Employee Growth/Unlimited, servicios resellables | Se cotiza separado de la licencia y se activa solo por necesidad |
| **C. Consumo variable** | Phone numbers, minutos, SMS/MMS, carrier fees, email, WhatsApp por país/caso, tokens, TTS, acciones premium y publicidad | Se informa por unidad; nunca se llama «ilimitado» por defecto |
| **D. Servicio de implementación Vecidya** | Configuración, snapshot, campos, pipeline, landing, forms, workflows, capacitación, QA e integraciones | Trabajo con alcance y resultado acordados; no es capacidad automática |
| **E. No disponible/pendiente** | Cualquier función no habilitada en la cuenta real, Labs no activado, API/scopes no confirmados y funciones fuera del plan | No se promete; se registra como gap o decisión |

### AI

AI se mantiene separado de Cuadra/Barrio/Ciudad. Referencias actuales de la
documentación: AI Employee Growth USD 50/location/mes con 1.000 respuestas de
Conversation AI y 100 minutos Voice AI; AI Employee Unlimited USD 97/location/mes,
sujeto a fair use. Agent Studio sigue pay-per-use y el teléfono se factura
aparte. El rebilling de AI Employee requiere Agency Pro según la documentación;
la posibilidad exacta debe confirmarse en la cuenta.

### Telefonía

La propuesta futura debe separar siempre **número + minutos + SMS + MMS +
carrier fees + grabación/transcripción + registro/compliance**. Las tarifas
varían por país; las cifras US/Canada de la guía no son tarifas para Colombia u
otro mercado. No se fija una cifra global de telefonía.

### WhatsApp

WhatsApp se modela como **addon de integración + consumo de mensajes + servicio
de configuración**, no como una capacidad ilimitada de licencia. Requiere
validar WABA/Meta, plantillas, categorías marketing/utility/service, ventana de
servicio, país y cambio de pricing anunciado para el 2026-10-01. La referencia
USD 10/location/mes es externa y no está validada en una cuenta Vecidya.

## 4. Mapeo Vecidya → HighLevel

| Producto Vecidya | Capacidad GHL | Configuración propuesta | Tipo de coste | Estado |
| --- | --- | --- | --- | --- |
| Cuadra | CRM, contactos, notas, tareas, oportunidades, 1 pipeline, 1 calendar | Base mínima y permisos documentados | A + D; C si usa canales | Planned / no implementado |
| Barrio | Cuadra + forms, 1 landing, 1 calendar, workflows estándar y seguimiento | Snapshot/configuración repetible | A + D; C según canal | Planned / no implementado |
| Ciudad | Barrio + hasta 3 pipelines, 5 forms, 3 calendars, 2 landings, automatizaciones y control | Configuración avanzada estándar | A + D; C según volumen | Planned / no implementado |
| WhatsApp | WhatsApp Integration | WABA, plantillas y reglas del canal | B + C + D | Optional / no implementado |
| AI Voice | Voice AI | Agente, conocimiento, límites y teléfono | B + C + D | Optional / no implementado |
| AI Chat | Conversation AI | Prompt, knowledge base, límites y revisión humana | B + C + D | Optional / no implementado |

Las cantidades de la tabla de licencias son objetivos comerciales a validar en
la configuración real, no límites técnicos atribuidos a GHL sin prueba.

## 5. Validación de licencias

### Cuadra

| Elemento | Estado | Observación |
| --- | --- | --- |
| Perfil público Vecidya | EXTERNAL | Vive en Vecidya; no se duplica en GHL |
| CRM/contactos/notas/tareas/oportunidades | SUPPORTED WITH CONFIG | Capability core publicada; validar plan y permisos |
| 1 pipeline | SUPPORTED WITH CONFIG | Debe definirse template y etapas |
| Calendario | SUPPORTED WITH CONFIG | Debe definirse disponibilidad y zona horaria |
| Social Planner | SUPPORTED WITH CONFIG | Validar canales y permisos de publicación |
| Usuarios/soporte | NEEDS DECISION | Cuotas, roles y soporte Vecidya no equivalen a usuarios GHL |

Cuadra es entregable solo como configuración operativa documentada; no cambia
la licencia comercial ni se publica como integración activa en este bloque.

### Barrio

| Elemento | Estado | Observación |
| --- | --- | --- |
| 2 forms, 1 landing, 1 calendar | SUPPORTED WITH CONFIG | Core publicado; construir y probar templates |
| 3 automatizaciones estándar | SUPPORTED WITH CONFIG | Solo triggers/actions soportados y alcance acotado |
| Captura, source, responsible y follow-up | SUPPORTED WITH CONFIG | Requiere convención de campos, owner y etapas |
| Recordatorios y post-sale básico | SUPPORTED WITH CONFIG | Validar canales y consumos antes de activarlos |
| Review request | SUPPORTED WITH CONFIG | Requiere fuentes/permisos y política de comunicación |
| Usuarios y reportes básicos | NEEDS DECISION | Definir roles Vecidya, acceso del cliente y métricas |

Barrio no significa tres proyectos personalizados: las definiciones de
«standard» de la sección 6 son parte de la entrega.

### Ciudad

| Elemento | Estado | Observación |
| --- | --- | --- |
| Hasta 3 pipelines, 5 forms, 3 calendars, 2 landings | SUPPORTED WITH CONFIG | Validar límites y permisos de la cuenta real |
| 8 automatizaciones | SUPPORTED WITH CONFIG | Solo plantillas versionadas; premium actions generan consumo |
| 10 usuarios, assignment y segmentation | NEEDS DECISION | Confirmar roles, ownership y acceso por equipo |
| Reactivación y procesos recurrentes | SUPPORTED WITH CONFIG | Requiere definición de triggers, frecuencia y consentimiento |
| Reporting operativo y control de equipo | SUPPORTED WITH CONFIG | Confirmar dashboards y acceso disponibles |

Ciudad requiere un piloto previo de Cuadra/Barrio y no se activa por defecto.

## 6. Definición operativa de «standard»

Una configuración estándar es una plantilla versionada, reproducible y
aceptada por Vecidya, sin código personalizado ni API externa, con inputs,
outputs, permisos, límites y checklist de QA conocidos.

| Objeto | Definición OPS-001 |
| --- | --- |
| Standard form | Formulario basado en plantilla, campos y validaciones aprobados, un propósito de captura, consentimiento definido y destino a un pipeline/contact owner |
| Standard landing | Una plantilla visual y de contenido, un objetivo, dominio configurado y CTA definido; no incluye copy/campaña ilimitados |
| Standard automation | Template-supported, sin custom code ni API externa; trigger/action set conocido, ramas acotadas, manejo de error y prueba de salida |
| Standard pipeline | Nombre, etapas, criterios de entrada/salida, owner y campos mínimos; sin diseño ilimitado por cliente |
| Standard calendar | Un tipo de cita, disponibilidad, zona horaria, duración, buffers, recordatorio y responsable; canales variables se cotizan aparte |

El número de objetos incluido en una licencia debe contar instancias de estas
plantillas, no proyectos personalizados. Cualquier excepción, integración,
copywriting, migración, custom code, API, canal pago o lógica no soportada es
Servicio Vecidya y/o Consumo.

## 7. Modelo de subaccount/location

Contrato propuesto, aún no implementado:

```text
1 organización Vecidya = 1 cliente Vecidya = 1 GHL subaccount/location
```

Excepciones requieren decisión explícita: varias marcas legalmente separadas,
operaciones con aislamiento regulatorio, franquicias, o una necesidad real de
entornos separados. Una excepción no autoriza automáticamente una nueva
organización Vecidya ni una cuenta GHL adicional.

Identificadores futuros, solo como contrato:

- `vecidya_organization_id` — identificador interno Vecidya;
- `ghl_location_id` — identificador externo de la location/subaccount;
- `integration_provider = ghl`;
- `integration_status` (`pending`, `connected`, `suspended`, `revoked`);
- `connected_at`, `last_sync_at`.

No se crean columnas ni migraciones en OPS-001. La metadata debe ser
tenant-scoped, no contener credenciales y no duplicar contactos, conversaciones
u oportunidades.

## 8. Source of truth

| Dato | Fuente de verdad |
| --- | --- |
| Business identity, usuarios, organizaciones, membresías y permisos | Vecidya |
| Public profile, Vecindario y experiencia pública | Vecidya |
| Licencia, addon contratado, servicio y registro comercial | Vecidya |
| Contactos | GHL |
| Conversaciones | GHL / proveedor del canal |
| Oportunidades y pipelines | GHL |
| Calendarios y reservas CRM | GHL |
| Forms, landings y workflows operativos | GHL |
| AI conversations/usage | GHL / proveedor |
| Usage/billing externo | GHL/proveedor + registro comercial Vecidya |
| Estado de conexión y referencias externas | Vecidya, como metadata |

Vecidya no crea espejos de CRM en D1. Una futura excepción debe justificar
consistencia, privacidad, retención, eliminación y aislamiento tenant.

## 9. Piloto mínimo

Objetivo: demostrar que una organización Vecidya puede recibir una entrega
operativa mínima en HighLevel, sin activar todo el catálogo.

1. Una subaccount/location real.
2. Un cliente/piloto autorizado.
3. Un pipeline estándar.
4. Un calendar estándar.
5. Un form estándar.
6. Un workflow estándar.
7. Contactos, oportunidades y conversaciones de prueba controladas.
8. Checklist de permisos, ownership, trazabilidad y coste.

El piloto **no** activa AI Voice ni WhatsApp salvo necesidad y autorización
explícitas. No incluye sincronización automática con Vecidya, checkout,
rebilling al cliente, migración de datos, múltiples locations ni publicación de
precios. Antes de ejecutarlo se deben resolver el plan real, cliente, datos,
consentimiento, país/canales, cuenta de pago y alcance de implementación.

## 10. Contrato de integración futura

OPS-001 deja únicamente este contrato conceptual:

- Vecidya inicia o registra una conexión tenant-scoped;
- HighLevel conserva los objetos CRM y los cambios operativos;
- Vecidya conserva la referencia externa, estado de conexión y timestamps;
- OAuth, scopes, token storage, webhooks, retries, idempotencia, revocación y
  sincronización se diseñan en OPS-002 o una fase posterior;
- ningún contacto, mensaje, oportunidad, pipeline o ejecución de workflow se
  replica sin una decisión arquitectónica específica.

## 11. Riesgos y decisiones abiertas

| ID | Riesgo/decisión | Estado |
| --- | --- | --- |
| OPS-001-D1 | Confirmar plan, ciclo, subcuentas, Labs y capacidades en cuenta real | BLOQUEADA por acceso |
| OPS-001-D2 | Confirmar mercado/país y tarifas de Phone, SMS, WhatsApp y compliance | ABIERTA |
| OPS-001-D3 | Definir roles, soporte, límites y ownership por licencia | ABIERTA |
| OPS-001-D4 | Aprobar templates y conteo de objetos «standard» | ABIERTA |
| OPS-001-D5 | Definir tratamiento de consentimiento, retención y bajas de canales | ABIERTA/legal |
| OPS-001-D6 | Decidir si se necesita rebilling; no asumir Agency Pro | ABIERTA |
| OPS-001-D7 | Elegir cliente piloto y autorización de datos | BLOQUEADA por decisión/datos |
| OPS-001-D8 | Confirmar si el grupo WhatsApp Vecidya/Vecindario es Growth/Community | BACKLOG, fuera de OPS-001 |

## 12. Siguiente fase

OPS-002 — GHL Pilot Implementation puede comenzar únicamente después de:

1. confirmar la cuenta real y su acceso;
2. cerrar el alcance estándar de Cuadra/Barrio;
3. elegir un cliente autorizado;
4. aprobar tratamiento de datos y canales;
5. documentar el plan de rollback y costes;
6. autorizar explícitamente cualquier API, OAuth, webhook, secreto o cambio de
   schema que resulte necesario.

Hasta entonces, GHL continúa `NOT IMPLEMENTED` en Vecidya y la versión se
mantiene en `0.3.0`.
