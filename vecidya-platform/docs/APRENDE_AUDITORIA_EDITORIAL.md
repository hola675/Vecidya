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
4. **E4 — Aprobación:** mantener las seis marcas `editorialDraft: true` hasta verificar exactitud, pertinencia, lectura móvil y fuentes individuales.

## Ajuste de fuentes aplicado (2026-10-24)

- Presencia digital confiable: bibliografía reducida de ocho a tres fuentes (Google Search Central, Google Business Profile y W3C WAI). Retiradas las fuentes de anuncios y Analytics no centrales al objetivo.
- DNS, HTTPS y correo: bibliografía reducida de ocho a cuatro fuentes (RFC 1034, RFC 1035, RFC 3596 y MDN TLS). Retiradas las referencias de ICANN sobre contratación y renovación, que pertenecen a la guía de proveedores.
- Se corrigió el párrafo «Fuentes y alcance» de DNS, que todavía describía fuentes ICANN ya eliminadas. Se delimita expresamente que el artículo **no** enseña a configurar SPF, DKIM ni DMARC.
- Queda pendiente verificar por HTTP las fuentes y evaluar su suficiencia artículo por artículo. Esta limpieza **no** constituye aprobación editorial ni validación de enlaces.
