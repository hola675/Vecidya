# V9 — Trazas estáticas focales C03 y C05

**PLAN_ONLY · v1.0.0 · 2026-10-29**

## C03: actividad pausada

En `qa03b/bank.ts` (blob `b4772d73e1d8b5044ba2011088db978c364097f0`), `q2_measurement_practice` requiere `q2_operational_status=operating`. Su respuesta neutral `not_enough_activity` evita castigar la falta de actividad reciente, pero no vuelve elegible la pregunta para un negocio pausado.

El mismo archivo agrega a las preguntas de interacción histórica (entre ellas `q2_demand_trend` y `q2_capacity_signal`) las condiciones `operating` y `q2_has_customers=yes`. En consecuencia, no se deben utilizar esas preguntas como evidencia de actividad actual para C03.

**Hallazgo:** este subconjunto no observa si la actividad pausada mantiene información pública actualizada para consultas o futura reapertura. No se afirma que todo C03 carezca de evidencia: hay que inspeccionar el recorrido completo.

**Propuesta:** HOLD de certificación C03. Evaluar una observación opcional sobre información de pausa y contacto, con respuestas neutrales para actividades que no necesitan presencia pública; añadir pregunta solo si las demás rutas no aportan evidencia suficiente.

## C05: organización sin donaciones ni cuotas

En `qa03b/specialty-candidate-bank.ts` (blob `0bc44cddc1dc2f03230bd5ece30847fce984a12b`), `q2_nonprofit_support_type` clasifica el tipo de apoyo; su migración de evidencia está `pending`, por lo que no debe utilizarse como medida de madurez.

`q2_nonprofit_donation_clarity` solo es elegible si el apoyo es `donations` o `mixed`, además de operar y pertenecer al contexto nonprofit. En `qa03b/recovery-wave2.ts` (blob `59fe5898cc98ba243b4c898b027dd22f2c1153c9`), `q2_nonprofit_membership_lifecycle` exige `membership_dues` o `mixed`.

**Recorrido lógico:** si una organización no utiliza donaciones, cuotas ni modalidad mixta, ambas preguntas especializadas dejan de ser elegibles. Esto es correcto; no deben forzarse como carencias.

**Hallazgo:** estas dos rutas no observan la facilidad de participar en actividades o solicitar información cuando el modelo no es donación ni membresía. No implica ausencia total de evidencia `conversion_access` en otras preguntas.

**Propuesta:** HOLD de certificación C05 hasta trazar las demás rutas. Solo si hay insuficiencia, considerar pregunta de participación/contacto no comercial, sin presumir ventas, donaciones o membresías.

## Puerta común de cierre

1. Inspeccionar elegibilidad completa por escenario y evidencia real de las ocho dimensiones.
2. Distinguir `no aplica`, desconocimiento y ausencia observable de capacidad.
3. Añadir preguntas nuevas únicamente por brecha demostrada, conservando límite de entrevista 24+5.
4. Cuando se autorice implementación, usar recorridos y pruebas focalizados, no batería global.

**No ejecutado:** pruebas, scripts, CI, cambios de código, activación o despliegue. Inferencias marcadas como tales; no hay aprobación editorial.