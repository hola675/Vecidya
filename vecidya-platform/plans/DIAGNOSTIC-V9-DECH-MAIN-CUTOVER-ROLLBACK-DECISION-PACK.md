# Diagnostic V9 — DEC-H: reconciliación main→V9, corte y rollback

**Versión:** 0.1.0  
**Fecha:** 2026-11-01  
**Estado:** PLAN_ONLY · RATIFICADO VÍA HOJA A–H · IMPLEMENTACIÓN NO AUTORIZADA  
**Rama auditada:** `feat/diagnostic-v9-lex-graph-p1b`

## Nota de autoridad documental

El estado de decisión de este paquete es histórico y queda **supersedido para status** por `DIAGNOSTIC-V9-HUMAN-DECISION-SHEET-A-H.md`. Las propuestas, riesgos y criterios técnicos de este archivo siguen siendo referencia; cualquier frase interna “NO APROBADO”, “READY_FOR_HUMAN_REVIEW” u “OPEN” describe el momento de redacción original y **no reabre** la decisión humana ya registrada. PLAN_ONLY sigue vigente para runtime.

## 1. Objetivo

DEC-H debe fijar cómo reconciliar la rama V9 con `main`, cómo preservar V8 y productos adyacentes, y qué gates permiten staging/corte/rollback.

No se realiza merge, rebase, cherry-pick, resolución de conflictos, renumeración de migraciones, CI ni deploy.

## 2. Estado Git revalidado 2026-11-01

### Repositorio
- default branch: `main`.
- `main` actual: `e92c10e9ebcbb87768661eb383f16564340e63cf`.
- rama V9/PR #162 actual al momento de consulta: `fb0fad4c84c093665e60c8e065c4abcb853235d8`.

### PR #162
- state: open;
- draft: true;
- mergeable: false;
- mergeable_state: `dirty`;
- 657 commits;
- 210 archivos cambiados reportados por PR.

### Divergencia respecto a main actual
Comparación `main...HEAD-V9`:
- status: diverged;
- V9 ahead_by: 657;
- V9 behind_by: 50;
- merge-base: `d78f02ff7253e7abc5b6d06e017d1514ab2bb253`.

Por tanto, `main` NO es ancestro del HEAD V9 actual y F00 sigue abierto.

## 3. Delta de main desde merge-base

Desde el merge-base hasta `main`:
- 50 commits;
- 213 archivos en el compare consultado.

Áreas relevantes:
- UI premium;
- Aprende;
- MiniWeb v2;
- rutas;
- schemas/queries;
- migraciones D1;
- docs;
- tests;
- configuración/Worker.

No asumir que estos cambios pueden descartarse porque el PR V9 tenga más commits.

## 4. Overlap exacto de rutas de archivo

El compare estático localizó 10 rutas modificadas tanto por main como por la rama V9:

1. `.github/workflows/main-integration-quality.yml`
2. `vecidya-platform/app/app.css`
3. `vecidya-platform/app/routes.ts`
4. `vecidya-platform/app/routes/business-profile.tsx`
5. `vecidya-platform/app/styles/vecidya-polish.css`
6. `vecidya-platform/db/migrations/meta/_journal.json`
7. `vecidya-platform/docs/ROADMAP.md`
8. `vecidya-platform/docs/STATUS.md`
9. `vecidya-platform/docs/STRUCTURE.md`
10. `vecidya-platform/docs/TESTING.md`

Esto NO significa que solo existan diez conflictos semánticos: archivos diferentes pueden tocar contratos compartidos.

## 5. Bloqueo P0 — colisión de numeración de migraciones

### main
Después de 0029:
- 0030 business-profile TikTok/YouTube
- 0031 Learn access grant
- 0032 Learn personal progress
- 0033 Learn sync operations
- 0034 MiniWeb v2 draft/publication
- 0035 MiniWeb v2 multiple sites
- 0036 MiniWeb v2 publication slots
- 0037 MiniWeb v2 conversion provenance

### rama V9
Después de 0029:
- 0030 diagnostic V9 audit
- 0031 diagnostic V9 identity/ownership
- 0032 diagnostic V9 claim guards
- 0033 diagnostic V9 owner assignment guards
- 0034 diagnostic V9 identity claim integrity
- 0035 diagnostic V9 result finalization guards

Los prefijos **0030–0035 están duplicados con migraciones distintas**.

Además, `db/migrations/meta/_journal.json` es un archivo exacto modificado en ambos lados.

### Riesgos
- orden de migración ambiguo;
- journal incoherente;
- ambientes con historia divergente;
- aplicar una migración distinta bajo el mismo ordinal;
- pérdida de Learn/MiniWeb o V9 al resolver por “ours/theirs”.

## 6. Decisión previa obligatoria sobre migraciones

Antes de integrar:

1. verificar qué migraciones 0030+ están aplicadas en cada entorno autorizado;
2. no renumerar una migración que ya haya sido aplicada sin plan explícito;
3. si las migraciones V9 NO fueron aplicadas en ningún entorno compartido:
   - propuesta preferida: renumerarlas después del último ordinal de `main` al momento de integración;
4. si alguna V9 ya fue aplicada:
   - diseñar reconciliación compatible con esa historia;
   - no editar silenciosamente una migración aplicada;
5. regenerar/reconciliar journal según herramienta real;
6. validar schema resultante con pruebas focales autorizadas.

**No ejecutar ninguno de estos pasos durante PLAN_ONLY.**

## 7. Propuesta DEC-H1 — estrategia Git

Cuando se autorice F00:

### Preparación
- capturar HEAD main y V9;
- verificar backup/ref de seguridad;
- worktree aislado;
- working tree limpio;
- no force-push.

### Dirección
**Propuesta:** integrar `main` hacia la rama V9, no V9 hacia main.

Objetivo:
- hacer `main` ancestro de la rama V9;
- conservar historial de ambos;
- resolver conflictos en el contexto del PR draft;
- no alterar producción.

### Prohibido
- mergear PR #162 a main durante F00;
- resetear main;
- elegir “ours” globalmente;
- rebase destructivo sin necesidad/aprobación;
- borrar features main para simplificar conflictos.

## 8. Propuesta DEC-H2 — prioridad de resolución

### Main prevalece por defecto en productos adyacentes
- Aprende;
- MiniWeb;
- perfil/Vecindario;
- UI premium general;
- schemas no V9;
- rutas no diagnósticas.

### V9 prevalece solo en su frontera autorizada
- módulos V9/QA03B objeto del PR;
- docs/plans V9;
- migraciones V9 reconciliadas;
- rutas V9 cuando no destruyan cambios main.

### Archivos compartidos
Resolver semánticamente:
- `routes.ts`: conservar rutas main + rutas V9.
- `app.css` / polish: no perder UI premium main; integrar solo estilos diagnósticos necesarios.
- docs: fusionar estados, no reemplazar.
- workflow: preservar checks main y añadir solo checks V9 aprobados.
- journal: resolver por historia real de migraciones, nunca manualmente por conveniencia.

## 9. Propuesta DEC-H3 — tests después de integración

La primera verificación tras F00 debe ser **focalizada por archivos afectados**, siguiendo la instrucción vigente del usuario.

Orden:
1. typecheck/build solo si el gate F00 lo requiere y está autorizado;
2. pruebas unitarias de contratos compartidos tocados;
3. pruebas V9 afectadas por conflicto;
4. pruebas Learn/MiniWeb solo donde hubo overlap/dependencia;
5. CI de integración únicamente después del set focal local/autorizado.

No usar una suite general como primera herramienta de diagnóstico.

## 10. V8 permanece activo

Hasta F08 certificado + aprobación de corte:

- rutas V8 siguen operativas;
- no borrar QBV2/legacy por parecer reemplazado;
- no eliminar tests legacy que todavía protejan consumidores;
- no cambiar default público a V9;
- no migrar historial destructivamente.

F09 es la fase de switch/limpieza, no F00.

## 11. Gate de staging

Antes de staging V9:

- DEC-A–G aprobadas/diferidas con fallback;
- F02–F08 gates completos;
- banco/scoring/replay con identidades explícitas;
- migraciones reconciliadas;
- ownership/privacy;
- C01–C10 focal PASS;
- rollback definido.

Staging no convierte automáticamente el sistema en production-ready.

## 12. Gate de producción

Producción requiere autorización separada:

1. staging PASS sobre SHA exacto;
2. migraciones verificadas;
3. smoke real;
4. piloto/aceptación;
5. observabilidad;
6. rollback probado;
7. respaldo;
8. instrucción explícita de merge/deploy/corte.

## 13. Rollback propuesto

### Antes de migraciones irreversibles
- rollback de código/flag a V8;
- V9 permanece dark/off.

### Datos
- nunca depender de “borrar migraciones aplicadas” como rollback;
- preferir migraciones forward-compatible;
- preservar datos históricos;
- cualquier nueva tabla V9 debe poder quedar sin consumidor sin romper V8.

### UI/routing
- feature flag/version gate;
- V8 es fallback operativo hasta cierre.

## 14. Stop conditions F00/F09/F10

Detener si:
- main avanza durante integración y cambia base materialmente;
- aparece migración aplicada con ordinal colisionado;
- no puede preservarse Learn/MiniWeb;
- conflicto altera contratos fuera de V9;
- test focal falla;
- PR deja de ser reproducible;
- cambio requiere force-push/destrucción;
- rollback no está claro;
- autorización no cubre el paso siguiente.

## 15. Casos futuros — NO EJECUTADOS

| ID | Caso | Esperado |
|---|---|---|
| H01 | merge main→V9 | main queda ancestro |
| H02 | routes.ts | conserva main + V9 |
| H03 | Learn changes | no regresión por merge V9 |
| H04 | MiniWeb changes | no regresión por merge V9 |
| H05 | migration numbering | secuencia única/reconciliada |
| H06 | journal | corresponde a migraciones finales |
| H07 | V8 route | sigue activa antes de corte |
| H08 | V9 flag off | V8 funciona |
| H09 | staging fail | no producción |
| H10 | rollback | vuelve a V8 sin pérdida histórica |
| H11 | main avanza durante trabajo | revalidar/repetir gate |
| H12 | prod authorization absent | no deploy |

## 16. Decisión humana requerida

DEC-H puede pasar a APPROVED cuando se confirme:

1. merge main→rama V9 como dirección;
2. no force-push;
3. prioridad main en productos adyacentes;
4. resolución semántica de archivos compartidos;
5. estrategia de migraciones tras verificar qué está aplicado;
6. pruebas focales primero;
7. V8 permanece activo hasta F09;
8. staging/piloto/rollback;
9. autorización separada de producción;
10. stop conditions.

## 17. Estado

**DEC-H = READY_FOR_HUMAN_REVIEW / NO APROBADO.**

Estado Git actual:
- PR #162 draft/open/dirty;
- rama V9 50 commits detrás de main y 657 delante desde merge-base;
- migraciones 0030–0035 colisionan nominalmente con migraciones distintas de main.

## Changelog

- **0.1.0 / 2026-11-01:** revalidación Git actual, overlap de archivos, colisión de migraciones 0030–0035 y estrategia futura de integración/corte.
