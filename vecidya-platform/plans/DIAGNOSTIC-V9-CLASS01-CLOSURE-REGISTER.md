# V9 — CLASS-01: registro consolidado de cierre documental
Versión 0.1.0 · 2026-10-31 · PLAN_ONLY

## Dictamen
CLASS-01 = PARCIAL / NO CERTIFICADO. El inventario literal y la trazabilidad focal están documentados, pero no existe certificación de consumidores de toda la rama ni replay ejecutado. CLASS-02..05 permanecen abiertos.

## Evidencia consolidada
| Evidencia | Documento | Resultado |
|---|---|---|
| 20 valores q2_sector | DIAGNOSTIC-V9-CLASS01-LITERAL-SECTOR-INVENTORY.md | Documentado estáticamente: V2=15, V3=16, V4=20 |
| Ocho selectores y gates | DIAGNOSTIC-V9-CLASS01-SELECTOR-REPLAY-GATES.md | Documentado |
| Consumidores literales QA03B | DIAGNOSTIC-V9-CLASS01-QA03B-CONSUMER-TRACE.md | Cuatro archivos, 14 coincidencias textuales; no 14 consumidores distintos |
| Consumidores indirectos | DIAGNOSTIC-V9-CLASS01-INDIRECT-NICHE-CONSUMERS.md | Resolvedor, motor y señales revisados focalmente |
| Aceptación A01–A10 | DIAGNOSTIC-V9-CLASS01-ACCEPTANCE-MATRIX.md v0.1.1 | Definida, no certificada |
| Replay R01–R08 | DIAGNOSTIC-V9-CLASS01-REPLAY-SCENARIOS.md | Casos propuestos, no ejecutados |

## Semántica que no se debe perder
- `other` produce nicheGroupOther=true; puede resolver grupo other, sin nicho concreto.
- `unknown` no produce clasificación; no se puede equiparar a other.
- 14 sectores originales producen nicheGroup; cuatro sectores añadidos V4 también.
- Selector especializado produce niche solo por elección explícita; otro/desconocido en selector no produce nicho.
- Sector y nicho incompatibles deben exponerse como conflicting_evidence, no sobrescribirse.
- Nicho, sector y modalidad de entrega no acreditan ventas, checkout, madurez ni consentimiento.

## Pendientes precisos para certificación
1. Barrido de todos los consumidores directos e indirectos en la rama V9, con rutas y SHAs; el censo QA03B actual es focal.
2. Diff de `kind`, `produces` y `provenance` de cada valor heredado V2→V3→V4, mediante verificación reproducible.
3. Validación de importadores públicos y del banco efectivo usado por sesión; descartar activación accidental.
4. Decisión de migración de sesiones (reanudación con banco original, clave aislada o política explícita).
5. Autorización para ejecutar únicamente pruebas focales A01–A10, R01–R08 e I01–I06; registrar resultados reales y SHA.

## Siguiente paquete
Preparar CLASS-02: matriz oldValue→atributos confirmables, conservando desconocido y procedencia; no inferir modelo comercial/canal/naturaleza por sector. No iniciar implementación.

## Changelog
0.1.0: consolidación de evidencia, distinción de estados y requisitos de certificación.