# QA-03B — Resultados de certificación del banco candidato (wave 3)

**Origen:** logs reales de GitHub Actions del SHA `dfb3b1449cae48e0f8a0cdfe99cc483801c6e72b`, [run 40224905079](https://github.com/hola675/Vecidya/actions/runs/40224905079).  
**Estado:** suite PASS **1.749/1.749**, 0 fallos, 0 omitidas; typecheck, build y regresión Diagnóstico/Aprende PASS.  
**Entorno:** banco experimental de **74 definiciones**; QA-03B público de 45 sin cambiar. **No despliegue** ni aceptación para cutover.

## 1. Cobertura

- **30 perfiles** sintéticos de sectores, nichos, tipos de entidad, operaciones, pausas e ideas.
- **8 recorridos paso a paso** desde una entrevista vacía, sin inventar capacidades positivas (se utilizan respuestas declaradas o alternativas neutras).
- Límite de 24 preguntas y restricciones por módulo conservados.
- Comprobadas: elegibilidad, fidelidad de nicho, determinismo, trazas, edición de sector/estado/comprador/reservas y rechazo de sesiones candidatas por el parser público V8.
- No sustituye pruebas en navegador, Worker HTTP, resultados identificados, correos o pruebas con personas.

## 2. Resultados observados por recorrido

| Perfil sintético | Respondidas | Motivo terminal real | ¿Cierre del planificador? | Observaciones |
|---|---:|---|---|---|
| idea-software | 14 | `no_useful_questions` | Sí | Sigue habiendo dimensiones no observadas: no inventar puntuación |
| pausa-dentista | 11 | `no_useful_questions` | Sí | La historia previa no autoriza preguntas de operación actual |
| clinica-dental | 23 | `budget_blocked` | No | `q2_digital_tools_in_use` y `q2_niche_health_wellness` quedan en `base_budget` |
| restaurante-reservas | 23 | `budget_blocked` | No | `q2_digital_tools_in_use` queda en `base_budget` |
| tienda-hibrida | 24 | `useful_questions_remaining`, hard cap | Sí, por límite | `q2_digital_tools_in_use` queda en `hard_cap` |
| agencia-marketing-b2b | 21 | `budget_blocked` | No | Herramientas y nicho B2B en `base_budget`; atribución del origen en `module_budget` |
| creador-audiencia | 19 | `budget_blocked` | No | Atribución del origen en `module_budget` |
| organizacion-donaciones | 22 | `budget_blocked` | No | Atribución del origen en `module_budget` |

**Totales:** 2 rutas `no_useful_questions`, **5 bloqueadas por presupuesto**, 1 detenida por tope absoluto. Ninguna ruta excedió 24 preguntas. Las 8 cumplen la semántica real de cierre/terminal del motor.

**Importante:** `completion.ready` indica que el planificador puede finalizar la entrevista, **no que cada dimensión tenga evidencia suficiente**. En ambas rutas `no_useful_questions` permanecían dimensiones `unresolved` o `insufficient_context`. Sería incorrecto publicarlas como diagnósticos plenamente respaldados solo porque la sesión pudo finalizar.

## 3. Deuda funcional que revela el experimento

1. **Nicho identificado tarde o descartado:** dos rutas dejaron sin preguntar `q2_niche_*` pese a que el grupo ya estaba declarado. Esto demuestra que tener los ocho selectores disponibles **no garantiza personalización efectiva** dentro del presupuesto actual.
2. **Extensión por evidencia:** varias rutas con respuestas sintéticas desconocidas consumen 19–24 preguntas, aunque el objetivo normal sea 10–16. La optimización debe sustituir preguntas de bajo valor o finalizar justificadamente con incertidumbre; **no elevar los límites**.
3. **Pregunta de herramientas digitales:** aparece frecuentemente como útil pero no seleccionable en `base_budget`. Debemos revisar si es contexto necesario para una rama real o solo un dato descriptivo sin evidencia V3.
4. **Atribución de clientes:** `q2_measurement_source_confidence` puede quedar fuera del cupo del módulo de medición; comparar su ganancia real frente a las otras preguntas de medición ya contestadas.
5. **Resultados incompletos:** siempre comunicar `insufficient_context`, `uncertainty` y `not_applicable` como tales; no completar puntuaciones a partir de nicho, herramientas o supuestos.
6. **Cohorte artificial:** los perfiles usan predominantemente respuestas neutrales para capacidades no aportadas. No extrapolar tiempos/porcentajes de bloqueo a usuarios reales.

## 4. Siguiente intervención propuesta (sin activar aún)

- Añadir pruebas A/B de planificador que comparen **elección de la pregunta de mayor ganancia** por dimensión, frente a una simple prioridad de clasificación.
- Condicionar la prioridad del nicho a que su respuesta realmente cambie la selección posterior o la pertinencia de la recomendación; si no, dejarlo como contexto opcional. No convertirlo en `critical` por sistema.
- Probar sustitución de una pregunta de bajo valor por una de contexto/evidencia relevante **sin alargar la ruta**. Verificar especialmente clínica, restaurante, B2B y medición.
- Conservar los límites `targetMin 10`, `targetMax 16`, `hardMax 24` y topes por módulo salvo decisión explícita respaldada por pruebas.
- Repetir los 30 perfiles y 8 recorridos y comparar el *delta* en número de preguntas, dimensiones resueltas, preguntas fuera de contexto y razones de exclusión.
- Documentar políticas V8/V9 de sesión/Worker y ejecutar E2E HTTP antes de cualquier cutover.

## 5. Conclusión técnica

Las **74 definiciones candidatas** no tienen fallos de contrato detectados por las pruebas actuales, pero la cobertura y prioridad del planificador **todavía requieren optimización** antes de sustituir el banco público. Los 5 casos `budget_blocked` son deuda explícita, **no éxitos de evidencia**.

Este documento registra resultados **observados** de pruebas sintéticas, no una estimación de comportamiento real ni una autorización para producción.
