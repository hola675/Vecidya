# Auditoría perfeccionista — MiniWeb V2

Fecha de apertura: 2026-11-05
Estado: ABIERTA · auditoría continua
Rama de trabajo: `docs/miniweb-v2-auditoria-perfeccionista`

## Objetivo final

Finalizar MiniWeb V2, verificar paridad funcional y calidad, sustituir V1 y eliminar sus rutas, código, tablas y dependencias **solo tras demostrar** una migración segura y reversible. No desplegar ni eliminar V1 sin aprobación y evidencia.

## Principios

1. Separar **confirmado en código**, **riesgo lógico por reproducir**, **deuda documentada** y **propuesta de mejora**.
2. Un hallazgo = ID estable, evidencia verificable, impacto, reproducción, corrección mínima y prueba de regresión.
3. No convertir hipótesis en defectos confirmados ni atribuir PASS a pruebas no ejecutadas en esta auditoría.
4. Mantener intactos Diagnóstico V9, CRM, Vecindario y otras superficies salvo dependencias demostradas.
5. No aplicar migraciones D1 remotas, cambios R2, despliegues ni borrado V1 en fase de registro.
6. Antes de eliminar V1: inventario de consumidores, paridad, migración, backups, rollback, telemetría y aprobación.

## Documentos

- [HALLAZGOS.md](HALLAZGOS.md): registro vivo con identificadores.
- [MIGRACION-V1-A-V2.md](MIGRACION-V1-A-V2.md): estrategia de sustitución y retirada.
- [PLAN-DE-VERIFICACION.md](PLAN-DE-VERIFICACION.md): pruebas y gates de liberación.
- [BITACORA.md](BITACORA.md): cambios del registro y evidencia acumulada.

## Regla de cierre

No cerrar un hallazgo solo por editar código: se exige prueba de regresión, revisión de impacto y evidencia asociada. La certificación de release es independiente del cierre de tickets.

## Índice de evidencias y seguimiento (2026-11-05)

- [Estado ejecutivo y backlog](ESTADO-Y-BACKLOG-CONSOLIDADO-2026-11-05.md): fases, gates y pendientes.
- [Ensayo de migración 0045](REPRODUCCION-SQLITE-MIGRACION-0045.md): tabla vacía/poblada.
- [Seis escenarios SQLite](ENSAYO-SQLITE-0045-SEIS-CASOS.md): claves externas activadas/desactivadas.
- [Reconstrucción SQLite](ENSAYO-RECONSTRUCCION-0045-F02.md): alternativa aislada.
- [Rollback inyectado](ROLLBACK-0045-SEIS-INYECCIONES-F02.md): recuperación ante seis interrupciones.
- [Reintentos y volumen](REINTENTOS-Y-VOLUMEN-0045-F02.md): hasta 10000 filas en memoria.
- [Matriz de permisos V1/V2](MATRIZ-PERMISOS-V1-V2-F07.md): casos T-AUTH-01..10.
- [Revisión de roles](REVISION-ROLES-AUTORIZACION-F07.md): equivalencia estática, sin tests HTTP.
- [Mapa de rutas y corte](MAPA-RUTAS-Y-CORTE-F07.md): dependencias y migración V1/V2.
- [CI y pendientes](CI-PENDIENTES-Y-ESTADO.md): estado y gates pendientes.

Las pruebas SQLite no certifican D1 ni el release. P-REG-06: índice README completado parcialmente; queda sincronizar PLAN-MAESTRO. P-REG-01..05 y P-REG-07..09 abiertos según consolidado.

- [Reensayo de idempotencia y FK entrante](REENSAYO-0045-IDEMPOTENCIA-FK-ENTRANTE.md): demuestra que el prototipo SQLite puede sobrescribir organization_id al repetirse; NO es una prueba D1.

- [Reensayo de índices parciales y expresiones F02](REENSAYO-0045-INDICES-PARCIALES-Y-EXPRESIONES-F02.md): falso positivo del validador original y corrección experimental v2, sin D1.
