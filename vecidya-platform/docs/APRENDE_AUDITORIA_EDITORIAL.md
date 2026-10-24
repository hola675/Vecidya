# Auditoría editorial de Aprende — seguimiento verificable

Fecha: 2026-10-24. Rama: `feat/aprende-auditoria-editorial-20261024`. PR: #76.

## Alcance y estado real

- Catálogo esperado tras seis separaciones: **44 artículos** (38 de origen y 6 nuevos).
- Se detectó y corrigió un error de JSX: el bloque de autoevaluación contenía caracteres `\\n` literales en `app/routes/learn-article.tsx`.
- **6 artículos están marcados explícitamente `editorialDraft: true`**, todos en `learn.ts` y correspondientes a las seis guías especializadas. Los otros 38 artículos no llevan esa marca; eso no equivale a una certificación editorial individual.
- Las seis guías especializadas conservan referencias y enlaces internos comprobados por pruebas automáticas. Sigue pendiente la revisión humana de exactitud, actualidad y pertinencia de las fuentes, así como la comprobación HTTP de enlaces externos.
- CI del commit `1f1ed2b`: **typecheck, build y pruebas de Aprende PASS** (incluida regresión de 18 temas en seis guías). Pendientes: revisión editorial humana, correspondencia de fuentes, comprobación HTTP de enlaces externos, accesibilidad y recorridos móviles.

## Criterios de aceptación por artículo

1. Un tema principal y un objetivo de aprendizaje comprensible; si aborda otra tarea autónoma, separarla y enlazar ambas guías.
2. Introducción, ejemplo hipotético claramente identificado, pasos aplicables y cierre sin promesas no verificadas.
3. Referencias pertinentes para las afirmaciones técnicas; distinguir políticas de proveedores, recomendaciones y obligaciones legales.
4. Revisar precisión, actualidad, lenguaje, accesibilidad, privacidad y repeticiones.
5. Comprobar enlaces relacionados y navegación; solo después retirar `editorialDraft` de ese artículo.

## Advertencia sobre las separaciones realizadas

Mover secciones a otra guía no equivale a una revisión editorial. Hay que comprobar que ejemplos, preguntas frecuentes, resúmenes y fuentes siguen correspondiendo al nuevo alcance; no copiar fuentes irrelevantes por defecto.

## Verificación antes de fusionar

Ejecutar desde `vecidya-platform` los scripts reales definidos en `package.json`, incluyendo typecheck, build y pruebas pertinentes. No fusionar ni desplegar mientras el PR permanezca en borrador.

## Revisión de pertinencia de fuentes por guía especializada (2026-10-24)

Inventario estático: las seis guías tienen bloque de fuentes, pero la presencia de una URL no confirma que el contenido esté actualizado, que la página responda ni que respalde todas las afirmaciones. Estado editorial: **pendiente de aprobación**.

| Guía | Fuentes registradas | Observación de revisión |
| --- | ---: | --- |
| Prueba de asistente de IA | 3 | NIST AI RMF, perfil de IA generativa e ICO: enfoque pertinente para riesgos y privacidad; comprobar alcance normativo por jurisdicción. |
| Primera campaña publicitaria | 8 | Google, Meta, W3C y Analytics: pertinentes para publicidad, destino y medición; distinguir políticas de plataforma y recomendaciones. |
| Presencia digital confiable | 8 | Reutiliza íntegramente las ocho fuentes de publicidad. **Revisar y reducir** las referencias a políticas de anuncios y medición que no sustentan directamente mantenimiento, reputación y coherencia de canales. |
| Supervisión de automatizaciones | 3 | NIST e ICO: pertinencia general; la fuente sobre marketing electrónico solo aplica cuando el flujo envía comunicaciones. |
| Elegir o cambiar proveedor | 8 | ICANN, RFC y MDN: mezcla documentación de registro con referencias técnicas; priorizar ICANN y comprobar que RFC/TLS apoyen afirmaciones concretas. |
| DNS, HTTPS y correo | 8 | Reutiliza íntegramente las ocho fuentes de proveedor. **Revisar y reducir** las referencias a tarifas, renovación y transferencias; comprobar cobertura específica de correo (MX/SPF/DKIM/DMARC) si se explican. |

### Hallazgos y acciones editoriales

1. **E1 — Duplicación de bibliografía:** dos pares de guías tienen exactamente las mismas listas de fuentes pese a tener objetivos distintos (publicidad/presencia; proveedor/DNS). Separar por pertinencia, conservando solo referencias que respaldan el texto de cada guía.
2. **E2 — Cobertura de correo:** revisar si la guía DNS/correo explica registros de autenticación; cuando los mencione, aportar fuentes oficiales pertinentes y distinguir configuración del dominio, servicio de correo y políticas de entrega.
3. **E3 — Verificación externa:** comprobar accesibilidad HTTP, redirecciones, fechas y cambios de políticas. **No ejecutada** en esta revisión; no afirmar que los enlaces están vivos.
4. **E4 — Aprobación (resuelta por decisión del responsable):** las seis marcas cambiaron a `editorialDraft: false` tras aprobación explícita. La verificación HTTP, la lectura móvil y la certificación técnica continúan pendientes y no quedan automáticamente aprobadas.

## Ajuste de fuentes aplicado (2026-10-24)

- Presencia digital confiable: bibliografía reducida de ocho a tres fuentes (Google Search Central, Google Business Profile y W3C WAI). Retiradas las fuentes de anuncios y Analytics no centrales al objetivo.
- DNS, HTTPS y correo: bibliografía reducida de ocho a cuatro fuentes (RFC 1034, RFC 1035, RFC 3596 y MDN TLS). Retiradas las referencias de ICANN sobre contratación y renovación, que pertenecen a la guía de proveedores.
- Se corrigió el párrafo «Fuentes y alcance» de DNS, que todavía describía fuentes ICANN ya eliminadas. Se delimita expresamente que el artículo **no** enseña a configurar SPF, DKIM ni DMARC.
- Queda pendiente verificar por HTTP las fuentes y evaluar su suficiencia artículo por artículo. Esta limpieza **no** constituye aprobación editorial ni validación de enlaces.

## Decisión editorial del responsable (2026-10-24)

El responsable del proyecto aprobó expresamente los contenidos de las seis guías especializadas. Se actualizó `editorialDraft: false` en cada una de ellas en el commit `7bebe41`. El catálogo queda sin marcas explícitas de borrador editorial.

**Alcance de la aprobación:** contenido educativo de las seis guías. **No** certifica accesibilidad, exactitud HTTP de todas las fuentes externas, SEO, revisión visual móvil, ni autoriza fusión o despliegue. Estas tareas permanecen en el checklist técnico y de publicación de APRENDE-QA-04.

### Siguiente checkpoint: APRENDE-QA-04

1. Validar en CI la aprobación editorial y que las guías aprobadas sean accesibles en catálogo y rutas de artículo.
2. Verificar enlaces externos (respuesta, redirección y destino real) y actualizar los que hayan cambiado.
3. Ejecutar revisión visual en escritorio y móvil, navegación por teclado y accesibilidad.
4. Completar SEO, metadatos de lectura y controles de calidad editorial.
5. Reconciliar PR con `main`, solicitar revisión y preparar publicación solo tras autorización explícita.

## Inventario de enlaces externos de las seis guías (2026-10-24)

Se identificaron **29 referencias bibliográficas** (algunas repetidas entre artículos). Este inventario es estático, extraído del contenido del repositorio; **no demuestra respuesta HTTP 200 ni vigencia de las políticas**.

| Guía especializada | Referencias |
| --- | ---: |
| Primera campaña de publicidad | 8 |
| Proveedor de dominio y hosting | 8 |
| Supervisión de automatizaciones | 3 |
| Asistente de IA supervisado | 3 |
| Presencia digital confiable | 3 |
| DNS, HTTPS y correo | 4 |

La cantidad de URL únicas deberá calcularse mediante el verificador automatizado, sin suponer que todos los destinos son accesibles.

### Protocolo de verificación HTTP pendiente

1. Extraer de `learn.ts` todas las URL de bloques `sources`, deduplicar y asociar cada URL a sus guías.
2. Ejecutar comprobaciones HTTPS con timeout, redirecciones limitadas y agente identificable; registrar URL original, URL final, código y fecha. Ante HEAD rechazado, intentar GET con límite de descarga.
3. Clasificar `2xx` como accesible técnicamente, `3xx` como redirección a revisar y `4xx/5xx`, timeout o bloqueo como incidencias que necesitan revisión humana. No confundir bloqueo anti-bot con enlace roto.
4. Comprobar manualmente que el documento de destino respalda el contenido citado y que su política o estándar continúa vigente.
5. Corregir únicamente referencias verificadas como erróneas y conservar evidencia fechada antes de cerrar E3.

## Avance de implementación técnica (2026-10-24)

- Se incorporó `scripts/audit-learn-links.mjs` para los cuatro módulos de contenidos, con comprobaciones concurrentes limitadas, timeout, registro de redirecciones y salida JSON. El workflow manual `.github/workflows/aprende-links-audit.yml` conserva el reporte como artefacto. **No confundir el éxito del workflow de calidad con la ejecución de este workflow manual**.
- Se añadió tiempo de lectura aproximado por artículo, calculado a partir de su texto (referencia de 200 palabras/minuto), y enlace de retorno al inicio del contenido. La estimación no constituye una medición de comportamiento real.
- Las pruebas de compilación y tipos deben comprobarse sobre el SHA final, no sobre ejecuciones anteriores.

### Puertas de salida para publicación

- [ ] Descargar y revisar el JSON de la auditoría HTTP ejecutada; resolver enlaces realmente rotos y documentar bloqueos anti-bot.
- [ ] Probar navegación completa en escritorio y móvil: búsqueda, filtros, itinerarios, índice, FAQ, CTA y enlaces relacionados.
- [ ] Revisar teclado, foco visible, contraste, ampliación 200 %, imágenes y lectores de pantalla.
- [ ] Verificar canonical, robots, Open Graph, enlaces internos y el renderizado de todas las rutas.
- [ ] Ejecutar pruebas, typecheck y build sobre el SHA definitivo y reconciliar la rama con `main`.
- [ ] Obtener aprobación visual final y autorización explícita antes de fusionar o desplegar.
