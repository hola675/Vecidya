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
