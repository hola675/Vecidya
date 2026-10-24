# Auditoría editorial de Aprende — seguimiento verificable

Fecha: 2026-10-24. Rama: `feat/aprende-auditoria-editorial-20261024`. PR: #76.

## Alcance y estado real

- Catálogo esperado tras seis separaciones: **44 artículos** (38 de origen y 6 nuevos).
- Se detectó y corrigió un error de JSX: el bloque de autoevaluación contenía caracteres `\\n` literales en `app/routes/learn-article.tsx`.
- **27 artículos siguen marcados `editorialDraft: true`** en los cuatro módulos originales: 13 en `learn.ts`, 4 en `learn-business-operations.ts`, 5 en `learn-operations-02.ts` y 5 en `learn-management-03.ts`. Las afirmaciones anteriores de que se habían retirado esas 27 marcas fueron incorrectas. No se deben quitar sin revisión individual.
- Las seis guías nuevas están también marcadas como borradores. No hay certificación editorial ni comprobación de enlaces.
- Pendientes: ejecutar compilación, typecheck, pruebas, revisar duplicaciones y correspondencia de fuentes, y comprobar referencias cruzadas y recorridos de lectura.

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
