# Vecidya

Repositorio de Vecidya. El producto activo vive **únicamente** en [`vecidya-platform/`](vecidya-platform/README.md): una plataforma SaaS sobre TypeScript, React Router SSR y Cloudflare Workers (D1 + Drizzle + Better Auth).

## Contenido de este repositorio (verificado 2026-09-20)

| Ruta | Estado |
| --- | --- |
| `vecidya-platform/` | Producto activo. Todo el desarrollo ocurre aquí. |
| `AGENTS.md` | Reglas ejecutables para agentes. |
| `legacy/` | Prototipo web Astro anterior. Ignorado por Git (`.gitignore`) y **no presente en este clon**; solo referencia de contenido/visual si existe localmente. |
| `archive/`, `resources/` | **Eliminados del árbol** en el commit `ec79b22` (2026-09-07): snapshots históricos y biblioteca de assets de marca. Recuperables desde el historial Git (`git show ec79b22^:resources/assets/...`). |

## Cómo orientarse

1. Lee [`vecidya-platform/docs/STATUS.md`](vecidya-platform/docs/STATUS.md) para el estado corto y la deuda abierta.
2. Lee [`vecidya-platform/docs/PROJECT_STATE.md`](vecidya-platform/docs/PROJECT_STATE.md) para el snapshot técnico completo.
3. Lee [`AGENTS.md`](AGENTS.md) antes de modificar nada.
4. El índice completo de documentos está en [`vecidya-platform/README.md`](vecidya-platform/README.md#documentación).

## Punto de partida vigente

**Baseline 2026-09-20.** Los documentos canónicos describen el código y las pruebas tal como existen en `main`, no planes históricos. Este repositorio contiene únicamente el snapshot actual del proyecto; las dependencias generadas y los secretos permanecen excluidos por `.gitignore`.
