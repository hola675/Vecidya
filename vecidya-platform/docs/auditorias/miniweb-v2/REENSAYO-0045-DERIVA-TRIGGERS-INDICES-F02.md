# F02 — Ensayo de deriva de esquema: triggers e índices adicionales

Fecha 2026-11-05. SQLite en memoria, validador V3 extraído del paquete ZIP previamente publicado y script local vecidya_0045_test_deriva_constraints.py. Se restauró la dependencia vecidya_0045_migracion_segura_prototipo.py que faltaba en el ZIP. **No D1**.

## Resultados ejecutados
- Base reconstruida: SKIP_VALID.
- Tabla reconstruida por CREATE TABLE AS SELECT (sin preservar DDL): BLOCK_COLUMN_DEFINITION.
- Trigger adicional BEFORE UPDATE que aborta cambios: SKIP_VALID (**deriva funcional no detectada**).
- Índice adicional inesperado sobre status: SKIP_VALID (**deriva no inventariada; no necesariamente defecto**).

## Hallazgo
El V3 es un comprobador parcial, no un comparador completo de esquema. Aceptar triggers nuevos puede ocultar cambios funcionales; índices extra deben inventariarse y decidirse según política de extensibilidad, no rechazarse automáticamente.

## Pendientes
- P-MIG-26 PARCIAL: fixture negativo de trigger ejecutado; la validación no lo detecta. Defaults, CHECK, FK ON UPDATE/DELETE y D1 pendientes.
- P-MIG-29 NUEVO: inventariar triggers en sqlite_master, evaluar definición y comportamiento antes de SKIP_VALID.
- P-MIG-30 NUEVO: inventariar índices adicionales y establecer política allowlist/compatibilidad sin rechazo automático.
- P-MIG-31 NUEVO: comparar DDL completo y restricciones mediante fixtures reproducibles y criterios explícitos de equivalencia.
- P-REG-24 NUEVO: reparar el paquete ZIP V3, que carece de dependencia de importación para ejecutar las pruebas de forma aislada.
- P-REG-25 NUEVO: publicar y versionar el script de este reensayo, registrar hash y entorno.
- P-MIG-01..28, P-REG-01..23 y restantes P-CI/P-F07/T-AUTH conservan sus estados salvo avances parciales mencionados. F08 NO-GO.

No se alteraron bases remotas, staging, producción ni V1.
