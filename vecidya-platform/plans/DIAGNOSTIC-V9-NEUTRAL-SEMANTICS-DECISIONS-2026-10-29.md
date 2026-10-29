# V9 — Decisiones propuestas sobre neutralidad: menú y carrito

**PLAN_ONLY · v1.0.0 · 2026-10-29**

## 1. `q2_food_menu_visibility` — HOLD semántico focal

Fuente: `qa03b/specialty-branches-wave1.ts`, blob `ec605156f2e974d7b463f44ae76475f8ede1f0e9`.

- Pregunta: «Cuando alguien encuentra tu negocio en internet, ¿puede ver un menú o una selección actual de lo que ofreces?».
- Respuestas: `clear→established`, `partial→partial`, `unclear→weak`, `not_applicable→not_applicable`, `unknown→uncertainty`; dimensión `clarity_positioning`, evidencia directa.
- Problema localizado: `not_applicable` se muestra como «Todavía no muestro la oferta en ese lugar». Puede significar ausencia real de oferta publicada, no una situación donde la pregunta carece de aplicación. La exclusión neutral podría ocultar falta de claridad observable. No debe corregirse convirtiendo toda ausencia de web en debilidad.
- **Decisión propuesta: HOLD para cambiar `value/kind/evidence`**, hasta diferenciar: (a) oferta no publicada en canal evaluable, (b) canal inexistente, (c) oferta no aplicable por modelo de negocio, (d) desconocimiento. La pregunta actual exige elegibilidad de especialista gastronómico y presencia digital; C08 sin presencia puede no recibirla.
- **Criterio de salida:** definir lectura justa para C08, documentar si cambia versión y migración de respuestas, validar con negocio con y sin menú publicado. No alterar scoring ahora.

## 2. `q2_ecommerce_cart_followup` — KEEP condicional v2

Fuente: `qa03b/recovery-wave2.ts`, blob `59fe5898cc98ba243b4c898b027dd22f2c1153c9`.

- Pregunta: «Cuando alguien abandona una compra y tienes permiso para contactarlo, ¿sueles enviarle un recordatorio?».
- Respuestas: `always→established`, `sometimes→partial`, `rarely→weak`, `no_authorized_contact→not_applicable`, `unknown→uncertainty`; dimensión `relationship_recurrence`, evidencia directa.
- `no_authorized_contact` significa no poder identificar o contactar con permiso; **no es incumplimiento**. La versión 2 ya añade esta respuesta y `unknown`, y requiere ecommerce con visibilidad del carrito afirmativa.
- **Decisión propuesta: KEEP del contrato semántico y neutral v2**, pendiente de revisión cognitiva de `always/sometimes/rarely`. Nunca promover contactos sin consentimiento ni convertir `no_authorized_contact` en `weak`. No remapear sesiones v1 a v2 sin decisión explícita de migración.
- **Criterio de salida:** confirmar que las respuestas solo consideran carritos con contacto permitido y que la ruta sin permiso no genera recomendaciones de seguimiento invasivas.

## Orden de ejecución tras autorización

1. Resolver primero la interpretación de C08 y `not_applicable` gastronómico.
2. Confirmar neutralidad de carrito y compatibilidad de sesiones v1/v2.
3. Registrar aprobación humana y casos de recorrido; ejecutar solo pruebas focalizadas cuando se autorice implementación.

**Alcance:** propuestas documentales basadas en código fuente, no decisiones aprobadas ni pruebas ejecutadas. No se modifica código, scorer, banco, CI o producción.
