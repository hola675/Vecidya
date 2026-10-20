/**
 * COM-CATALOG-DETAILS-01 — oferta objetivo para comunicación comercial.
 * El catálogo explica capacidades de Vecidya y su modelo de contratación; NO es una
 * fuente de entitlements técnicos, estado del CRM o disponibilidad certificada.
 * Los precios y familias provienen del catálogo canónico de negocio.
 * No publicar nombres ni tarifas internas de proveedores tecnológicos.
 */

import { formatProviderResaleUsd, PROVIDER_BASELINE_USD_CENTS, PROVIDER_MARKUP_PERCENT } from "./provider-price-policy";

export type CommercialKind = "license" | "addon" | "service";

export type CommercialOffer = {
  id: string;
  kind: CommercialKind;
  title: string;
  promise: string;
  summary: string;
  bestFor: string;
  includes: readonly string[];
  excludes: readonly string[];
  examples: readonly string[];
  dependencies: string;
  decision: string;
  price: string;
  externalCosts: string;
  contactInterest: string;
  catalogPath: string;
  detailPath: string;
};

export type LicenseOffer = CommercialOffer & {
  kind: "license";
  id: "cuadra" | "barrio" | "ciudad";
  level: string;
  priceUsd: number;
  setupUsd: number;
  preview: readonly string[];
  standardModules: readonly { name: string; description: string }[];
};

const license = (slug: LicenseOffer["id"]) => `/licencias/${slug}`;
const addon = (slug: string) => `/addons/${slug}`;
const service = (slug: string) => `/servicios/${slug}`;

export const LICENSE_OFFERS: readonly LicenseOffer[] = [
  {
    id: "cuadra", kind: "license", title: "Cuadra", level: "Base",
    promise: "Organiza y presenta tu negocio.",
    summary: "Tu espacio Vecidya para organizar información, mostrar tu actividad y facilitar que te encuentren, sin necesitar todavía un CRM.",
    bestFor: "Negocios que necesitan una presencia clara y contactos directos, sin gestionar un seguimiento comercial recurrente dentro de un CRM.",
    price: "USD 39/mes", priceUsd: 39, setupUsd: 0,
    preview: ["Cuenta y organización Vecidya", "Perfil público y MiniWeb", "Presencia en Vecindario", "Acceso a Mi Vecidya y gestión de información"],
    includes: [
      "Cuenta Vecidya, datos de tu organización y acceso a Mi Vecidya.",
      "Perfil de negocio y MiniWeb con presentación, servicios, ubicación, horarios y contacto, según sus componentes disponibles.",
      "Visibilidad en el Vecindario para perfiles aprobados y publicados.",
      "Gestión de contenido de presencia, equipo autorizado, información y prioridades.",
      "Acceso a recursos públicos de Aprende y Diagnóstico, que no son exclusivos de pago.",
      "Soporte base de la licencia y orientación sobre próximos pasos.",
    ],
    excludes: ["CRM de contactos, oportunidades y pipeline.", "Automatizaciones comerciales y calendario CRM.", "Complementos recurrentes, consumo de mensajes/IA y servicios a medida."],
    examples: [
      "Una peluquería presenta horarios, servicios, ubicación y el canal para escribirle directamente.",
      "Un profesional actualiza su MiniWeb y su ficha en el Vecindario sin pagar por procesos comerciales que todavía no necesita.",
    ],
    standardModules: [],
    dependencies: "No requiere CRM. La publicación de perfiles está sujeta a las reglas de licencia y aprobación de cada organización.",
    decision: "Conserva Cuadra mientras puedas atender directamente y no necesites registrar y dar seguimiento continuo a oportunidades. Cambia a Barrio cuando ese proceso sea recurrente.",
    externalCosts: "Dominio u otros proveedores opcionales, si corresponde, no se presumen incluidos.",
    contactInterest: "cuadra", catalogPath: "/licencias", detailPath: license("cuadra"),
  },
  {
    id: "barrio", kind: "license", title: "Barrio", level: "Crecimiento",
    promise: "Capta y da seguimiento sin perder oportunidades.",
    summary: "Todo Cuadra, más un CRM preparado por Vecidya para gestionar de principio a fin un proceso comercial principal y repetible.",
    bestFor: "Negocios que reciben consultas de forma recurrente, tienen citas o venden mediante una secuencia de contacto, atención, propuesta y seguimiento.",
    price: "USD 59/mes", priceUsd: 59, setupUsd: 19,
    preview: ["Todo Cuadra", "CRM: contactos y oportunidades", "Proceso comercial principal y agenda", "Seguimiento y automatización estándar"],
    includes: [
      "Todas las capacidades de Cuadra.",
      "CRM operativo para contactos, oportunidades y etapas del proceso comercial principal.",
      "Formulario de captación estándar y entrada de solicitudes al proceso correspondiente.",
      "Calendario o reserva estándar cuando tenga sentido para la actividad.",
      "Tareas, recordatorios y seguimiento de oportunidades.",
      "Automatizaciones estándar del mismo proceso: recepción, aviso, seguimiento y cierre.",
      "Configuración inicial estándar, permisos y orientación de uso.",
    ],
    excludes: [
      "No implica canales de mensajería premium, WhatsApp, telefonía o IA incluidos automáticamente.",
      "No incluye biblioteca multiproceso de Ciudad ni implementación de procesos personalizados.",
      "No incluye campañas gestionadas, publicidad, migración compleja o integraciones a medida.",
    ],
    examples: [
      "Una clínica recibe una solicitud de cita, la registra, asigna seguimiento y conoce si quedó atendida, sin suponer que los SMS o WhatsApp sean gratuitos.",
      "Un taller organiza contactos interesados y el estado de cada presupuesto dentro de un proceso de venta.",
    ],
    standardModules: [
      { name: "Entrada y registro", description: "Formulario o captura estándar; identificación de contacto y oportunidad." },
      { name: "Seguimiento comercial", description: "Etapas, responsable, tareas y próximos pasos de una oportunidad." },
      { name: "Agenda cuando aplica", description: "Reserva y avisos estándar por canales habilitados; consumos externos aparte." },
      { name: "Confirmación y cierre", description: "Actualización del resultado, recordatorios y seguimiento básico del mismo proceso." },
    ],
    dependencies: "Incluye el CRM estándar. Los canales de comunicación con coste, IA y otras capacidades recurrentes se contratan como complementos cuando correspondan.",
    decision: "Elige Barrio al necesitar un proceso comercial principal repetible. No subas a Ciudad solo por tener más contactos, tareas o un complemento: asciende cuando debas coordinar procesos distintos, equipos y reglas entre ellos.",
    externalCosts: "Mensajes, llamadas, números, IA, APIs y otros consumos externos no están incluidos en el precio base.",
    contactInterest: "barrio", catalogPath: "/licencias", detailPath: license("barrio"),
  },
  {
    id: "ciudad", kind: "license", title: "Ciudad", level: "Escala",
    promise: "Coordina procesos, responsables y automatizaciones.",
    summary: "Todo Barrio, más una biblioteca modular de procesos operativos estándar para coordinar varias etapas del trabajo sin reconstruir cada sistema desde cero.",
    bestFor: "Organizaciones donde ventas, incorporación, atención, renovaciones u otros procesos relacionados necesitan distintos responsables, reglas y visibilidad de conjunto.",
    price: "USD 89/mes", priceUsd: 89, setupUsd: 29,
    preview: ["Todo Barrio", "Biblioteca modular multiproceso", "Coordinación de equipos y asignaciones", "Automatizaciones conectadas y control"],
    includes: [
      "Todas las capacidades de Barrio, incluido el CRM estándar.",
      "Selección y configuración de módulos operativos estándar de la biblioteca Ciudad según las necesidades de la organización.",
      "Procesos relacionados con etapas, responsables y traspasos definidos.",
      "Asignación, enrutamiento y seguimiento entre equipos o funciones.",
      "Automatizaciones condicionales y coordinación entre módulos estándar.",
      "Visibilidad operativa de estados y revisión de la coordinación comercial.",
      "Configuración inicial estándar de los módulos acordados; ajustes y soporte según la política de licencia.",
    ],
    excludes: [
      "No incluye automáticamente complementos de WhatsApp, telefonía, IA, campañas o integraciones facturadas aparte.",
      "No garantiza consultoría ilimitada, personalización sin límites ni desarrollo de procesos inéditos.",
      "No sustituye un ERP de contabilidad, inventario o recursos humanos.",
    ],
    examples: [
      "Ventas confirma una contratación y se activa el módulo estándar de incorporación para otro responsable.",
      "Una renovación próxima desencadena tareas coordinadas entre atención comercial y responsable de cuenta.",
    ],
    standardModules: [
      { name: "Ventas y oportunidades", description: "Continuidad del proceso comercial, con etapas relacionadas y traspasos." },
      { name: "Incorporación del cliente", description: "Secuencia estándar posterior a la contratación: responsable, tareas, confirmación y estado." },
      { name: "Atención y seguimiento", description: "Clasificación operativa, asignación, estados y comprobación de resolución, sin prometer un centro de soporte a medida." },
      { name: "Reactivación", description: "Segmentos y acciones de recuperación basadas en reglas y consentimiento aplicable." },
      { name: "Renovaciones", description: "Avisos, fechas relevantes, tareas y seguimiento de continuidad." },
      { name: "Asignación y coordinación", description: "Reglas estándar para distribuir trabajo y conectar procesos entre responsables." },
    ],
    dependencies: "Incluye CRM y biblioteca Ciudad estándar. Se habilitan solo los módulos necesarios, revisando datos, permisos y proceso real. Complementos y sus consumos se contratan aparte.",
    decision: "Ciudad conviene cuando hay varios procesos relacionados que necesitan coordinación real. Si Barrio ya resuelve tu operación principal, pagar Ciudad todavía no aporta valor.",
    externalCosts: "Comunicación, IA, telefonía, APIs, acciones premium o publicidad mantienen costes separados si se utilizan.",
    contactInterest: "ciudad", catalogPath: "/licencias", detailPath: license("ciudad"),
  },
];

export const ADDON_OFFERS: readonly CommercialOffer[] = [
  {
    id: "whatsapp-business", kind: "addon", title: "WhatsApp Business",
    promise: "Conecta conversaciones con tu seguimiento comercial.",
    summary: "Habilita la comunicación por WhatsApp para gestionar consultas dentro de la operación comercial.",
    bestFor: "Negocios que utilizan WhatsApp como canal habitual de atención.",
    includes: ["Habilitación estándar del canal, sujeta a aprobación y cuenta válida.", "Vinculación con la conversación y el seguimiento CRM cuando aplique."],
    excludes: ["No incluye un CRM en Cuadra.", "No incluye campañas personalizadas ni un asistente de IA.", "No incluye la tarifa por mensajes del canal."],
    examples: ["Una nueva consulta entra por WhatsApp y queda asociada a su seguimiento comercial."],
    dependencies: "Requiere Barrio o Ciudad, cuenta/canal admisible y aprobación del proveedor del canal.",
    decision: "No exige Ciudad si solo añades WhatsApp al proceso estándar de Barrio.",
    price: `USD ${formatProviderResaleUsd(PROVIDER_BASELINE_USD_CENTS.whatsappBusinessMonthly)}/mes + consumo`, externalCosts: "La cuota mensual del canal tiene coste base documentado de USD 10 por subcuenta; Vecidya repercute ese coste + 20 %. Los mensajes sujetos a tarifa y cargos del proveedor se calculan aparte sobre el importe real facturado a Vecidya, sin duplicarlos.",
    contactInterest: "complemento-whatsapp-business", catalogPath: "/addons", detailPath: addon("whatsapp-business"),
  },
  {
    id: "telephony-sms", kind: "addon", title: "Telefonía y SMS",
    promise: "Incorpora llamadas y mensajes a los procesos comerciales.",
    summary: "Canal telefónico o SMS para contacto y recordatorios cuando esté habilitado.",
    bestFor: "Negocios que necesitan llamadas o mensajes asociados a citas y oportunidades.",
    includes: ["Configuración estándar del canal y relación con el CRM.", "Uso del canal en comunicaciones habilitadas."],
    excludes: ["No incluye minutos, números, SMS ni registros regulatorios externos.", "No incluye atención por IA de Voz."],
    examples: ["Se prepara un recordatorio de cita por un canal autorizado y con consumo medido."],
    dependencies: "Requiere Barrio o Ciudad; disponibilidad geográfica, número y requisitos normativos del canal.",
    decision: "El complemento no exige Ciudad por sí solo; depende del proceso que necesite coordinar.",
    price: `Coste real + ${PROVIDER_MARKUP_PERCENT} %`, externalCosts: "El proveedor no exige una cuota genérica de USD 9 por activar el sistema telefónico: se pagan números, llamadas, segmentos SMS/MMS, registros y tasas reales según país y uso, más el 20 % de Vecidya sobre el importe facturado.",
    contactInterest: "complemento-telephony-sms", catalogPath: "/addons", detailPath: addon("telephony-sms"),
  },
  {
    id: "reputation-reviews", kind: "addon", title: "Reputación y Reseñas",
    promise: "Solicita y acompaña reseñas con un proceso consistente.",
    summary: "Kit recurrente de flujos de reseñas y seguimiento adicional, distinto de las solicitudes básicas que el CRM ya permite sin contratar este complemento.",
    bestFor: "Negocios que buscan cuidar su reputación sin fabricar opiniones.",
    includes: ["Circuito adicional de solicitud y seguimiento de reseñas reales, más allá del seguimiento comercial básico.", "Configuración de un modelo de reseñas previamente definido, revisión de estado y adaptación menor bajo el alcance del complemento."],
    excludes: ["No incluye reseñas pagadas o inventadas.", "No incluye campañas o agentes personalizados.", "No incluye consumos de mensajes cuando correspondan."],
    examples: ["Después de una atención real, se solicita voluntariamente una reseña mediante un canal permitido."],
    dependencies: "Normalmente Barrio o Ciudad para automatizar el seguimiento; revisión de canales y políticas de reseñas.",
    decision: "La reputación no convierte automáticamente un proceso principal en multiproceso.",
    price: `Gestión estándar incluida; extras + ${PROVIDER_MARKUP_PERCENT} %`, externalCosts: "La gestión y solicitud de reseñas estándar pertenece al CRM. Solo se factura consumo opcional real de mensajes o IA + 20 %; no hay cargo mensual de USD 12 inventado.",
    contactInterest: "complemento-reputation-reviews", catalogPath: "/addons", detailPath: addon("reputation-reviews"),
  },
  {
    id: "campaigns-diffusion", kind: "addon", title: "Campañas y Difusión",
    promise: "Comunica novedades a públicos autorizados.",
    summary: "Difusión segmentada recurrente adicional al seguimiento estándar de Barrio; no incluye producción creativa ni gestión publicitaria profesional.",
    bestFor: "Negocios con una audiencia que ha autorizado recibir comunicaciones.",
    includes: ["Preparación estándar del canal de difusión y segmentos básicos.", "Configuración recurrente compatible con el proceso CRM contratado."],
    excludes: ["No incluye el diseño y gestión de campañas a medida.", "No incluye pauta publicitaria ni envíos ilimitados."],
    examples: ["Se avisa a los contactos autorizados de un cambio de horario o una novedad."],
    dependencies: "Requiere Barrio o Ciudad y consentimiento, canales y proveedores habilitados.",
    decision: "Contratar campañas no exige Ciudad cuando siguen un único proceso comercial.",
    price: `Envíos reales + ${PROVIDER_MARKUP_PERCENT} %`, externalCosts: "La configuración estándar de campañas pertenece al CRM. Se cobran únicamente cargos reales de email, SMS, WhatsApp u otros canales + 20 %, y servicios profesionales especiales solo mediante propuesta.",
    contactInterest: "complemento-campaigns-diffusion", catalogPath: "/addons", detailPath: addon("campaigns-diffusion"),
  },
  {
    id: "conversational-ai", kind: "addon", title: "IA Conversacional",
    promise: "Apoya respuestas y clasificación inicial de consultas.",
    summary: "Asistencia automatizada en canales compatibles y con límites definidos.",
    bestFor: "Negocios con consultas frecuentes y respuestas iniciales repetitivas.",
    includes: ["Configuración estándar del asistente conversacional con alcance delimitado.", "Conexión con un proceso comercial existente cuando esté soportado."],
    excludes: ["No incluye un agente a medida ni supervisión autónoma de decisiones sensibles.", "No incluye uso de modelos y canales ilimitado."],
    examples: ["El asistente aclara una pregunta frecuente y deja el siguiente paso para revisión humana cuando lo necesita."],
    dependencies: "Requiere Barrio o Ciudad, canal compatible y configuración de proveedor/uso de IA.",
    decision: "Una IA para un proceso sencillo puede acompañar Barrio; la coordinación multiproceso puede justificar Ciudad.",
    price: `Plan de IA compartido o consumo + ${PROVIDER_MARKUP_PERCENT} %`, externalCosts: "Se cobra según uso o plan IA de la localización: Growth (referencia proveedor USD 50/mes → USD 60/mes Vecidya), Unlimited (USD 97 → USD 116.40), sujetos a condiciones. Es UNA suscripción IA compartida por localización para funciones compatibles; no se duplica por voz y conversación.",
    contactInterest: "complemento-conversational-ai", catalogPath: "/addons", detailPath: addon("conversational-ai"),
  },
  {
    id: "voice-ai", kind: "addon", title: "IA de Voz",
    promise: "Asiste llamadas iniciales con una experiencia de voz.",
    summary: "Capacidad de recepción o atención inicial por voz, diseñada con criterios de derivación y supervisión.",
    bestFor: "Negocios con alto peso de llamadas repetitivas o solicitudes de información.",
    includes: ["Configuración estándar del flujo de voz y sus límites.", "Derivación al equipo o registro de siguiente paso cuando esté habilitado."],
    excludes: ["No incluye número ni minutos telefónicos.", "No incluye un agente a medida ni promesas de atención autónoma ilimitada."],
    examples: ["Un agente solicita el motivo de la llamada y remite una consulta al responsable correspondiente."],
    dependencies: "Requiere Barrio o Ciudad, canal telefónico compatible y costes de voz/IA activados.",
    decision: "La IA de Voz no requiere Ciudad por sí misma; el número de procesos coordinados determina la licencia.",
    price: `Plan de IA compartido o consumo + ${PROVIDER_MARKUP_PERCENT} %`, externalCosts: "La IA se factura por consumo o por el MISMO plan IA compartido de la localización usado para conversación y reseñas: no cobrar otra segunda suscripción. La telefonía mantiene cargos separados al coste externo real + 20 %.",
    contactInterest: "complemento-voice-ai", catalogPath: "/addons", detailPath: addon("voice-ai"),
  },
  {
    id: "connections-integrations", kind: "addon", title: "Conexiones e Integraciones",
    promise: "Mantén conectados los sistemas compatibles.",
    summary: "Conexión recurrente estándar con una herramienta admitida; desarrollo a medida se cotiza como servicio profesional.",
    bestFor: "Negocios que necesitan intercambiar datos con un sistema compatible.",
    includes: ["Configuración de una conexión estándar documentada y compatible.", "Seguimiento básico de su conexión, según la propuesta contratada."],
    excludes: ["No incluye desarrollo de integraciones inéditas.", "No habilita funciones del CRM a una licencia Cuadra.", "No incluye costes API o de ejecuciones."],
    examples: ["Sincronizar una herramienta admitida con el CRM cuando la licencia permite esa operación."],
    dependencies: "La compatibilidad depende del destino: si modifica contactos, oportunidades o automatizaciones del CRM exige Barrio o Ciudad; si solo usa Vecidya, se evalúa con Cuadra caso por caso.",
    decision: "Una conexión estándar no requiere Ciudad; la necesidad de varios procesos coordinados sí puede justificarlo.",
    price: `Coste externo aplicable + ${PROVIDER_MARKUP_PERCENT} %`, externalCosts: "Las integraciones estándar incluidas en la licencia no llevan cuota extra. Solo si una conexión externa genera un cargo real de app, API o ejecución, se repercute + 20 %. Desarrollo a medida se cotiza como servicio.",
    contactInterest: "complemento-connections-integrations", catalogPath: "/addons", detailPath: addon("connections-integrations"),
  },
];

export const SERVICE_OFFERS: readonly CommercialOffer[] = [
  {
    id: "estructuracion", kind: "service", title: "Presencia & Marca",
    promise: "Construimos una presentación coherente de tu negocio.",
    summary: "Trabajo profesional sobre identidad visual, mensajes y cómo presentar la actividad.",
    bestFor: "Negocios con marca o presentación confusa.",
    includes: ["Diagnóstico del alcance concreto de marca o presentación.", "Diseño, entregables y revisiones acordadas en la propuesta."],
    excludes: ["No incluye automáticamente una licencia Vecidya.", "No equivale a mantener un CRM o gestionar campañas periódicas."],
    examples: ["Diseñar una identidad visual, un sistema de mensajes y una guía de aplicación."],
    dependencies: "Contratable sin licencia. Si el resultado se publica en MiniWeb/Vecindario, se requiere la licencia correspondiente.",
    decision: "No compres Barrio o Ciudad solo por necesitar identidad o diseño.",
    price: "Propuesta según alcance", externalCosts: "Activos, licencias de terceros o producción externa cuando corresponda.",
    contactInterest: "servicio-estructuracion", catalogPath: "/servicios", detailPath: service("estructuracion"),
  },
  {
    id: "formalizacion", kind: "service", title: "Web & Conversión",
    promise: "Diseñamos y desarrollamos una web con un objetivo claro.",
    summary: "Web corporativa, landing o comercio electrónico bajo un alcance de proyecto acordado.",
    bestFor: "Negocios cuya experiencia digital requiere diseño/desarrollo individual.",
    includes: ["Definición de objetivos y alcance.", "Diseño, desarrollo, entrega y revisión según propuesta."],
    excludes: ["No incluye hosting, integraciones o mantenimiento ilimitados por defecto.", "No es lo mismo que el MiniWeb estándar de la licencia."],
    examples: ["Crear una web independiente con estructura, contenido y pasos claros de contacto."],
    dependencies: "Puede contratarse sin licencia. Si se exige seguimiento CRM operativo, Barrio o Ciudad según procesos.",
    decision: "Una web a medida es servicio; si basta con MiniWeb, evalúa primero Cuadra.",
    price: "Propuesta según alcance", externalCosts: "Dominio, hosting, pasarelas y herramientas externas si aplican.",
    contactInterest: "servicio-formalizacion", catalogPath: "/servicios", detailPath: service("formalizacion"),
  },
  {
    id: "presencia-digital", kind: "service", title: "Visibilidad & Marketing",
    promise: "Mejoramos cómo encuentran y entienden tu negocio.",
    summary: "Estrategia de contenido, posicionamiento y campañas con entregables definidos.",
    bestFor: "Negocios que necesitan acompañamiento profesional en visibilidad.",
    includes: ["Análisis del alcance y propuesta de trabajo.", "Plan, piezas, configuración o gestión profesional según contrato."],
    excludes: ["No incluye presupuesto publicitario ni resultados garantizados.", "No equivale al complemento de envío recurrente."],
    examples: ["Planificar SEO local o una campaña específica de captación con métricas acordadas."],
    dependencies: "Puede contratarse sin licencia; si la operación necesita CRM, requiere Barrio/Ciudad.",
    decision: "Una campaña gestionada es servicio profesional, aunque utilice un canal contratado como complemento.",
    price: "Propuesta según alcance", externalCosts: "Inversión publicitaria y herramientas/canales externos por separado.",
    contactInterest: "servicio-presencia-digital", catalogPath: "/servicios", detailPath: service("presencia-digital"),
  },
  {
    id: "automatizacion", kind: "service", title: "Sistema Comercial",
    promise: "Diseñamos cómo tu negocio capta, atiende y convierte.",
    summary: "Consultoría e implantación personalizada del proceso comercial, distinta del estándar de Barrio y los módulos de Ciudad.",
    bestFor: "Negocios con procesos de ventas que requieren investigación o rediseño específico.",
    includes: ["Levantamiento y diseño del proceso.", "Configuración o implantación según propuesta profesional."],
    excludes: ["No sustituye la licencia para operar el CRM.", "No incluye soporte ilimitado o canales premium."],
    examples: ["Rediseñar etapas, responsabilidades y medición de un ciclo de ventas singular."],
    dependencies: "El diseño puede contratarse aparte; la operación CRM necesita Barrio o Ciudad según su complejidad.",
    decision: "Primero comprueba si Barrio Standard o un módulo Ciudad cubre el caso; solo contrata diseño a medida cuando no basten.",
    price: "Propuesta según alcance", externalCosts: "Canales, proveedores y ejecuciones premium cuando apliquen.",
    contactInterest: "servicio-automatizacion", catalogPath: "/servicios", detailPath: service("automatizacion"),
  },
  {
    id: "inteligencia-artificial", kind: "service", title: "Automatización & Integraciones",
    promise: "Conectamos procesos o herramientas con una solución diseñada para ti.",
    summary: "Trabajo profesional para automatizaciones especiales y conexiones que exceden los estándares licenciados.",
    bestFor: "Equipos cuyos procesos no se resuelven con las configuraciones disponibles.",
    includes: ["Análisis de viabilidad, alcance y riesgos.", "Implementación y pruebas acordadas."],
    excludes: ["No sustituye Ciudad si la operación es multiproceso recurrente.", "No incorpora consumo de APIs/IA ilimitado."],
    examples: ["Conectar un sistema especializado con reglas y validaciones acordadas."],
    dependencies: "Una solución que opera datos CRM necesita Barrio o Ciudad. El diseño independiente puede contratarse sin licencia.",
    decision: "Si es una conexión estándar, primero revisa el complemento; si es desarrollo a medida, es servicio.",
    price: "Propuesta según alcance", externalCosts: "APIs, infraestructura y acciones premium según uso.",
    contactInterest: "servicio-inteligencia-artificial", catalogPath: "/servicios", detailPath: service("inteligencia-artificial"),
  },
  {
    id: "visibilidad", kind: "service", title: "IA Aplicada",
    promise: "Diseñamos aplicaciones de IA para tareas y atención concretas.",
    summary: "Diseño, conocimiento, pruebas y supervisión de una solución IA más allá del complemento estándar.",
    bestFor: "Negocios que necesitan un agente, una integración o una asistencia especializada.",
    includes: ["Definición del caso de uso, límites y supervisión.", "Configuración, pruebas y entrega conforme al alcance."],
    excludes: ["No incluye suscripción o consumo del proveedor automáticamente.", "No sustituye el complemento recurrente requerido para operar un canal específico."],
    examples: ["Diseñar un agente especializado que clasifica solicitudes y deriva a una persona cuando corresponde."],
    dependencies: "El diseño puede ser independiente; si opera dentro del CRM requiere Barrio/Ciudad y los complementos necesarios.",
    decision: "Una IA estándar de conversación es complemento; su diseño o entrenamiento especial es servicio.",
    price: "Propuesta según alcance", externalCosts: "Modelos, llamadas, hosting y otros consumos si aplican.",
    contactInterest: "servicio-visibilidad", catalogPath: "/servicios", detailPath: service("visibilidad"),
  },
  {
    id: "desarrollo-empresarial", kind: "service", title: "Desarrollo Empresarial",
    promise: "Ordenamos decisiones, prioridades y procesos contigo.",
    summary: "Trabajo de análisis, planificación y acompañamiento proporcional al negocio.",
    bestFor: "Negocios que necesitan dirección profesional sin contratar necesariamente un software más grande.",
    includes: ["Análisis y plan de actuación ajustado al alcance.", "Sesiones o acompañamiento si se acuerdan."],
    excludes: ["No es una licencia operativa ni un ERP.", "No implica automatizaciones o implementación ilimitadas."],
    examples: ["Definir un plan de mejoras y un criterio de evaluación antes de incorporar herramientas."],
    dependencies: "Contratable sin licencia.",
    decision: "Un servicio independiente puede ser suficiente: no recomendamos licencia si aún no existe necesidad recurrente.",
    price: "Propuesta según alcance", externalCosts: "Desplazamientos y herramientas de terceros solo si se acuerdan.",
    contactInterest: "servicio-desarrollo-empresarial", catalogPath: "/servicios", detailPath: service("desarrollo-empresarial"),
  },
];

export function getCommercialOffer(kind: CommercialKind, id: string) {
  const entries: readonly CommercialOffer[] = kind === "license" ? LICENSE_OFFERS : kind === "addon" ? ADDON_OFFERS : SERVICE_OFFERS;
  return entries.find((offer) => offer.id === id);
}

export function commercialOffers(kind: CommercialKind): readonly CommercialOffer[] {
  return kind === "license" ? LICENSE_OFFERS : kind === "addon" ? ADDON_OFFERS : SERVICE_OFFERS;
}
