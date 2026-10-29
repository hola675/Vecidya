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


## Matriz de aceptación focal — v1.1.0

La siguiente matriz especifica resultados **esperados para futura comprobación**, no resultados observados. Se mantiene el estado `ND` hasta ejecutar una traza autorizada.

| Caso | Entrada focal | Condición de aceptación | Evidencia exigida | Estado |
|---|---|---|---|---|
| C03 | `q2_operational_status` pausado; historial sí | Excluir preguntas exclusivas de actividad actual; no deducir baja madurez por pausa | Lista de elegibles/excluidas y estado por dimensión | ND |
| C05 | `q2_entity=organization`, operativa, apoyo sin donaciones/cuotas | No activar preguntas de donaciones o membresía por defecto; verificar vía alternativa de participación | Guardias de `q2_nonprofit_donation_clarity` y `q2_nonprofit_membership_lifecycle` y evidencia alternativa | ND |
| C07 | Ecommerce activo, carrito visible, contacto no autorizado | `q2_ecommerce_cart_followup` puede ser elegible, pero `no_authorized_contact` se interpreta `not_applicable` | Regla, opción y evidencia `relationship_recurrence` sin penalización | ND |
| C08 | Restaurante activo, sin presencia digital fiable/parcial | No forzar menú online ni calificar ausencia de canal como claridad débil | Guardias de `q2_food_menu_visibility` y `q2_presence_offer_clarity`; alternativa o abstención | ND |

### Reglas de decisión

- **PASS:** traza real demuestra elegibilidad, selección, mapeo y suficiencia o abstención honesta, dentro del presupuesto.
- **FAIL:** la traza muestra pregunta improcedente, penalización de neutral, mapeo incorrecto o violación del presupuesto.
- **ND:** falta recorrido ejecutado, o hay incertidumbre de alcance; una lectura estática no basta.
- **HOLD editorial:** decisión humana pendiente sobre redacción, semántica o pregunta adicional. Puede coexistir con ND técnico.

### Orden de cierre sin duplicaciones

1. Resolver decisiones editoriales específicas de C03/C05/C08 a partir de preguntas existentes, sin asumir que hay que añadir una pregunta.
2. Preparar las entradas y aserciones de prueba **focal** para estos cuatro casos, sin ejecutarlas bajo PLAN_ONLY.
3. Tras autorización, usar `evaluateRuleV2Trace` y el selector real, registrar trazas y certificar dimensiones individualmente.
4. Extender el mismo contrato a C01, C02, C04, C06, C09 y C10, sin abrir otro sistema de seguimiento.

### Changelog

- v1.1.0: matriz de aceptación C03/C05/C07/C08 y estados PASS/FAIL/ND/HOLD. Solo documentación.
