# Gobierno documental

Última reconciliación: 2026-09-20 (Baseline 2026-09-20).

## Propósito

Código, migraciones, pruebas, configuración y documentación forman una sola entrega. Una afirmación de estado solo es válida cuando coincide con evidencia ejecutable del repositorio. Este documento define cómo se trabaja y cómo se reconcilia el proyecto; no describe el producto (ver `PROJECT_STATE.md`).

## Jerarquía de fuentes de verdad

1. Código, schema, migraciones y pruebas ejecutadas, configuración efectiva y resultado de validaciones.
2. Historial Git (`git log`, `git diff`), como evidencia de qué existe y cuándo cambió.
3. [STATUS.md](STATUS.md), como representación documental resumida de la evidencia.
4. [ARCHITECTURE.md](ARCHITECTURE.md), para decisiones estructurales vigentes.
5. Documentación especializada activa.
6. [ROADMAP.md](ROADMAP.md), exclusivamente para trabajo futuro.
7. Conversaciones, informes de agentes, propuestas e ideas: **nunca son evidencia por sí solos**.

Ante una contradicción se corrige primero la documentación; no se modifica código solo para hacer verdadera una afirmación histórica.

## Niveles de evidencia

Toda afirmación de estado que importe indica su nivel: `CODE` (fuente inspeccionada), `TEST` (prueba versionada que la protege), `RAN` (comando ejecutado en el corte, con resultado), `CONFIG` (configuración efectiva), `GIT` (historial), `HTTP` (petición anónima de solo lectura a un entorno público, con fecha) y `DOC` (afirmación documental no reverificada). Una afirmación solo respaldada por `DOC` se marca como tal y no puede figurar como «funciona» ni «publicado».

## Ciclo obligatorio de cambio

```text
Leer → definir alcance → implementar → validar → reconciliar documentación → revisar diff → reportar → commit
```

Antes de implementar se leen `PROJECT_STATE.md`, `STATUS.md` y la documentación especializada afectada. Si aparece una contradicción, riesgo, deuda, bug o dependencia nueva, se documenta sin ampliar silenciosamente el alcance; si bloquea la fase, se informa como bloqueo.

## Documentos canónicos

El proyecto mantiene un **máximo de 20 documentos Markdown activos**; hoy son **16** (recuento verificado en REL-004A; `PRODUCT.md` se sumó el 2026-10-01 con autorización del usuario). No se crea un documento por fase, auditoría o hallazgo: se consolida en el que ya tiene esa responsabilidad. OPS-001 es una excepción autorizada por el usuario porque requiere una matriz operativa autónoma antes de implementar integración. Crear otro documento exige un vacío real que no pueda resolverse actualizando otro, y autorización del usuario.

> **Precedente (REL-004A):** `docs/UX-003-APP-ADMIN-AUDIT.md` se creó como informe de una sola fase y entró en el release `0.4.1` sin figurar en esta tabla. En lugar de promoverlo a documento canónico se consolidó su contenido único en `ROADMAP.md` (fases UX-003 pendientes) y `STATUS.md` (`ADMIN-SCALE-001`, `ADMIN-A11Y-001`) y se retiró del árbol; sigue recuperable desde `41986a4`. La regla se mantiene: una auditoría de fase no se conserva como documento permanente.

| Documento | Responsabilidad única |
| --- | --- |
| `AGENTS.md` (raíz) | Reglas ejecutables para agentes |
| `README.md` (raíz) | Qué es el repositorio y cómo orientarse |
| `vecidya-platform/README.md` | Puesta en marcha de la plataforma e índice de documentos |
| `docs/STATUS.md` | Estado corto: matriz de capacidades, fases cerradas, **Open Debt** |
| `docs/PROJECT_STATE.md` | Snapshot técnico completo del producto actual |
| `docs/ARCHITECTURE.md` | Decisiones y fronteras arquitectónicas vigentes |
| `docs/STRUCTURE.md` | Mapa del repositorio, módulos e inventario de rutas |
| `docs/DATABASE.md` | Modelo de datos, migraciones y aislamiento tenant |
| `docs/ENVIRONMENTS.md` | Local / Development / Staging / Public / Production, variables y secretos |
| `docs/TESTING.md` | Inventario de pruebas, cómo ejecutarlas, cobertura real y gaps |
| `docs/GOVERNANCE.md` | Cómo trabajar y reconciliar (este documento) |
| `docs/ROADMAP.md` | Solo trabajo futuro real |
| `docs/CHANGELOG.md` | Historia relevante ya realizada |
| `docs/business/VECIDYA_PRODUCT_CATALOG.md` | Matriz comercial de productos, niveles y consumos |
| `docs/OPS-001-GHL-PILOT-FOUNDATION.md` | Fundación operativa y contractual del piloto HighLevel |
| `vecidya-platform/PRODUCT.md` | Verdad de producto para el trabajo de diseño (usuarios, propósito, posicionamiento, voz, evidencia disponible, accesibilidad); lo lee la skill `impeccable`. No registra estado de implementación |

## Vocabulario de estados

**Capacidades** (matriz de `STATUS.md`): `PASS` (código + UI + datos + prueba versionada que la protege), `PARTIAL` (existe pero incompleta, o sin prueba versionada, o solo en local), `BLOCKED` (impedida por dependencia externa o decisión pendiente), `NOT IMPLEMENTED`.

**Fases de trabajo**: `NO INICIADA`, `EN PROGRESO`, `BLOQUEADA`, `IMPLEMENTADA`, `PASS TÉCNICO`, `CERRADA`. Implementado, probado, validado, seguro, PASS y cerrado no son equivalentes: cada uno exige evidencia concreta. Una fase solo es `CERRADA` con implementación, aceptación, validaciones, reconciliación documental, revisión del árbol y deuda registrada.

**Publicación**: una capacidad solo figura como *publicada* si una comprobación `HTTP` fechada lo respalda; en otro caso es *local* o *no verificada*.

## Reconciliación mínima

| Cambio | Documentación obligatoria |
| --- | --- |
| Estado de fase o capacidad | `STATUS.md` |
| Arquitectura | `ARCHITECTURE.md` (ADR nuevo solo con autorización) |
| Schema o migración | `DATABASE.md` |
| Variable, binding o despliegue | `ENVIRONMENTS.md` |
| Prueba nueva o cambio de cobertura | `TESTING.md` |
| Ruta nueva o cambio de guardas | `STRUCTURE.md` |
| Cambio relevante | `CHANGELOG.md` |
| Estado global o trabajo futuro | `PROJECT_STATE.md` y/o `ROADMAP.md` |

## Procedimiento de baseline

Un baseline (como el de 2026-09-20) se ejecuta en modo solo lectura: leer repositorio, contrastar cada documento con el código, correr `typecheck`, `build` y las pruebas locales seguras, registrar `git status`/ahead-behind, comprobar el estado público solo con peticiones anónimas de solo lectura, corregir la documentación y reportar. Un baseline **no** implementa producto, no crea migraciones para hacer coincidir documentación y no despliega.

## Límites permanentes

- No introducir datos comerciales ficticios para aparentar una UI completa.
- Legacy se usa para contenido, assets y referencia; nunca como arquitectura base de la plataforma nueva.
- Vecidya no implementa CRM paralelo a GHL. No crear `contacts`, `leads`, `opportunities`, `pipelines`, `crm_messages` ni `workflow_executions` sin una decisión arquitectónica posterior.
- Una integración futura puede guardar solamente metadata de conexión justificada y tenant-scoped.
- Todo recurso de organización debe verificar, en orden: sesión, membresía, rol o permiso y operación.
- No asumir autorización de asociación con marcas de terceros por la existencia de un nombre comercial.
- Toda deuda abierta figura en `STATUS.md → Open Debt` con ID, impacto, evidencia, prioridad y estado.

## Definition of Done documental

Antes de reportar una tarea: alcance confirmado, datos no ficticios, seguridad tenant cuando aplique, migraciones y documentación afectada, validaciones ejecutadas u omitidas con motivo, `STATUS.md`, deuda, contradicciones, diff y estado del árbol. El reporte final indica qué documentación cambió o por qué no fue necesaria.
