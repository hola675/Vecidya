# V9 — Expediente editorial focal: ocho preguntas con nota explícita

**PLAN_ONLY · 2026-10-29 · v1.0.0**

Fuentes: `qa03b/v9-editorial-review-matrix.ts` blob `5ce3b2520b4a9c4e569aa7a34962a008b46613ab`; `qa03b/bank.ts` blob `b4772d73e1d8b5044ba2011088db978c364097f0`; `qa03b/recovery-wave2.ts` blob `59fe5898cc98ba243b4c898b027dd22f2c1153c9`.

Este expediente registra **ocho decisiones editoriales explícitas del código**, no ocho aprobaciones finales. La matriz aplica sobre el banco candidato unificado V9 de 77 entradas; no se ejecutó la función ni sus pruebas.

| Pregunta | Estado declarado | Riesgo o motivo en la matriz | Próxima decisión concreta |
| --- | --- | --- | --- |
| `q2_monetization` | `copy_revised` | Diferenciar ingresos de aportes, sin mezclar negocio y organización | Validar comprensión con organizaciones y emprendimientos; conservar significado |
| `q2_regularity` | `copy_revised` | Frecuencia de actividad expresada mediante hechos observables | Validar modalidades sin pedidos o ventas |
| `q2_buyer_recipient_relation` | `copy_revised` | Diferenciar quién paga y quién recibe | Contrastar terceros beneficiarios y B2B |
| `q2_reputation_flow` | `copy_revised` | Referencias públicas frente a mensajes privados | Validar comprensión multicanal |
| `q2_demand_trend` | `needs_semantic_review` | Clientes/ventas/citas/pedidos no son equivalentes universales | Revisar opciones y evidencia antes de generalizar demanda |
| `q2_capacity_signal` | `needs_semantic_review` | Posible mezcla de capacidad, causas y resultados | Revisar multiselección y señal observada |
| `q2_food_menu_visibility` | `needs_semantic_review` | `not_applicable` «Todavía no muestro la oferta» puede no ser neutral | Decidir si corresponde exclusión real o señal distinta; preservar versión hasta decisión |
| `q2_ecommerce_cart_followup` | `needs_semantic_review` | No tener permiso de contacto no equivale a fallar en seguimiento | Conservar exclusión por consentimiento y comprobar semántica de opciones |

## Dos restricciones observables adicionales

- `q2_demand_trend`, `q2_capacity_signal`, `q2_regularity` y `q2_reputation_flow` figuran en `historicalInteractionQuestions` de `bank.ts`: su evolución aplica guardia de `operating` y `q2_has_customers=yes`. No extrapolar sus resultados a C03 pausado ni C02 prelaunch.
- `q2_ecommerce_cart_followup` en `recovery-wave2.ts` es **versión 2**, exige comercio electrónico operativo con historial y `q2_ecommerce_cart_visibility=yes`; añade opciones neutrales y prohíbe remapear respuestas v1 sin migración de sesión explícita.

## Criterio de cierre

Para cada una de las ocho: conservar ficha de pregunta y opciones del banco V9; aprobar significado y neutralidad por revisión humana; decidir `KEEP`, `REVISE`, `REPLACE` o `HOLD`; documentar si cambia `questionVersion` o evidencia; comprobar recorrido focal C01–C10 y presupuesto 24+5 antes de activar. `copy_revised` **no equivale a aprobado**. El resto de las 77 preguntas continúa sujeto a revisión humana, aunque no tenga nota explícita.

**Sin implementación, ejecución de pruebas, CI ni despliegue.**
