import type { LearnArticle } from "./learn";

/** APRENDE-EDITORIAL-04B: correo profesional separado del mapa general de DNS/HTTPS/correo. */
export const learnEmail04BArticles: LearnArticle[] = [
  {
    slug: "correo-profesional-dominio-registros-mx-txt",
    category: "Tecnología explicada",
    title: "Correo profesional y dominio: qué hacen MX, TXT, SPF, DKIM y DMARC",
    intro: "Tu página puede funcionar mientras el correo falla porque web y correo usan configuraciones distintas. Aprende qué papel cumplen los registros del dominio y qué conviene comprobar sin memorizar valores técnicos.",
    excerpt: "Entiende cómo se conecta el correo con tu dominio, qué significan MX y TXT y por qué SPF, DKIM y DMARC deben configurarse siguiendo las instrucciones del proveedor.",
    enPocasPalabras: [
      "Los registros MX indican dónde debe recibirse el correo de tu dominio.",
      "SPF, DKIM y DMARC ayudan a comprobar y proteger el uso del dominio en el correo, pero no son intercambiables.",
      "No copies valores de otro negocio: usa la configuración oficial de tu proveedor y prueba envío y recepción después de cada cambio.",
    ],
    image: "/assets/learn/diagram-correo-para.svg",
    imageAlt: "Un dominio conecta buzones de correo mediante registros DNS que deben mantenerse separados de la configuración de la página web.",
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
          "El correo con tu propio dominio depende de un proveedor de buzones y de varios registros publicados en DNS. La página web puede usar otros registros y hasta otro proveedor. Por eso cambiar una configuración de la web no debería implicar reemplazar a ciegas la del correo.",
          "No necesitas memorizar códigos para administrar un negocio. Sí conviene saber qué función cumple cada pieza y conservar una copia de la configuración que ya funciona antes de modificarla.",
        ],
        blocks: [{
          type: "definitions",
          items: [
            { term: "MX", definition: "Indica qué servidores reciben el correo dirigido a tu dominio. Los valores y prioridades los proporciona el servicio de correo." },
            { term: "TXT", definition: "Registro de texto que varios servicios usan para verificar un dominio o publicar políticas. No todos los TXT pertenecen al correo." },
            { term: "SPF", definition: "Política publicada en DNS que indica qué sistemas están autorizados a enviar correo usando determinadas identidades del dominio." },
            { term: "DKIM", definition: "Firma criptográfica añadida a los mensajes por el sistema de envío y comprobada mediante una clave pública publicada en DNS." },
            { term: "DMARC", definition: "Política que permite al propietario del dominio indicar cómo evaluar ciertos fallos de autenticación y solicitar informes sobre el uso del dominio." },
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
          context: "La clínica publica una web nueva con otro proveedor. Sus cuentas de correo siguen funcionando con el servicio que ya utiliza el equipo.",
          problem: "La persona que conecta la web piensa que debe borrar todos los registros anteriores y crear únicamente los que muestra la nueva plataforma.",
          approach: "Antes de cambiar nada, identifica qué registros corresponden a la web y cuáles necesita el proveedor de correo. Modifica solo los que la nueva web exige y conserva el resto hasta verificar su función.",
          actions: [
            "Guardar una copia de la zona DNS actual y anotar qué proveedor mantiene los buzones.",
            "Comparar los registros solicitados por la nueva web con los MX y TXT que usa el correo.",
            "Cambiar únicamente los registros necesarios para publicar la web.",
            "Enviar y recibir mensajes de prueba desde una cuenta externa antes de considerar terminado el cambio.",
          ],
          lesson: "Los servicios comparten el dominio, pero no la misma función. Una web correcta no demuestra que el correo esté bien configurado.",
        }],
      },
      {
        heading: "Qué hace cada mecanismo sin entrar en fórmulas",
        paragraphs: [
          "SPF, DKIM y DMARC suelen aparecer juntos, pero resuelven partes diferentes del problema. No conviene tratarlos como tres casillas equivalentes ni inventar sus valores.",
        ],
        blocks: [{
          type: "list",
          items: [
            "SPF publica qué sistemas pueden enviar utilizando determinadas identidades del dominio. Un registro mal preparado puede dejar fuera a servicios legítimos.",
            "DKIM permite que el receptor compruebe una firma vinculada al dominio mediante una clave pública publicada en DNS. La clave y el selector dependen del servicio que envía.",
            "DMARC combina resultados de autenticación y alineación para expresar una política del dominio y, cuando se configura, recibir informes. Desde mayo de 2026, RFC 9989 sustituye a RFC 7489 como especificación principal de DMARC.",
            "Ninguno de estos mecanismos garantiza que un mensaje sea verdadero o seguro por sí solo. Forman parte de un conjunto de controles de correo.",
          ],
        }, {
          type: "callout",
          tone: "caution",
          title: "No copies un registro de internet",
          text: "Los valores dependen de los servicios que realmente envían correo por tu dominio y de la política que hayas decidido aplicar. Sigue la documentación vigente de tus proveedores y valida el resultado.",
        }],
      },
      {
        heading: "Cómo hacer un cambio con menos riesgo",
        paragraphs: [
          "Cuando una plataforma te pida añadir o sustituir registros, evita cambiar varias cosas a la vez. Documenta el estado anterior y prueba el servicio después de cada paso importante.",
        ],
        blocks: [{
          type: "steps",
          label: "Secuencia básica para revisar el correo del dominio",
          items: [
            { title: "Identifica al proveedor de correo", detail: "Confirma qué servicio mantiene los buzones y qué cuenta administrativa controla la configuración." },
            { title: "Guarda la configuración actual", detail: "Copia MX y los TXT relacionados antes de modificarlos. No elimines un registro solo porque no reconoces su nombre." },
            { title: "Usa instrucciones oficiales", detail: "Añade los valores exactos que indica el proveedor para tu dominio y tu cuenta; no reutilices configuraciones ajenas." },
            { title: "Prueba desde fuera", detail: "Envía un mensaje desde una cuenta externa y responde desde el dominio. Comprueba también que los mensajes esperados no reboten." },
            { title: "Documenta quién lo mantiene", detail: "Anota qué proveedor usa el correo, quién tiene acceso y dónde consultar la configuración si cambia el responsable." },
          ],
        }],
      },
      {
        heading: "Errores frecuentes que conviene evitar",
        paragraphs: [],
        blocks: [{
          type: "list",
          items: [
            "Borrar todos los registros DNS al conectar una página web nueva.",
            "Crear más de una política SPF para el mismo nombre sin comprender cómo debe combinarse la autorización.",
            "Cambiar DKIM copiando una clave o selector de otra cuenta.",
            "Aplicar una política DMARC estricta sin comprobar primero qué servicios legítimos envían correo por el dominio.",
            "Dar por terminada una migración porque puedes enviar, sin comprobar que también recibes.",
            "Dejar el acceso administrativo del correo bajo una cuenta personal de alguien que ya no trabaja con el negocio.",
          ],
        }],
      },
      {
        heading: "Qué comprobar cuando el correo falla",
        paragraphs: [
          "Un fallo puede venir de la cuenta, del proveedor, de la configuración DNS o del propio mensaje. Empieza por distinguir si el problema afecta al envío, a la recepción o a ambos.",
        ],
        blocks: [{
          type: "steps",
          label: "Diagnóstico inicial sin adivinar",
          items: [
            { title: "Revisa el estado del proveedor", detail: "Comprueba si existe una incidencia conocida antes de cambiar DNS." },
            { title: "Lee el mensaje de error", detail: "Un rebote puede indicar una causa concreta; conserva el texto técnico para soporte aunque no lo entiendas completo." },
            { title: "Compara MX y TXT", detail: "Verifica que coincidan con la documentación de la cuenta que realmente utilizas." },
            { title: "Evita cambios sucesivos", detail: "Si modificas varios registros sin comprobar entre pasos, será más difícil identificar qué resolvió o causó el problema." },
          ],
        }],
      },
      {
        heading: "Preguntas frecuentes",
        paragraphs: [],
        blocks: [{
          type: "faq",
          items: [
            { question: "¿El hosting de la web incluye correo?", answer: "No necesariamente. Pueden venderse juntos o por separado. Comprueba qué proveedor mantiene los buzones y qué registros necesita." },
            { question: "¿Puedo tener la web con una empresa y el correo con otra?", answer: "Sí. Es una configuración común siempre que el DNS conserve correctamente los registros que necesita cada servicio." },
            { question: "¿Un registro TXT es siempre de correo?", answer: "No. TXT también puede usarse para verificaciones y otros servicios. Identifica su función antes de borrarlo." },
            { question: "¿SPF, DKIM y DMARC evitan todo el spam o la suplantación?", answer: "No. Ayudan a autenticar el uso del dominio y a aplicar políticas, pero no sustituyen otros controles de seguridad ni garantizan que todo mensaje legítimo sea seguro." },
          ],
        }],
      },
      {
        heading: "Qué puedes hacer ahora",
        paragraphs: [],
        blocks: [{
          type: "summary",
          items: [
            "Identifica quién mantiene tus buzones y guarda una copia de sus registros DNS.",
            "Distingue MX, TXT, SPF, DKIM y DMARC por su función, no por memorizar valores.",
            "Después de cualquier cambio, comprueba envío y recepción antes de borrar la configuración anterior.",
          ],
        }],
      },
      {
        heading: "Fuentes y alcance",
        paragraphs: [
          "Esta guía explica conceptos y una forma prudente de trabajar. No proporciona valores de DNS para un proveedor concreto. Las configuraciones exactas deben obtenerse de la documentación vigente del servicio que uses.",
        ],
        blocks: [{
          type: "sources",
          items: [
            { label: "RFC 1035 — Domain Names: Implementation and Specification", url: "https://datatracker.ietf.org/doc/html/rfc1035", scope: "Especifica registros DNS, incluidos MX y TXT. Es una referencia técnica del protocolo, no una guía de configuración para un proveedor." },
            { label: "RFC 7208 — Sender Policy Framework (SPF)", url: "https://datatracker.ietf.org/doc/html/rfc7208", scope: "Define SPF y su publicación mediante DNS para autorizar sistemas que usan determinadas identidades del dominio." },
            { label: "RFC 6376 — DomainKeys Identified Mail (DKIM) Signatures", url: "https://datatracker.ietf.org/doc/html/rfc6376", scope: "Define DKIM y el uso de firmas verificables mediante información publicada en el dominio." },
            { label: "RFC 9989 — Domain-Based Message Authentication, Reporting, and Conformance (DMARC)", url: "https://datatracker.ietf.org/doc/html/rfc9989", scope: "Especificación Standards Track publicada en mayo de 2026; obsoleta RFC 7489 y describe el protocolo DMARC vigente." },
          ],
        }],
      },
    ],
  },
];
