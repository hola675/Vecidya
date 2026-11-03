# V9 — CLASS-01: criterios de aceptación y evidencia de cierre
Versión 0.1.1 · 2026-10-31 · PLAN_ONLY

## Alcance y fuente de autoridad
Deriva de DIAGNOSTIC-V9-TAX-CLASS-COMPATIBILITY.md, cuyo gate CLASS-01 exige inventario literal de values y ocho selectores con SHA. No reemplaza CLASS-02..05 ni autoriza pruebas.

## Evidencia disponible
- qbv2-reviewed-classification.ts blob 8807cbe1b920923e667b7afb9b64df350b35ae95: q2_sector v2, 15 opciones.
- qa03b/bank.ts blob b4772d73e1d8b5044ba2011088db978c364097f0: q2_sector v3 añade unknown.
- qa03b/specialty-candidate-bank.ts blob 0bc44cddc1dc2f03230bd5ece30847fce984a12b: q2_sector v4 conserva base y añade ecommerce, creator, b2b_services y nonprofit_community; ocho SELECTOR_GROUPS.
- qbv2-engine.ts blob 3ee64669b626c954495d5b194da6e07a42f252d1: filtrado de respuestas activas por elegibilidad y producción de señales.
- context-resolver.ts: grupos declarados y nichos pueden producir conflicto; no forzar resolución.

## Criterios de aceptación propuestos
| ID | Condición focal | Evidencia requerida | Estado |
|---|---|---|---|
| A01 | q2_sector V2=15, V3=16, V4=20 | Comparación literal value/kind/produces y test focal | PENDIENTE TEST |
| A02 | 14 sectores heredados mantienen señal nicheGroup | Diff de opciones heredadas por versión | PENDIENTE DIFF |
| A03 | other produce nicheGroupOther=true; unknown no produce señal; ninguno declara nicho concreto | Diff de produces y replay | PENDIENTE TEST |
| A04 | 4 valores nuevos solo existen en V4 | Diff y restauración con bancos anteriores | PENDIENTE TEST |
| A05 | 8 selectores dependen de igualdad literal sector | Inventario con IDs, grupos y SHA | DOCUMENTADO ESTÁTICAMENTE |
| A06 | Edición sector invalida selector incompatible | Replay de elegibilidad y señales | PENDIENTE TEST |
| A07 | Sector y nicho discordantes no se fusionan silenciosamente | Caso focal de conflicting_evidence | PENDIENTE TEST |
| A08 | Banco V9 no sustituye implícitamente V8 | Censo completo de importadores públicos | PENDIENTE CENSO |
| A09 | Persistencia y reanudación preservan respuestas válidas | Matriz de restore y decisión de migración | PENDIENTE DECISIÓN/TEST |
| A10 | No se infiere checkout, madurez, ventas o consentimiento por sector | Revisión de señales y scoring | PENDIENTE VALIDACIÓN |

## Evidencia mínima para declarar CLASS-01 cerrado
Inventario literal completo de 20 values y ocho selectores con SHAs vigentes; diff de produces y kind de cada opción; censo final de consumidores; pruebas focales autorizadas con resultados y commit SHA. Hasta entonces CLASS-01=PARCIAL.

## Changelog
0.1.0: matriz de aceptación A01–A10 y reglas de cierre sin ejecución.
## Corrección de trazabilidad (0.1.1)
A03 distingue declaración explícita de sector fuera de catálogo (`other` → `nicheGroupOther=true`) frente a desconocimiento (`unknown` → ninguna producción). Fuente: DIAGNOSTIC-V9-CLASS01-LITERAL-SECTOR-INVENTORY.md, qbv2-reviewed-classification.ts. Pendiente comprobar ambos con replay focal; no se han ejecutado pruebas.

## Changelog adicional
0.1.1: corregida semántica de A03 sin cambiar estado de aprobación.
