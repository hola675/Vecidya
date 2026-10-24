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
