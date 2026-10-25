import type { LearnArticle } from "./learn";

/** APRENDE-EDITORIAL-04B: guías técnicas separadas de artículos que cubrían más de una decisión. */
export const learnTechnical04BArticles: LearnArticle[] = [
  {
    slug: "como-cambiar-proveedor-dominio-hosting-sin-perder-web-correo",
    category: "Tecnología explicada",
    title: "Cómo cambiar de proveedor sin perder tu dominio, tu web ni el correo",
    intro: "Cambiar de proveedor no es mover una sola cosa. Antes de tocar DNS o cancelar un servicio, identifica qué depende del dominio, prepara la copia y comprueba cada pieza por separado.",
    excerpt: "Una guía paso a paso para migrar dominio, web, DNS o correo sin confundir servicios ni cancelar demasiado pronto.",
    enPocasPalabras: [
      "Averigua primero qué proveedor administra el dominio, el DNS, la web y el correo.",
      "Prepara y prueba el nuevo servicio antes de cambiar registros o cancelar el anterior.",
      "Comprueba web y correo por separado y conserva una forma de volver atrás si algo falla.",
    ],
    image: "/assets/learn/diagram-domain-dns-hosting.svg",
    imageAlt: "Esquema de un dominio conectado a DNS, sitio web y correo durante un cambio de proveedor.",
    editorialDraft: true,
    relatedSlugs: [
      "como-elegir-y-cambiar-proveedor-de-dominio-y-hosting",
      "dominio-hosting-sitio-web-como-funcionan",
      "dns-https-y-correo-como-se-conecta-tu-dominio",
    ],
    cta: {
      label: "Revisar mi situación",
      to: "/diagnostico",
      copy: "Si el cambio forma parte de una mejora mayor del negocio, revisa primero qué problema quieres resolver y qué servicios dependen de la configuración actual.",
    },
    sections: [
      {
        heading: "Primero aclara qué significa «cambiar de proveedor»",
        paragraphs: [
          "Un dominio, el DNS, la página web y el correo pueden estar con empresas distintas. Por eso «cambiar de proveedor» puede significar transferir el registro del dominio, mover el alojamiento de la web, cambiar quién administra la zona DNS o migrar los buzones de correo.",
          "No des por hecho que mover una pieza mueve las demás. Una transferencia de dominio no copia la web. Cambiar el hosting no traslada automáticamente el correo. Cambiar los servidores de nombres puede afectar varios servicios a la vez si no replicas los registros que necesitan.",
        ],
        blocks: [{
          type: "definitions",
          items: [
            { term: "Registrador", definition: "Empresa con la que se administra el registro del dominio y sus renovaciones." },
            { term: "DNS", definition: "Configuración que indica dónde encontrar servicios asociados al dominio, como la web o el correo." },
            { term: "Hosting o alojamiento", definition: "Servicio donde se publica y ejecuta la página web." },
            { term: "Proveedor de correo", definition: "Servicio que mantiene los buzones y necesita sus propios registros DNS." },
          ],
        }],
      },
      {
        heading: "Haz un inventario antes de tocar nada",
        paragraphs: [
          "La parte más importante de una migración ocurre antes del cambio. Escribe qué servicio tienes, quién lo administra, qué cuenta controla el acceso y qué fecha o condición de renovación existe.",
        ],
        blocks: [{
          type: "steps",
          label: "Inventario mínimo antes de migrar",
          items: [
            { title: "Identifica el registrador", detail: "Comprueba quién administra el contrato del dominio, qué cuenta tiene acceso y quién recibe los avisos de renovación." },
            { title: "Identifica dónde está el DNS", detail: "Anota qué servidores de nombres están activos y guarda una copia de los registros existentes antes de modificarlos." },
            { title: "Identifica dónde está la web", detail: "Localiza archivos, base de datos y configuraciones necesarias para publicar el sitio en otro alojamiento." },
            { title: "Identifica el correo", detail: "Comprueba qué proveedor mantiene los buzones y qué registros del correo necesita, por ejemplo MX para dirigir los mensajes o TXT para verificaciones y políticas. No supongas que pertenecen al hosting de la web." },
            { title: "Anota qué no puedes interrumpir", detail: "Por ejemplo, recepción de pedidos, formularios, correo del negocio o una página que deba seguir disponible durante el cambio." },
          ],
        }],
      },
      {
        heading: "Ejemplo: la web cambia de hosting, pero el correo se queda donde está",
        paragraphs: ["Caso hipotético para entender por qué conviene mover una sola pieza cada vez."],
        blocks: [{
          type: "example",
          title: "Una pastelería cambia el alojamiento de su web",
          hypothetical: true,
          context: "La pastelería tiene el dominio con un registrador, la web en un hosting antiguo y el correo profesional con otro proveedor.",
          problem: "Si sustituye toda la zona DNS para conectar la nueva web, puede borrar los registros que necesita el correo y dejar de recibir mensajes.",
          approach: "Prepara el sitio nuevo, conserva una copia del DNS y cambia únicamente los registros de la web que el nuevo hosting confirma como necesarios.",
          actions: [
            "Publicar una copia de la web en el nuevo alojamiento y probarla antes de cambiar el dominio.",
            "Guardar los registros DNS actuales e identificar cuáles pertenecen al correo.",
            "Modificar solo los registros indicados para la web y conservar los del correo.",
            "Probar página, formularios, recepción y envío de correo antes de cancelar el hosting anterior.",
          ],
          lesson: "Una migración segura separa servicios y comprobaciones. Que la nueva web abra no demuestra que el correo y los demás servicios estén funcionando.",
        }],
      },
      {
        heading: "Cambia una pieza y comprueba antes de seguir",
        paragraphs: [
          "Evita hacer varios cambios grandes a la vez. Si el resultado falla, será más difícil saber qué lo causó. La secuencia exacta depende de los proveedores, pero la lógica general es preparar, cambiar, comprobar y solo después retirar lo antiguo.",
        ],
        blocks: [{
          type: "list",
          items: [
            "Si cambias el hosting, prueba primero el nuevo sitio y después actualiza los registros de la web.",
            "Si cambias el proveedor DNS, replica antes los registros que necesitan web, correo y verificaciones.",
            "Si transfieres el dominio a otro registrador, sigue los requisitos de ambos registradores y comprueba cómo queda la renovación.",
            "Si migras el correo, prepara los buzones y confirma el procedimiento del proveedor antes de sustituir los registros de correo.",
          ],
        }, {
          type: "callout",
          tone: "caution",
          title: "No canceles el servicio anterior demasiado pronto",
          text: "Espera hasta comprobar qué dependía del servicio viejo. Cancelar antes de validar puede eliminar archivos, buzones, copias o accesos que todavía necesitas para recuperar la operación.",
        }],
      },
      {
        heading: "Qué comprobar después del cambio",
        paragraphs: [
          "No basta con abrir la portada de la web. Comprueba las funciones que realmente usa el negocio y hazlo desde una conexión o dispositivo distinto cuando sea posible.",
        ],
        blocks: [{
          type: "steps",
          label: "Comprobación posterior",
          items: [
            { title: "Abre el dominio con una conexión segura (HTTPS)", detail: "Confirma que carga el sitio esperado y que el navegador no muestra una advertencia sobre el certificado de seguridad." },
            { title: "Prueba páginas y formularios", detail: "Revisa las rutas importantes y confirma que las solicitudes llegan al lugar correcto." },
            { title: "Prueba el correo", detail: "Envía y recibe mensajes de prueba desde una cuenta externa si el correo forma parte del dominio." },
            { title: "Revisa DNS", detail: "Comprueba que los registros vigentes coinciden con las instrucciones de los proveedores que realmente usas." },
            { title: "Documenta el nuevo estado", detail: "Anota quién administra cada servicio, cómo se recupera el acceso y cuándo se renueva." },
          ],
        }],
      },
      {
        heading: "Si no sabes quién controla el dominio",
        paragraphs: [
          "Busca facturas, mensajes de renovación, documentos del negocio y el gestor de contraseñas. Para dominios genéricos, ICANN Lookup puede ayudar a identificar el registrador, aunque no te dice necesariamente quién tiene acceso a la cuenta ni dónde está alojada la web.",
          "Usa los canales oficiales del registrador para recuperar el acceso. No cambies servidores de nombres ni registres otro dominio parecido solo porque todavía no hayas encontrado la cuenta correcta.",
        ],
      },
      {
        heading: "Preguntas frecuentes",
        paragraphs: [],
        blocks: [{
          type: "faq",
          items: [
            { question: "¿Transferir el dominio mueve también la web?", answer: "No. El registro del dominio y el alojamiento son servicios distintos. La web debe migrarse y probarse por separado." },
            { question: "¿Cambiar el hosting afecta al correo?", answer: "Puede afectarlo si modificas o sustituyes la zona DNS. Conserva los registros que el proveedor de correo necesita." },
            { question: "¿Cuándo cancelo el proveedor anterior?", answer: "Después de comprobar que los servicios que dependían de él ya funcionan en el nuevo entorno y que conservas los datos o copias que necesitas." },
            { question: "¿Tengo que cambiar también el registrador?", answer: "No necesariamente. Puedes cambiar el hosting o el DNS y mantener el dominio con el registrador actual." },
          ],
        }],
      },
      {
        heading: "Qué puedes hacer ahora",
        paragraphs: [],
        blocks: [{
          type: "summary",
          items: [
            "Haz un mapa de dominio, DNS, web y correo antes de modificar nada.",
            "Prepara y prueba el destino nuevo antes de cambiar la configuración pública.",
            "Comprueba cada servicio y conserva el anterior hasta confirmar que ya no lo necesitas.",
          ],
        }],
      },
      {
        heading: "Fuentes y alcance",
        paragraphs: [
          "Las referencias explican responsabilidades del registrante y fundamentos de DNS y TLS. Los pasos concretos de una migración dependen de los proveedores y de la extensión del dominio.",
        ],
        blocks: [{
          type: "sources",
          items: [
            { label: "Information for Domain Name Registrants — ICANN", url: "https://www.icann.org/registrants", scope: "Explica el papel del registrante y el registrador e incluye acceso a recursos de consulta y gestión de dominios." },
            { label: "The Domain Name Registration Process — ICANN", url: "https://www.icann.org/resources/pages/domain-name-registration-process-2023-11-02-en", scope: "Describe los participantes del registro y las relaciones entre registrante, registrador, operador de registro y revendedores." },
            { label: "RFC 1034 — Domain Names: Concepts and Facilities", url: "https://datatracker.ietf.org/doc/html/rfc1034", scope: "Describe conceptos fundamentales del sistema de nombres de dominio, servidores de nombres, resolvers y caché." },
            { label: "RFC 1035 — Domain Names: Implementation and Specification", url: "https://datatracker.ietf.org/doc/html/rfc1035", scope: "Especifica registros DNS como A, NS, CNAME y MX; no es una guía específica de un proveedor." },
            { label: "Transport Layer Security (TLS) — MDN Web Docs", url: "https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Transport_Layer_Security", scope: "Explica la función de TLS en conexiones web seguras y el papel del certificado del servidor." },
          ],
        }],
      },
    ],
  },
];
