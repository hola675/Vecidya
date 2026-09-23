# Vecidya Platform

Aplicación full-stack de Vecidya sobre React Router (SSR) y Cloudflare Workers. Vecidya ayuda a negocios locales y profesionales a construir presencia digital y a formar parte de un directorio público (el **Vecindario**). No es un CRM: GHL conserva contactos, leads y seguimiento comercial.

## Stack real

- TypeScript de extremo a extremo; React 19, React Router 8 (SSR), Vite 8, Tailwind CSS 4.
- Cloudflare Workers como runtime; entry point `workers/app.ts`.
- D1 + Drizzle ORM (`db/`) para datos relacionales.
- Better Auth 1.6 (email + contraseña, plugin Organization) para identidad, sesiones y tenancy.
- **No implementados:** R2, Durable Objects, Queues, Workflows, pagos, integración con GHL (solo existe metadata genérica de conexión).

El estado exacto de cada capacidad está en [docs/STATUS.md](docs/STATUS.md) y [docs/PROJECT_STATE.md](docs/PROJECT_STATE.md); este README no lo repite.

## Estructura

```text
app/       rutas, componentes, estilos y features/diagnostic (motor puro del Diagnóstico)
server/    autenticación, autorización, validación y correo de invitaciones
db/        schema Drizzle, consultas, migraciones SQL y seeds
workers/   entry point del Worker
public/    assets públicos
tests/     E2E host-side y unitarias del Diagnóstico en tests/unit (tests/integration está vacío)
docs/      documentación canónica
```

Detalle en [docs/STRUCTURE.md](docs/STRUCTURE.md).

## Desarrollo local

Requisitos: Node `>=22.12.0`, pnpm `11.21.0`.

```powershell
pnpm install
pnpm run cf-typegen   # solo tras cambiar wrangler.jsonc
pnpm run dev
pnpm run typecheck
pnpm run build
pnpm run test:unit    # unitarias del motor de Diagnóstico (sin servidor)
```

No hay script `test` global: `pnpm run test:unit` ejecuta las unitarias del motor de Diagnóstico y las pruebas E2E son scripts independientes contra un Worker local; ver [docs/TESTING.md](docs/TESTING.md). **No ejecutes `wrangler deploy` ni comandos `--remote` sin autorización explícita**: `wrangler deploy` publica directamente en `vecidya.com`.

## Documentación

| Necesidad | Documento |
| --- | --- |
| Estado corto, matriz de capacidades y deuda abierta | [docs/STATUS.md](docs/STATUS.md) |
| Snapshot técnico completo del producto | [docs/PROJECT_STATE.md](docs/PROJECT_STATE.md) |
| Arquitectura y fronteras (incl. Vecidya ↔ GHL) | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) |
| Mapa del repositorio e inventario de rutas | [docs/STRUCTURE.md](docs/STRUCTURE.md) |
| Modelo de datos y migraciones | [docs/DATABASE.md](docs/DATABASE.md) |
| Entornos, variables y qué está publicado | [docs/ENVIRONMENTS.md](docs/ENVIRONMENTS.md) |
| Pruebas: inventario, cobertura y cómo correrlas | [docs/TESTING.md](docs/TESTING.md) |
| Cómo trabajar y reconciliar | [docs/GOVERNANCE.md](docs/GOVERNANCE.md) |
| Trabajo futuro | [docs/ROADMAP.md](docs/ROADMAP.md) |
| Historia relevante | [docs/CHANGELOG.md](docs/CHANGELOG.md) |
| Catálogo comercial de productos | [docs/business/VECIDYA_PRODUCT_CATALOG.md](docs/business/VECIDYA_PRODUCT_CATALOG.md) |
| Fundación documental del piloto GHL | [docs/OPS-001-GHL-PILOT-FOUNDATION.md](docs/OPS-001-GHL-PILOT-FOUNDATION.md) |

Reglas para agentes: [../AGENTS.md](../AGENTS.md).
