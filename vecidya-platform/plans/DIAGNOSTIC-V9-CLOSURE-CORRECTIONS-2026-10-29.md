# V9 — Correcciones de auditoría focal (PLAN_ONLY)

Fuente inspeccionada: `app/features/diagnostic/qa03b/recovery-wave2.ts`, blob `59fe5898cc98ba243b4c898b027dd22f2c1153c9`.

## C05: corrección importante

`q2_nonprofit_membership_lifecycle` **NO** cubre todas las organizaciones sin ventas. Su elegibilidad es `andV2(nonprofit, inV2("q2_nonprofit_support_type", ["membership_dues", "mixed"]))`. Pregunta incorporación o renovación de membresía. Una organización sin membresías ni cuotas puede quedar fuera; por tanto, no contarla como evidencia de `conversion_access` para C05 genérico. La afirmación anterior sobre cobertura nonprofit sin donaciones era demasiado amplia. Conservar el hueco NEW-V9-002 hasta comprobar otra pregunta válida.

## Otras rutas condicionadas

`q2_b2b_qualification` requiere actividad operativa con historial y compradores B2B/mixed. `q2_operations_process_ownership` requiere actividad operativa con historial y objetivo/fricción de operaciones. `q2_followup_status_visibility` requiere actividad operativa con historial y objetivo/fricción de seguimiento; elimina `materialAppliesWhen` para evitar bypass de elegibilidad. Ninguna cubre universalmente la dimensión a la que aporta evidencia.

## Próxima puerta de cierre

Inventariar condiciones completas de cada pregunta, no inferir cobertura por nombre, módulo o dimensión. Para C05 sin membresía ni donaciones, buscar pregunta sobre acceso a participación/información que no presuponga cuotas; si no existe, someter NEW-V9-002 a revisión humana. No se ejecutaron pruebas ni se modificó el motor.

Versión documental 1.0.0 — 2026-10-29.

## Matriz focal C03 / C05 / C08 — versión 1.1.0

Inspección estática de fuentes: `qa03b/bank.ts` blob `b4772d73e1d8b5044ba2011088db978c364097f0`, `qa03b/recovery-wave2.ts` blob `59fe5898cc98ba243b4c898b027dd22f2c1153c9`, `qa03b/specialty-branches-wave1.ts` blob `ec605156f2e974d7b463f44ae76475f8ede1f0e9`.

| Escenario | Condición observada | Límite demostrado | Acción documental |
| --- | --- | --- | --- |
| C03 pausado | `operating` exige estado `operating`; historial exige `q2_has_customers=yes` | Las cuatro preguntas focales de medición revisadas requieren `operating` y no cubren pausa por esa ruta | Buscar evidencia histórica compatible o abstención; no inventar actividad reciente |
| C05 sin ventas ni membresía | `q2_nonprofit_membership_lifecycle` exige `q2_nonprofit_support_type=membership_dues/mixed` | No prueba acceso a participación para organizaciones sin cuotas | Auditar alternativa transversal; mantener NEW-V9-002 como candidata, no aprobada |
| C08 sin presencia digital | `q2_presence_offer_clarity` exige presencia reliable/partial mediante `materialAppliesWhen`; `q2_food_menu_visibility` también | Ninguna de estas dos rutas demuestra claridad de oferta sin presencia | Buscar evidencia independiente de canal antes de proponer pregunta nueva |

### Contrato para cerrar cada fila

1. Inventariar pregunta y versión exacta, todas las condiciones de elegibilidad y opciones neutrales.
2. Trazar respuesta y evidencia directa/de apoyo; no asumir que `unknown` o `not_applicable` indican debilidad.
3. Comprobar la selección efectiva y el presupuesto de 24 preguntas ordinarias más un máximo de cinco consentidas.
4. Si no existe evidencia suficiente, registrar abstención explicable y no asignar madurez artificial.
5. No marcar cobertura certificada sin recorrido reproducible y criterios de suficiencia aprobados.

**Estado:** tres riesgos documentados; ninguna ruta certificada. Solo PLAN_ONLY, sin tests, CI, cambios de motor ni despliegues.

### Changelog
- 1.1.0 (2026-10-29): matriz focal C03/C05/C08 y contrato de cierre documental.

## Inventario: procedencia del banco y límite de inspección (v1.2.0)

En `qa03b/bank.ts` (blob `b4772d73e1d8b5044ba2011088db978c364097f0`) se identifican siete declaraciones literales `id: "q2_*"`: `q2_measurement_rate_estimate`, `q2_measurement_result_recording`, `q2_measurement_review_cycle`, `q2_operational_status`, `q2_buyer_recipient_relation`, `q2_digital_tools_in_use`, `q2_measurement_practice`. **Esto no equivale al inventario completo**, porque el banco compone preguntas importadas de lotes históricos y aplica transformaciones. Un conteo textual de IDs locales no valida ni refuta el total candidato de 77.

**Protocolo de inventario sin ejecutar código:** enumerar los lotes fuente y sus IDs, versiones, opciones, neutralidad, reglas, dimensión/evidencia; registrar transformaciones de `bank.ts`, especializaciones y recuperaciones; deduplicar por `questionId+version` y distinguir preguntas reemplazadas de nuevas. Marcar por separado preguntas `pending`, `migrated`, y `routing` sin evidencia. Solo entonces comparar con la afirmación de 77 y calcular el catálogo editorial real. No inferir que el banco candidato está desplegado.

**Puerta de aceptación TAX-G2:** tabla completa trazable a archivo y blob, conteo reproducible de IDs únicos y versiones, opciones ES/EN y banderas neutrales; diferencias explicadas. Hasta entonces `77` sigue como cifra declarada en fuente, no certificada mediante inventario.

### Changelog
- 1.2.0 (2026-10-29): procedimiento de inventario y advertencia sobre conteos parciales de `bank.ts`.

## Rectificación de referencia canónica del banco — v1.3.0

**Corrección:** el objetivo editorial NO es reconstruir el banco histórico V8. La fuente unificada candidata V9 ya existe: `QA03B_SPECIALTY_BRANCH_CANDIDATE_BANK_V2` en `app/features/diagnostic/qa03b/specialty-branches-wave1.ts` (blob `ec605156f2e974d7b463f44ae76475f8ede1f0e9`). Su ensamblaje parte de `QA03B_SPECIALTY_CANDIDATE_BANK_V1` (blob `0bc44cddc1dc2f03230bd5ece30847fce984a12b`), aplica exclusiones de genéricas y añade tres preguntas especializadas. El archivo declara aserciones runtime de longitud 77 y 77 IDs únicos. Estas aserciones fueron inspeccionadas, NO ejecutadas.

**Regla de auditoría desde ahora:** usar los 77 IDs de este candidato V9 como universo de referencia para revisión editorial, identidad, elegibilidad y evidencia; usar V8/lotes anteriores solo como procedencia histórica y para compatibilidad, nunca como sustituto del banco V9. No inferir que el banco candidato ya está desplegado, que toda pregunta fue aprobada, o que todas las rutas están certificadas. La expansión de preguntas continúa permitida si se demuestra hueco y se conserva el límite 24+5.

**Corrección de TAX-G2:** el trabajo pendiente es materializar la ficha trazable de los 77 IDs del banco candidato V9 y validar sus rutas, no redescubrir si existe un banco unificado. La afirmación anterior de que no existía un banco unificado verificado era imprecisa.

### Changelog
- 1.3.0 (2026-10-29): referencia canónica al banco unificado candidato V9 y separación explícita respecto a V8.

## TAX-G2: composición canónica V9 y decisiones de identidad — v1.4.0

Fuentes inspeccionadas: `qa03b/specialty-candidate-bank.ts` blob `0bc44cddc1dc2f03230bd5ece30847fce984a12b` y `qa03b/specialty-branches-wave1.ts` blob `ec605156f2e974d7b463f44ae76475f8ede1f0e9`.

El ensamblaje de `QA03B_SPECIALTY_BRANCH_CANDIDATE_BANK_V2` es: (1) `QA03B_EDITORIAL_BASE_QUESTIONS_V9`, derivada de `REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3` con `applyQA03BEditorialCopy`; (2) sustitución de `q2_sector` por candidato v4; (3) ocho selectores `q2_niche_*` basados en grupos explícitos del registro taxonómico; (4) piloto de recuperación; (5) ola 2 de recuperación; (6) sustitución condicional de genéricas mediante gates negativos; (7) tres preguntas especializadas adicionales. El código contiene aserciones de 77 entradas y 77 IDs únicos, pero aquí no se ejecutan.

**Contrato editorial:** preservar `questionId` y versión cuando solo cambie el texto sin cambiar significado; requerir nueva versión y plan de compatibilidad cuando cambien opciones, interpretación o evidencia; no contar especialización como pregunta extra en el recorrido si reemplaza la genérica; no confundir número de preguntas del catálogo con longitud de entrevista. El sector v4 y el seguimiento de carrito v2 ya muestran versiones diferenciadas.

**Puertas pendientes:** fichas completas de los 77 IDs, trazas de escenarios C01–C10, suficiencia por dimensión, traducciones EN revisadas y decisión humana sobre nuevas preguntas. La existencia del candidato no implica activación pública. La rotación de hasta cuatro variantes editoriales por pregunta se diseña después del cierre del banco y sin alterar semántica.

### Changelog
- 1.4.0 (2026-10-29): composición del banco V9 fijada como contrato de auditoría e identidad.
