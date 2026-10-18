# Reconciliación de los ocho commits de main — Fase 00

Fecha: 2026-10-18. Comparación GitHub `integration/phase-00-main-reconcile...main`: **8 commits en main que no figuran en la ascendencia de integración**. Esto no significa ocho cambios funcionales ausentes.

## Auditoría por archivos

Se contrastaron los SHA de los 17 archivos que GitHub lista como modificados al comparar desde integración hacia main:

- **Idénticos en ambas ramas (9):** `.devcontainer/devcontainer.json`, `AGENTS.md`, `app/content/learn.ts`, `docs/ENVIRONMENTS.md`, `docs/GOVERNANCE.md`, ambos SVG de Aprende, `tests/e2e/learn-experience-check.mjs` y `tests/unit/learn-content.test.ts`.
- **Distintos (8):** `.github/workflows/vecidya-ci.yml`, `docs/ARCHITECTURE.md`, `docs/CHANGELOG.md`, `docs/DATABASE.md`, `docs/PROJECT_STATE.md`, `docs/ROADMAP.md`, `docs/STATUS.md`, `docs/TESTING.md`.

## Decisión de resolución propuesta

1. **Código Aprende, SVG, devcontainer y AGENTS:** ya coinciden byte a byte (SHA blob idéntico); preservar tal cual.
2. **Workflow CI:** preservar versión de integración, que fija toolchain, SHA de acciones, `pipefail` y checkout sin credenciales.
3. **Documentación:** preservar la versión de integración como estado vigente; las diferencias de main incluyen notas históricas sobre D1 0000–0017, APP-MINI-02B y checkpoints locales que deben permanecer trazables en el historial de Git. No sustituir el estado nuevo por snapshots históricos sin revisar.
4. **Historia Git:** los ocho commits de main aún requieren una operación de reconciliación de ascendencia (merge no fast-forward o equivalente), con revisión del diff final y sin sobrescribir los archivos resueltos.
5. **Certificación:** tras reconciliar, repetir unitarias, typecheck, build, migraciones locales y E2E; ningún PASS previo certifica automáticamente el nuevo SHA.

## Bloqueos y restricciones

La revisión de contenido no equivale a un merge. **No fusionar a main** ni desplegar antes de comprobar CI y los gates G00-01 a G00-10. Las notas históricas que aparezcan solo en main deben conservarse mediante su historial y, si afectan decisiones vigentes, actualizar explícitamente los documentos canónicos antes de aprobar el PR.
