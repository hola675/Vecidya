# DIAG-V9 — Protocolo de migración editorial del banco de preguntas y respuestas

**Estado:** protocolo operativo; no es aprobación editorial de las 77 preguntas ni certificación del motor.  
**Objetivo:** revisar, migrar y consolidar las 77 preguntas del banco candidato, detectar huecos y conservar coherencia léxica y semántica en cada pregunta o respuesta creada o modificada. **El banco y el motor nuevos serán autónomos respecto de QBV2**.

## 1. Punto de partida verificable

Fuente de inventario actual: `app/features/diagnostic/qa03b/v9-editorial-review-matrix.ts` → `buildCandidateEditorialMatrixV9()`, sobre `QA03B_SPECIALTY_BRANCH_CANDIDATE_BANK_V2` de `specialty-branches-wave1.ts`.

Prueba existente: `tests/unit/diagnostic/qa03b-v9-editorial-review-matrix.test.ts` establece **77 preguntas, 387 opciones y 15 variantes**, con **4 `copy_revised`, 4 `needs_semantic_review` y 69 `pending_human_review`**. Son estados editoriales, **no 4 preguntas aprobadas**. La matriz reproduce cada `id`, `value`, `kind`, evidencia y dependencias; su ausencia de alertas no acredita comprensión humana.

**Advertencia:** este inventario utiliza tipos QBV2 transitoriamente. El resultado final no debe importar contratos, motor, planificador ni scoring QBV2. Las pruebas de restauración histórica P1e y PR #172 no son requisito de aceptación de este trabajo.

## 2. Ciclo de revisión de CADA pregunta (sin saltos)

1. **Extraer ficha original** de la matriz: ID, versión, módulo, pregunta, ayuda, variantes, opciones completas (`value`, etiqueta, `kind`, exclusividad), condiciones de aparición, dependencias, señales y evidencia por dimensión.
2. **Definir intención diagnóstica** en una frase: qué hecho observable pretende conocer, por qué importa, qué decisión o recomendación habilita. Si no hay utilidad clara, proponer REMOVE/DEFER.
3. **Comprobar el contexto**: negocio activo, en preparación o en pausa; sector, especialidad, modalidad, quién paga y quién recibe, y otras respuestas previas. No suponer ventas, citas, local físico, personal, CRM o presencia digital para todos.
4. **Auditar TODAS las respuestas**: mutuamente distinguibles, exhaustivas para casos relevantes, lenguaje no solapado, valor estable, exclusividad correcta, opciones «no aplica», «todavía no», «no sé» y «prefiero no responder» cuando corresponda. No confundir ausencia de evidencia con evidencia negativa.
5. **Auditar variantes y ayudas**: mantener el mismo significado medido; cambiar el vocabulario según contexto sin alterar inadvertidamente la interpretación.
6. **Auditar evidencia**: registrar qué `value` produce qué señal y qué lectura por dimensión (`established`, `partial`, `weak`, `uncertainty`, `not_applicable` cuando proceda). **No inventar puntuación** ni deducir madurez de una mera herramienta instalada.
7. **Auditar grafo**: elegibilidad, preguntas previas requeridas, rutas alcanzables, sustitución de preguntas genéricas, contradicciones, loops, ramas muertas y carga total de interacción.
8. **Detectar huecos**: escenarios reales sin opción válida; información indispensable sin pregunta; redundancias; sectores mal cubiertos; preguntas inaccesibles; evidencias que no pueden fundamentar resultados.
9. **Registrar decisión y justificación**: KEEP, REWRITE, REMOVE, ADD o DEFER; registrar por separado `copy_revised`, `needs_semantic_review` y `pending_human_review` de la matriz existente. No marcar aprobada sin revisión de opciones y evidencia.
10. **Implementar el cambio mínimo en candidato**, actualizar la ficha y ejecutar pruebas focalizadas del contrato, opciones, grafo y casos de negocio afectados. No tocar producción.
11. **Cerrar con trazabilidad**: commit, prueba, riesgo residual y estado de aceptación editorial. Repetir con la siguiente pregunta.

## 3. Contrato de léxico y significado

- **Español claro, neutral y conversacional**: una sola idea principal por pregunta, sin tecnicismos innecesarios, dobles negaciones ni presuposiciones.
- **Hechos observables antes que opiniones vagas**: acotar período («últimos meses») solo si la evidencia realmente exige temporalidad.
- **Conceptos diferenciados**: clientes ≠ interesados; comprador ≠ beneficiario; visitas ≠ citas; visibilidad ≠ ventas; herramienta instalada ≠ proceso sistematizado; «no aplica» ≠ «no lo hago» ≠ «no sé».
- **Variantes semánticamente equivalentes**: adaptar «pacientes», «clientes», «beneficiarios», «pedidos», «citas» según sector sin mezclar métricas distintas.
- **Opciones de respuesta inequívocas**: no usar «siempre», «normalmente» o «frecuentemente» sin contexto interpretable; evitar respuestas compuestas que mezclen dos situaciones.
- **No inducir respuestas ni promocionar Vecidya/GHL**; el diagnóstico debe evaluar necesidades, no forzar una venta.
- **Consistencia de términos** en pregunta, ayuda, opción, evidencia, resultado e informe; una modificación léxica debe revisar todas las superficies relacionadas.
- **No alterar silenciosamente el significado de un `value`**: si cambia la interpretación, documentar nueva versión de pregunta y su evidencia; en V9 nuevo no se requiere compatibilidad automática con sesiones legacy.

## 4. Política de creación, modificación y eliminación

| Decisión | Cuándo | Obligación |
|---|---|---|
| KEEP | Es clara, necesaria, no redundante y tiene opciones/evidencia coherentes | Registrar razón y pruebas |
| REWRITE | La intención es útil pero el texto, ayuda, opciones o evidencia fallan | Comparar antes/después y comprobar equivalencia o cambio semántico explícito |
| REMOVE | Redundante, no aporta evidencia útil o induce error | Comprobar que no deja dependencias ni huecos |
| ADD | Existe un hueco concreto que no puede resolverse con preguntas existentes | Definir objetivo, sector, contexto, opciones, evidencias, elegibilidad y costo en interacciones |
| DEFER | Falta evidencia, definición o validación humana | Registrar bloqueo; no tratar como aprobada |

**Regla de versionado:** corrección de redacción que conserva exactamente la semántica se registra como cambio editorial; cambio en `value`, `kind`, opciones, condición, dimensión, lectura o significado requiere versión explícita del contrato V9 y pruebas específicas. No reciclar IDs para preguntas distintas. Toda pregunta nueva necesita ID único, propósito y caso de negocio.

## 5. Ficha obligatoria por pregunta

```yaml
id: q2_...
version: 1
estado_revision: pending_human_review # no equivale a aprobado
decision: DEFER # KEEP | REWRITE | REMOVE | ADD | DEFER
modulo: ...
objetivo_diagnostico: ...
contextos_validos: []
pregunta_actual: ...
ayuda_actual: ...
variantes: []
respuestas:
  - value: ...
    etiqueta: ...
    kind: ...
    exclusiva: false
    senales: []
    evidencia_por_dimension: []
dependencias: []
huecos_detectados: []
riesgos_lexicos: []
propuesta_de_cambio: ...
motivo: ...
impacto_en_grafo: ...
impacto_en_recomendaciones: ...
pruebas_focalizadas: []
validacion_humana: pendiente
commit: pendiente
```

## 6. Registro de huecos

Por cada hueco: `HUECO-ID`, escenario de negocio reproducible, pregunta(s) implicadas, respuesta ausente/ambigua, impacto en evidencia o ruta, severidad, solución propuesta (REWRITE/ADD/REMOVE), prueba que demuestra la corrección y estado. **No crear preguntas por intuición sin un escenario y una decisión diagnóstica concreta.**

## 7. Cola editorial inicial (estado comprobado en la matriz)

**REWRITE de copy ya registrado, pero requiere validación humana:** `q2_monetization`, `q2_regularity`, `q2_buyer_recipient_relation`, `q2_reputation_flow`.

**Revisión semántica prioritaria:** `q2_demand_trend`, `q2_capacity_signal`, `q2_food_menu_visibility`, `q2_ecommerce_cart_followup`.

**69 restantes:** `pending_human_review`, no declaradas revisadas. Empezar por preguntas de clasificación y contexto, luego preguntas genéricas, sectores y especialidades, dependencias y resultados; registrar cada una individualmente.

Ejemplo de hueco conocido: `q2_food_menu_visibility` usa `not_applicable` con etiqueta «Todavía no muestro la oferta», lo que mezcla no aplicabilidad y ausencia de publicación. La propuesta aislada `v9-food-menu-v2-proposal.ts` introduce `not_published` como evidencia débil; **la propuesta no está aprobada automáticamente**. Hay que contrastarla con casos de restaurante/cafetería/food truck y decidir el contrato definitivo.

## 8. Puertas de aceptación

- **Inventario completo:** 77/77 fichas y 387/387 respuestas inventariadas; 15 variantes rastreables (ajustar denominadores si ADD/REMOVE cambia el banco y registrar delta).
- **Editorial:** 0 preguntas sin decisión; 0 respuestas sin lectura semántica justificada; pendientes humanos identificados y resueltos antes de aprobar.
- **Grafo:** sin referencias rotas, ciclos incontrolados, preguntas inaccesibles ni ramas incompatibles; recorridos reales por sector y etapa, con límite de 24 interacciones donde aplique.
- **Motor nuevo:** contrato y ejecución autónomos; sin dependencias de `qbv2-*` para seleccionar, validar, evaluar o recomendar.
- **Certificación:** pruebas focalizadas y escenarios end-to-end de negocios, resultados explicables, revisión humana y evidencia asociada a commits. **No activar producción** antes de certificación y autorización.

## 9. Disciplina de ejecución

Un lote editorial debe cerrar: inventario → análisis pregunta/opciones → huecos → decisión → cambio candidato → pruebas focalizadas → documentación/commit. No saltar a P1e histórica ni a CI general. Registrar hallazgos fuera del alcance sin modificar código no relacionado. No fusionar ni desplegar sin autorización específica.
