# V9 — Contrato de trazas focales para cierre

PLAN_ONLY · v1.0.0 · 2026-10-29

## Objetivo
Definir una sola evidencia de cierre por escenario, reutilizando el banco candidato V9 y el evaluador existente. No crear un segundo motor ni inferir aprobaciones editoriales.

## Datos mínimos de una traza futura
- Escenario e identificador estable.
- Respuestas de clasificación, actividad, historial, nicho y objetivos.
- Contexto resuelto, incluido estado unresolved.
- Preguntas elegibles, preguntas seleccionadas y motivo de exclusión.
- Resultado de appliesWhen y materialAppliesWhen mediante evaluateRuleV2Trace.
- Sustitución especializada o genérica, cuando proceda.
- Evidencia por dimensión, respuestas neutrales y abstenciones.
- Presupuesto de preguntas, incluyendo consentimiento si supera 24.

## Casos prioritarios
C03: actividad pausada; comprobar que no se exigen mediciones de actividad actual y que la pausa no se convierte en debilidad digital.
C05: organización operativa sin donaciones ni cuotas; verificar exclusión de preguntas de donación y membresía, y cobertura alternativa de participación.
C08: restaurante operativo sin presencia digital fiable; comprobar que las preguntas de claridad condicionadas a presencia no generan un falso negativo.
C07: comercio electrónico con carrito visible y sin contacto autorizado; la respuesta no_authorized_contact de q2_ecommerce_cart_followup es not_applicable, no debilidad.

## Puerta de aceptación
No marcar un escenario como PASS hasta contar con recorrido real, dimensiones justificadas, abstenciones correctas y selección adaptativa dentro del presupuesto. Un grafo de dependencias o un inventario de 77 IDs no bastan.

## Fuentes
app/features/diagnostic/qbv2-rules.ts
app/features/diagnostic/qa03b/bank.ts
app/features/diagnostic/qa03b/specialty-candidate-bank.ts
app/features/diagnostic/qa03b/recovery-wave2.ts
app/features/diagnostic/qa03b/specialty-branches-wave1.ts

No se ejecutaron scripts, tests, CI, cambios de codigo ni despliegues.
