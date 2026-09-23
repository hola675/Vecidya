# Catálogo de productos Vecidya

> **UX-002.1 — Product Catalog Foundation**
> Estado: **propuesta comercial documentada / no implementada**
> Versión de referencia: `0.3.0`
> Última actualización: 2026-09-23

Este documento define la matriz comercial base de Vecidya antes de construir páginas públicas, precios publicados, checkout o componentes de catálogo.

La matriz separa cuatro conceptos que no deben mezclarse:

| Tipo | Definición |
| --- | --- |
| **Licencia** | Sistema continuo con una capacidad y un nivel de evolución definidos. |
| **Addon** | Capacidad adicional que se suma a una licencia. |
| **Servicio** | Trabajo personalizado de Vecidya con alcance y resultado acordados. |
| **Consumo** | Coste variable de un proveedor o canal externo, asociado al uso. |

## Límites de esta matriz

- Este catálogo es una **fuente comercial de diseño**, no una descripción de funcionalidades activas en la plataforma actual.
- Los precios indicados son referencias de trabajo proporcionadas para esta fase; no están publicados, facturados ni conectados a un checkout.
- No crea rutas, componentes, tablas, migraciones, APIs, CRM propio ni integraciones externas.
- Vecidya no duplica el CRM de HighLevel. Contactos, oportunidades, pipelines, conversaciones, automatizaciones y seguimiento pertenecen al system of record externo definido para cada operación.
- La activación de cualquier producto futuro exige alcance, autorización, datos reales, revisión legal y validación técnica separados.

## Licencias Vecidya

| Licencia | Precio de referencia | Objetivo | Cliente ideal | Evolución |
| --- | ---: | --- | --- | --- |
| **Cuadra** | `$39` | Ordenar el negocio | Negocio que necesita una base organizada para empezar | Punto de partida: organizarse. |
| **Barrio** | `$59` | Captar oportunidades y hacer seguimiento | Negocio que ya necesita convertir consultas en procesos de seguimiento | Evolución desde Cuadra cuando aparece una necesidad real de captación y seguimiento. |
| **Ciudad** | `$89` | Automatizar y escalar | Negocio con volumen, procesos repetibles y necesidad de control operativo | Evolución desde Barrio cuando aparece una necesidad real de automatización y escala. |

> **Moneda:** no definida en esta fase. Los importes se conservan como referencia comercial tal como fueron entregados y requieren confirmación antes de cualquier publicación.

### Cuadra

**Objetivo:** ordenar el negocio.

Base de capacidades prevista:

- cuenta Vecidya;
- perfil público;
- información del negocio;
- CRM básico, cuando el sistema externo esté habilitado;
- contactos;
- notas;
- tareas;
- oportunidades;
- pipeline;
- calendario;
- Social Planner;
- usuarios según política comercial y operativa.

Estas capacidades describen el paquete comercial futuro. No significan que Vecidya las implemente hoy dentro de su propia base de datos.

### Barrio

**Objetivo:** captar oportunidades y hacer seguimiento.

Incluye todo Cuadra más:

- formularios;
- landing;
- agenda;
- automatizaciones estándar;
- seguimiento;
- posventa;
- reportes básicos.

### Ciudad

**Objetivo:** automatizar y escalar.

Incluye todo Barrio más:

- más pipelines;
- más automatizaciones;
- segmentación;
- reactivación;
- procesos avanzados;
- reportes operativos.

## Evolución del cliente

La evolución se activa por necesidad real, no por presión comercial:

```text
CUADRA
Necesito organizarme.
        ↓
BARRIO
Necesito captar y seguir oportunidades.
        ↓
CIUDAD
Necesito automatizar y controlar.
```

Reglas:

1. No se sube a un cliente de licencia para aumentar la venta.
2. Se propone una evolución solo cuando aparece una necesidad que la licencia actual no resuelve con claridad.
3. La recomendación debe explicar el problema, la capacidad adicional y el resultado esperado.
4. Un addon o servicio puntual no obliga por sí mismo a cambiar de licencia.
5. La licencia, los addons, los servicios y los consumos deben aparecer separados en cualquier propuesta futura.

## Addons Vecidya

Un addon agrega capacidad a una licencia existente. El addon no absorbe los costes variables de los canales o proveedores que utiliza.

| Addon | Problema que resuelve | Licencia mínima | Coste |
| --- | --- | --- | --- |
| WhatsApp | Centralizar conversaciones de WhatsApp en el flujo de trabajo | Por definir | Precio de addon por definir + consumo externo separado |
| SMS | Enviar avisos y seguimientos por mensajes de texto | Por definir | Precio de addon por definir + consumo externo separado |
| Telefonía | Gestionar llamadas y números desde el sistema operativo | Por definir | Precio de addon por definir + números/minutos separados |
| IA conversacional | Responder o clasificar conversaciones con asistencia de IA | Por definir | Precio de addon por definir + consumo de IA separado |
| AI Voice | Atender o asistir llamadas mediante voz de IA | Por definir | Precio de addon por definir + minutos de IA separados |
| Automatizaciones | Resolver reglas y tareas avanzadas que exceden la automatización estándar | Por definir | Precio de addon por definir |
| Campañas y seguimiento | Extender la ejecución y medición de campañas | Por definir | Precio de addon por definir + medios o mensajes separados |
| Medición de marketing | Ordenar atribución y señales de rendimiento | Por definir | Precio de addon por definir |
| Integraciones externas | Conectar un sistema tercero con el flujo acordado | Por definir | Precio de addon por definir + coste del proveedor/API separado |

### Categorías iniciales

- **Comunicación:** WhatsApp, SMS y telefonía.
- **IA:** IA conversacional, AI Voice y Automatizaciones.
- **Marketing:** campañas, seguimiento y medición.
- **Integraciones:** conexiones externas, APIs y sistemas terceros.

> **Vocabulario público canónico (DIAG-002C):** «WhatsApp», «SMS», «Telefonía», «Automatizaciones», «IA conversacional», «AI Voice» e «Integraciones» son los únicos nombres públicos vigentes de los addons, iguales en `/addons`, en el Diagnóstico y en esta matriz; los identificadores internos (`ai-conversacional`, `automatizaciones`) no cambian y `catalog.test.ts` verifica la coincidencia. Los nombres anteriores solo sobreviven en entradas históricas del CHANGELOG.

## Servicios Vecidya

Un servicio es trabajo personalizado. Se contrata por alcance, resultado y condiciones acordadas; no es una capacidad automática incluida en una licencia.

| Servicio | Resultado | Tipo | Precio |
| --- | --- | --- | --- |
| Páginas web | Sitio web publicado con alcance definido | Desarrollo | Por propuesta |
| Landing pages | Página enfocada en una campaña, oferta o captación | Desarrollo | Por propuesta |
| Ecommerce | Experiencia de comercio electrónico con alcance definido | Desarrollo | Por propuesta |
| Identidad de marca | Base visual y verbal coherente para la marca | Marca | Por propuesta |
| Diseño | Piezas y sistema visual para una necesidad concreta | Marca | Por propuesta |
| Contenido | Material editorial o comercial con brief y alcance | Marca | Por propuesta |
| CRM | Configuración y ordenamiento del CRM externo | Automatización | Por propuesta |
| Workflows | Diseño y configuración de flujos automatizados | Automatización | Por propuesta |
| Integraciones | Conexión y validación de sistemas terceros | Automatización | Por propuesta |
| Agentes de IA | Diseño y configuración de agentes para un caso definido | IA | Por propuesta |
| Voz | Diseño de una experiencia de voz asistida | IA | Por propuesta |
| Asistentes | Asistente para una tarea o canal específico | IA | Por propuesta |
| Google Ads | Configuración y gestión de campañas de Google | Marketing | Por propuesta + inversión publicitaria separada |
| Meta Ads | Configuración y gestión de campañas de Meta | Marketing | Por propuesta + inversión publicitaria separada |
| SEO | Trabajo de posicionamiento orgánico con alcance definido | Marketing | Por propuesta |
| GEO/AEO | Preparación de presencia para búsqueda generativa y respuestas | Marketing | Por propuesta |
| Diagnóstico profesional | Análisis profundo con plan y propuesta | Consultoría | Por propuesta |
| Estrategia | Definición de prioridades, canales y próximos pasos | Consultoría | Por propuesta |
| Capacitación | Transferencia de conocimiento sobre herramientas y procesos | Consultoría | Por propuesta |

### Categorías iniciales

- **Desarrollo:** páginas web, landing y ecommerce.
- **Marca:** identidad, diseño y contenido.
- **Automatización:** CRM, workflows e integraciones.
- **IA:** agentes, voz y asistentes.
- **Marketing:** Google Ads, Meta Ads, SEO y GEO/AEO.
- **Consultoría:** diagnóstico, estrategia y capacitación.

## Consumos externos

Los consumos son costes variables de proveedores, canales o infraestructura externa. Nunca deben esconderse dentro de una licencia.

Ejemplos:

- WhatsApp;
- SMS;
- llamadas;
- números telefónicos;
- email;
- uso de IA;
- publicidad.

Reglas:

1. El cliente debe poder distinguir el precio de Vecidya del coste del proveedor externo.
2. El consumo se informa según unidad aplicable: mensaje, minuto, número, email, token, ejecución o inversión publicitaria.
3. Un addon puede habilitar un canal, pero no convierte su consumo variable en ilimitado.
4. Los proveedores, unidades, tarifas y condiciones deben verificarse antes de incorporarse a una propuesta o página pública.
5. No se publica una tarifa externa no confirmada como si fuera un precio Vecidya.

## Diagnóstico Vecidya

### Diagnóstico inicial

**Precio:** gratis.

**Objetivo:** entender la situación actual.

**Salida:**

- estado;
- oportunidades;
- recomendación inicial.

El diagnóstico inicial actual es anónimo, efímero y solo cliente. No crea una cuenta, no persiste respuestas y no constituye una propuesta comercial automática.

Desde DIAG-002 (`0.4.0`, local) el diagnóstico inicial entrega estado, cómo se llegó a él, confianza, dimensiones, fortalezas, brechas, hasta tres prioridades explicadas, siguientes pasos y encaje Vecidya. El encaje de licencia se deriva de la capacidad necesaria (ordenar → captar y seguir → automatizar y controlar), nunca del tamaño del equipo ni de un umbral global de puntuación, y puede concluir «ninguna todavía»; Ciudad solo se propone con captura y seguimiento ya definidos. Servicios, addons y artículos recomendados son referencias reales de `/servicios`, `/addons` y Aprende, verificadas por prueba.

### Diagnóstico profesional

**Tipo:** servicio de consultoría.

**Objetivo:** realizar un análisis profundo.

**Salida:**

- análisis;
- plan;
- propuesta.

El diagnóstico profesional requiere alcance, condiciones y tratamiento de información definidos antes de implementarse o venderse.

## Contenido educativo

La sección educativa se denomina **Aprende**. Su función es ayudar a entender problemas y tomar mejores decisiones; no sustituye una propuesta ni presenta contenido ficticio.

**Autor principal editorial previsto:** Yoan Ortiz.

Categorías iniciales:

- Tecnología simple.
- CRM y organización.
- Automatización.
- Inteligencia Artificial.
- Presencia digital.

Cada artículo futuro debe incluir:

1. título;
2. imagen con derechos y origen confirmados;
3. problema;
4. explicación sencilla;
5. ejemplo;
6. conclusión;
7. siguiente paso.

Existen cuatro artículos iniciales atribuidos a Yoan Ortiz (UX-002.6, publicados en `0.3.0`; ver `app/content/learn.ts`), que el diagnóstico enlaza desde sus prioridades. La autoría y las categorías siguen siendo una definición editorial de trabajo.

## Mapa comercial

### Usuario nuevo

```text
Usuario nuevo
    ↓
Aprende
    ↓
Diagnóstico
    ↓
Licencia / Servicio
    ↓
Addon
```

### Usuario con necesidad clara

```text
Necesidad clara
    ↓
Servicio
    ↓
Licencia
    ↓
Addons
```

Los consumos externos se muestran junto al elemento que los habilita, pero siempre en una línea separada.

## Infraestructura HighLevel

HighLevel será la infraestructura externa considerada para la operación comercial futura, sujeto a contratación, credenciales, alcance y validación independientes. El detalle operativo de OPS-001 está en [OPS-001-GHL-PILOT-FOUNDATION.md](../OPS-001-GHL-PILOT-FOUNDATION.md).

Capacidades previstas en esa frontera:

- CRM;
- contactos;
- oportunidades;
- pipelines;
- formularios;
- calendarios;
- landings;
- automatizaciones;
- conversaciones.

**Referencias oficiales consultadas el 2026-09-23:** Starter `USD 97/mes`, 3 subcuentas; Unlimited `USD 297/mes`, subcuentas ilimitadas y API básica; Agency Pro `USD 497/mes`, SaaS Mode, alta automática y API avanzada. Estas son referencias públicas, no el plan contratado por Vecidya.

AI y comunicaciones permanecen fuera de la licencia base: AI Employee Growth `USD 50/location/mes`, Unlimited `USD 97/location/mes`, WhatsApp `USD 10/location/mes`, más consumos variables de mensajes, email, telefonía, carrier fees, minutos, tokens y modelos según corresponda.

El plan contratado, ciclo de facturación, límites, Labs y capacidades habilitadas de la cuenta Vecidya están **NOT VERIFIED**. Deben confirmarse dentro de Agency View antes de contratar, publicarlo o trasladarlo a una propuesta.

HighLevel no está integrado actualmente con Vecidya. La plataforma actual solo documenta la frontera: no realiza llamadas a HighLevel, no guarda un CRM paralelo y no debe presentar estas capacidades como implementadas.

## Criterio de aprobación de UX-002.1

La fase queda documentada cuando se puede responder sin ambigüedad:

- qué es una licencia;
- qué es un addon;
- qué es un servicio;
- qué es un consumo externo;
- cómo evoluciona un cliente y por qué;
- qué entrega el diagnóstico inicial frente al profesional;
- qué función cumple Aprende;
- cómo se relacionan usuario, diagnóstico, licencia, servicio y addon;
- qué queda dentro de HighLevel y qué no existe todavía en Vecidya.

La aprobación de esta matriz **no autoriza todavía** crear `/licencias`, precios públicos, comparadores, checkout, migraciones, integración GHL ni CRM propio.
