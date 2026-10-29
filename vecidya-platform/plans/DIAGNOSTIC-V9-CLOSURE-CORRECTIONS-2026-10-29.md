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
