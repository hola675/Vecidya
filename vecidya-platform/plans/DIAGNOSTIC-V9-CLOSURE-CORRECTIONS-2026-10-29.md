# V9 — Correcciones de auditoría focal (PLAN_ONLY)

Fuente inspeccionada: `app/features/diagnostic/qa03b/recovery-wave2.ts`, blob `59fe5898cc98ba243b4c898b027dd22f2c1153c9`.

## C05: corrección importante

`q2_nonprofit_membership_lifecycle` **NO** cubre todas las organizaciones sin ventas. Su elegibilidad es `andV2(nonprofit, inV2("q2_nonprofit_support_type", ["membership_dues", "mixed"]))`. Pregunta incorporación o renovación de membresía. Una organización sin membresías ni cuotas puede quedar fuera; por tanto, no contarla como evidencia de `conversion_access` para C05 genérico. La afirmación anterior sobre cobertura nonprofit sin donaciones era demasiado amplia. Conservar el hueco NEW-V9-002 hasta comprobar otra pregunta válida.

## Otras rutas condicionadas

`q2_b2b_qualification` requiere actividad operativa con historial y compradores B2B/mixed. `q2_operations_process_ownership` requiere actividad operativa con historial y objetivo/fricción de operaciones. `q2_followup_status_visibility` requiere actividad operativa con historial y objetivo/fricción de seguimiento; elimina `materialAppliesWhen` para evitar bypass de elegibilidad. Ninguna cubre universalmente la dimensión a la que aporta evidencia.

## Próxima puerta de cierre

Inventariar condiciones completas de cada pregunta, no inferir cobertura por nombre, módulo o dimensión. Para C05 sin membresía ni donaciones, buscar pregunta sobre acceso a participación/información que no presuponga cuotas; si no existe, someter NEW-V9-002 a revisión humana. No se ejecutaron pruebas ni se modificó el motor.

Versión documental 1.0.0 — 2026-10-29.
