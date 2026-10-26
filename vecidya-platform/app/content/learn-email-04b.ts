import type { LearnArticle } from "./learn";

/** APRENDE-EDITORIAL-04B: correo profesional separado del mapa general de DNS/HTTPS/correo. */
export const learnEmail04BArticles: LearnArticle[] = [
  {
    slug: "correo-profesional-dominio-registros-mx-txt",
    category: "Tecnología explicada",
    title: "Correo profesional y dominio: qué hacen MX, TXT, SPF, DKIM y DMARC",
    intro: "Tu página puede funcionar mientras el correo falla porque web y correo usan configuraciones distintas. Aprende qué papel cumplen los registros del dominio sin memorizar valores técnicos.",
    excerpt: "Entiende cómo se conecta el correo con tu dominio y por qué MX, TXT, SPF, DKIM y DMARC cumplen funciones diferentes.",
    enPocasPalabras: [
      "Los registros MX indican dónde debe recibirse el correo de tu dominio.",
      "SPF, DKIM y DMARC ayudan a autenticar el uso del dominio, pero no hacen lo mismo.",
      "Usa la configuración oficial de tu proveedor y prueba envío y recepción después de cada cambio.",
    ],
    image: "/assets/learn/diagram-correo-para.svg",
    imageAlt: "Un dominio conecta buzones de correo mediante registros DNS separados de la configuración de la página web.",
    editorialDraft: true,
    relatedSlugs: [
      "dns-https-y-correo-como-se-conecta-tu-dominio",
      "dominio-hosting-sitio-web-como-funcionan",
      "como-cambiar-proveedor-dominio-hosting-sin-perder-web-correo",
    ],
    cta: {
      label: "Revisar mi situación",
      to: "/diagnostico",
      copy: "Si el correo forma parte de un problema mayor de presencia digital, revisa primero qué servicio está fallando y quién controla la cuenta.",
    },
    sections: [
      {
        heading: "Qué necesitas entender antes de tocar el DNS",
        paragraphs: [
          "El correo con tu propio dominio depende de un proveedor de buzones y de registros publicados en DNS. La página web puede usar otros registros y otro proveedor.",
          "No necesitas memorizar códigos. Sí conviene saber qué función cumple cada pieza y guardar una copia de la configuración que ya funciona antes de modificarla.",
        ],
        blocks: [{
          type: "definitions",
          items: [
            { term: "MX", definition: "Indica qué servidores reciben el correo dirigido a tu dominio." },
            { term: "TXT", definition: "Registro de texto usado para verificaciones y políticas. No todos los TXT pertenecen al correo." },
            { term: "SPF", definition: "Indica qué sistemas están autorizados a enviar usando determinadas identidades del dominio." },
            { term: "DKIM", definition: "Firma que permite comprobar que un sistema autorizado firmó el mensaje con una clave vinculada al dominio." },
            { term: "DMARC", definition: "Política que usa resultados de autenticación para indicar cómo evaluar ciertos fallos y, si se configura, solicitar informes." },
          ],
        }],
      },
      {
        heading: "Ejemplo: conectar una web nueva sin romper el correo",
        paragraphs: ["Caso hipotético para separar la configuración de la página de la configuración de los buzones."],
        blocks: [{
          type: "example",
          title: "Una clínica cambia su página, pero conserva el correo",
          hypothetical: true,
          context: "La clínica publica una web nueva con otro proveedor y mantiene los mismos buzones de correo.",
          problem: "Alguien piensa que debe borrar todos los registros anteriores y dejar únicamente los que pide la nueva plataforma web.",
          approach: "Antes de cambiar nada, identifica qué registros pertenecen a la web y cuáles necesita el proveedor de correo.",
          actions: [
            "Guardar una copia de la zona DNS actual.",
            "Anotar qué proveedor mantiene los buzones y qué registros necesita.",
            "Cambiar únicamente los registros necesarios para publicar la web.",
            "Enviar y recibir mensajes de prueba desde una cuenta externa.",
          ],
          lesson: "Web y correo comparten el dominio, pero no la misma configuración. Que la página funcione no demuestra que el correo esté bien.",
        }],
      },
      {
        heading: "SPF, DKIM y DMARC: tres funciones diferentes",
        paragraphs: [
          "Los tres nombres suelen aparecer juntos, pero no son tres versiones de lo mismo.",
        ],
        blocks: [{
          type: "list",
          items: [
            "SPF publica qué sistemas están autorizados a enviar usando determinadas identidades del dominio.",
            "DKIM añade una firma al mensaje y publica en DNS la información necesaria para comprobarla.",
            "DMARC define cómo evaluar ciertos resultados de autenticación y puede solicitar informes. Desde mayo de 2026, RFC 9989 sustituye a RFC 7489 como especificación principal.",
            "Ningún mecanismo garantiza por sí solo que un mensaje sea verdadero, seguro o libre de spam.",
          ],
        }, {
          type: "callout",
          tone: "caution",
          title: "No copies valores de otro dominio",
          text: "La configuración depende de los servicios que realmente envían correo por tu dominio. Usa las instrucciones vigentes del proveedor y valida el resultado.",
        }],
      },
      {
        heading: "Cómo hacer un cambio con menos riesgo",
        paragraphs: [
          "Evita modificar varios registros a la vez. Si algo falla, será más difícil saber qué cambio lo causó.",
        ],
        blocks: [{
          type: "steps",
          label: "Secuencia básica",
          items: [
            { title: "Identifica al proveedor", detail: "Confirma qué servicio mantiene los buzones y quién administra la cuenta." },
            { title: "Guarda el estado actual", detail: "Copia MX y los TXT relacionados antes de cambiar nada." },
            { title: "Sigue documentación oficial", detail: "Añade exactamente los valores indicados para tu dominio y tu cuenta." },
            { title: "Prueba desde fuera", detail: "Envía un mensaje desde una cuenta externa y responde desde el dominio." },
            { title: "Documenta el resultado", detail: "Anota qué registros quedan vigentes y quién será responsable de futuros cambios." },
          ],
        }],
      },
      {
        heading: "Errores frecuentes",
        paragraphs: [],
        blocks: [{
          type: "list",
          items: [
            "Borrar todos los registros DNS al conectar una página nueva.",
            "Crear más de una política SPF para el mismo nombre sin entender cómo debe combinarse.",
            "Copiar una clave o selector DKIM de otra cuenta.",
            "Aplicar una política DMARC estricta sin comprobar primero qué servicios legítimos envían correo.",
            "Comprobar solo que puedes enviar y olvidar probar la recepción.",
            "Dejar la cuenta administrativa bajo una persona que ya no participa en el negocio.",
          ],
        }],
      },
      {
        heading: "Preguntas frecuentes",
        paragraphs: [],
        blocks: [{
          type: "faq",
          items: [
            { question: "¿El hosting de la web incluye correo?", answer: "No necesariamente. Comprueba qué proveedor mantiene los buzones y qué registros necesita." },
            { question: "¿Puedo tener web y correo con empresas distintas?", answer: "Sí. El DNS puede dirigir cada servicio al proveedor correspondiente." },
            { question: "¿Un registro TXT es siempre de correo?", answer: "No. TXT también se usa para otras verificaciones. Identifica su función antes de borrarlo." },
            { question: "¿SPF, DKIM y DMARC evitan todo el spam?", answer: "No. Ayudan a autenticar el uso del dominio y a aplicar políticas, pero no sustituyen otros controles de seguridad." },
          ],
        }],
      },
      {
        heading: "Fuentes y siguiente paso",
        paragraphs: [
          "Esta guía explica conceptos, no valores de configuración. Para cambiar registros usa la documentación vigente del proveedor que realmente utilizas.",
        ],
        blocks: [{
          type: "sources",
          items: [
            { label: "RFC 1035 — Domain Names: Implementation and Specification", url: "https://datatracker.ietf.org/doc/html/rfc1035", scope: "Especifica registros DNS, incluidos MX y TXT." },
            { label: "RFC 7208 — Sender Policy Framework (SPF)", url: "https://datatracker.ietf.org/doc/html/rfc7208", scope: "Define SPF y su publicación mediante DNS." },
            { label: "RFC 6376 — DomainKeys Identified Mail (DKIM) Signatures", url: "https://datatracker.ietf.org/doc/html/rfc6376", scope: "Define DKIM y el uso de firmas verificables mediante información publicada en el dominio." },
            { label: "RFC 9989 — Domain-Based Message Authentication, Reporting, and Conformance (DMARC)", url: "https://datatracker.ietf.org/doc/html/rfc9989", scope: "Especificación publicada en mayo de 2026 que obsoleta RFC 7489 y describe el protocolo DMARC vigente." },
          ],
        }, {
          type: "summary",
          items: [
            "Identifica quién mantiene tus buzones y guarda una copia de sus registros DNS.",
            "Distingue MX, TXT, SPF, DKIM y DMARC por su función.",
            "Después de cualquier cambio, comprueba envío y recepción antes de borrar la configuración anterior.",
          ],
        }],
      },
    ],
  },
];
