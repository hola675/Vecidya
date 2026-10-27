# P1 lote 01 — clasificación y cobertura de preguntas

Estado: revisión técnica inicial, no aprobación editorial humana.

## Hallazgos

- HUECO-V9-001: `q2_food_menu_visibility` etiqueta `not_applicable` como «Todavía no muestro la oferta en ese lugar». La respuesta puede describir falta de publicación, no verdadera no aplicabilidad. Existe propuesta `not_published` con evidencia `weak`, aún no aprobada ni activada.
- HUECO-V9-002: `q2_presence_offer_clarity` se excluía para nichos gastronómicos y agencias aun cuando las preguntas especializadas tenían restricciones adicionales. Se corrigió la exclusión para que dependa de la misma elegibilidad que la pregunta especializada. Se añadió prueba focalizada con variantes de etapa, objetivo, compradores, clientes y presencia.

## Preguntas de clasificación para revisar una por una

| Pregunta | Qué comprobar | Estado |
|---|---|---|
| `q2_entity` | Opciones de negocio, emprendimiento y organización | Pendiente editorial |
| `q2_operational_status` | Operando, preparando, en pausa y posibles huecos | Pendiente editorial |
| `q2_has_customers` | Uso real, clientes y beneficiarios | Pendiente editorial |
| `q2_sector` | Solapamiento de sectores y cobertura | Pendiente editorial |
| `q2_goal` | Que la prioridad no suprima evidencia importante | Pendiente editorial |
| `q2_niche_food_hospitality` | Restaurante, cafetería, food truck, otros y desconocidos | Pendiente editorial |

## Próximas comprobaciones

1. Inspeccionar todas las opciones, `kind`, evidencia y variantes de las seis preguntas.
2. Ejecutar CI focalizada de `qa03b-specialty-branches-wave1.test.ts` y comprobar el resultado antes de afirmar PASS.
3. Decidir el contrato semántico de `q2_food_menu_visibility` sin cambiar la puntuación por intuición.
4. Seguir con la matriz completa de 77 preguntas y 387 respuestas.

No se ha alterado V8 ni desplegado el candidato.

## Seguimiento P1 — evaluación de la propuesta gastronómica

El candidato de 77 preguntas conserva por ahora `q2_food_menu_visibility` v1. La propuesta v2 introduce `not_published` y lectura `weak`, manteniendo `unknown` como `uncertainty`. Es una mejora semántica plausible porque no publicar la oferta no equivale a «no aplica». No se integra sin comprobar todos los escenarios de restaurantes, cafeterías y food trucks. Se retiró de la documentación del prototipo la exigencia obsoleta de migración histórica: el motor V9 nuevo no dependerá de sesiones V8.

La cobertura genérica/especializada fue corregida en `specialty-branches-wave1.ts` y se agregó una prueba de regresión focalizada. El resultado de CI sigue sin verificación; no se declara PASS.

## Lote 01 — control de clasificación (continuación)

Se añadieron pruebas focalizadas para `q2_entity`, `q2_operational_status` y `q2_has_customers`. Se verifica la lista explícita de opciones, el valor neutral `unknown`, etiquetas no vacías, unicidad de valores y la diferencia textual entre actividad en pausa e historial de clientes. Estas pruebas comprueban invariantes del banco candidato, no certifican comprensión humana ni cobertura de todos los recorridos.

**Observación editorial:** `q2_has_customers` considera usuarios y beneficiarios reales, además de compradores. Mantener esta amplitud es importante para proyectos comunitarios y actividades gratuitas; no debe reinterpretarse `yes` como prueba de ventas. `q2_operational_status` admite `preparing`, `operating` y `paused` por separado. `q2_entity` diferencia `individual`, `business`, `organization` y `project`, sin inferir formalización legal.

**Pendiente:** validar con casos narrativos la transición preparación → operación → pausa y la distinción entre usuario/beneficiario y comprador; revisar sectores y prioridades. Sin resultado CI confirmado.
