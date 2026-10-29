# Diagnóstico V9 — matriz de conciliación con main

Fecha: 2026-10-29. PR maestro: #162. Main contiene squash de MiniWeb V2 (#184).

## Estado verificado

- Rama de trabajo: `feat/diagnostic-v9-lex-graph-p1b`.
- Base V9 al verificar: `f71bf67d4d449bdb88d326f1d743976a1b1b4c70`.
- Main tras #184: `d0410496d9d3a422726d9f11d70c93e6ae72d5df`.
- GitHub: fusión automática no disponible. Nueve archivos aparecen modificados en ambas líneas; **no son nueve conflictos Git confirmados**.
- Respaldo: `backup/diagnostic-v9-pre-main-sync-20261029`.

## Archivos de atención especial

| Archivo | Criterio de resolución |
| --- | --- |
| `.github/workflows/main-integration-quality.yml` | Conservar jobs actuales de main; añadir solo comprobaciones V9 focalizadas, sin ampliar batería general. |
| `vecidya-platform/app/app.css` | Mantener estilos de main y añadir exclusivamente estilos V9 necesarios; evitar regresiones de Aprende. |
| `vecidya-platform/app/routes.ts` | Mantener rutas actuales de main; incorporar rutas V9 solo si son nuevas y opt-in. |
| `vecidya-platform/app/routes/business-profile.tsx` | Mantener comportamiento actual de main y selector `BusinessSectorPicker` integrado en V9; revisar compatibilidad de formulario y preview. |
| `vecidya-platform/db/migrations/meta/_journal.json` | Preservar secuencia de migraciones de main; no renumerar ni borrar entradas; resolver colisiones manualmente. |
| `vecidya-platform/docs/ROADMAP.md` | Combinar estado real de ambos frentes sin marcar V9 como certificado. |
| `vecidya-platform/docs/STATUS.md` | Actualizar a estado comprobado; no sobrescribir progreso de Aprende. |
| `vecidya-platform/docs/STRUCTURE.md` | Mantener inventario de main y añadir únicamente estructura V9 nueva. |
| `vecidya-platform/docs/TESTING.md` | Documentar pruebas focalizadas de V9; no sustituir instrucciones vigentes de main. |

## Ejecución segura en un worktree separado

1. `git fetch origin main feat/diagnostic-v9-lex-graph-p1b`.
2. Crear worktree temporal desde la rama V9; comprobar que no hay cambios sin guardar.
3. `git merge --no-commit --no-ff origin/main` y revisar `git status` / `git diff --name-only --diff-filter=U`.
4. Resolver cada conflicto preservando contratos de main y cambios V9; no editar Aprende salvo que sea imprescindible para resolver un conflicto directo, en cuyo caso detener y coordinar.
5. Ejecutar typecheck y pruebas **focalizadas** de los módulos V9 y de los archivos realmente tocados, no suites generales.
6. Verificar diff final contra main, confirmar ausencia de cambios accidentales y hacer commit de merge.
7. Publicar con `git push origin HEAD:feat/diagnostic-v9-lex-graph-p1b` solo tras revisar HEAD remoto y controles de concurrencia.
8. Verificar PR #162 y su CI; **no fusionar #162 en main ni desplegar**.

## Criterios de aceptación

- `main` queda ancestro de la rama V9, sin force-push.
- Cambios V9 y MiniWeb V2 preservados.
- Aprende sin modificaciones involuntarias.
- Pruebas focalizadas y evidencia de CI registradas.
- PR #162 sigue abierto hasta certificación del motor V9.
