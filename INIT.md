## What I understand
Vecidya is an actively developed, Spanish-language multi-tenant platform. Product code lives in `vecidya-platform/`; this repository also contains the A Team agent and skill package for project-scoped engineering workflows. The current authorized checkpoint is Admin organization-list pagination, sorting, and URL-backed filters. Product state and security rules are defined by the repository instructions and the canonical Vecidya docs.

# INIT.md — Vecidya Platform

> Project-specific A Team setup. Review against repository instructions when the stack or workflow changes.

## Project Overview

**Name:** Vecidya Platform
**Type:** Web application / SaaS platform
**Status:** Active development
**Description:** Spanish-language multi-tenant platform with a public site, authenticated business workspace, and internal platform administration.

## Languages & Stack

- [x] TypeScript / JavaScript
- [x] Python (A Team tooling)
- [ ] Kotlin
- [ ] Swift
- [ ] Go
- [ ] Rust
- [ ] Flutter / Dart

**Framework / UI:** React, React Router, Vite
**Runtime / infrastructure:** Node.js for development; Cloudflare Workers for the application
**Database:** Cloudflare D1 (SQLite) through Drizzle; `vecidya-platform/db/schema/` is the source of truth, with versioned SQL migrations
**Build system:** pnpm 11.21.0; Node.js >=22.12.0
**CI/CD:** GitHub Actions

## Quality and Security Scope

**E2E tests:** Yes; local Worker and isolated D1 only unless a specific remote test is explicitly authorized.
**Authentication or user data:** Yes; tenant resources require session, membership, permission, and organization scoping.
**Production environment:** Yes. Code is not considered published without a dated anonymous HTTP check.
**LLM API calls:** Outside the current Admin checkpoint; verify integrations before activating AI-specific agents.
**Compliance scope:** Legal/privacy review is tracked in the canonical project status; do not infer a certification or legal conclusion.

## Active AI Platforms

- [x] Codex (desktop / CLI tooling)
- [ ] Claude Code
- [ ] Cursor
- [ ] OpenCode

## Non-Negotiable Rules

- Follow the root `AGENTS.md` and `vecidya-platform/docs/GOVERNANCE.md`.
- Product development belongs in `vecidya-platform/`. Use a dedicated branch and worktree based on freshly fetched `origin/main`; do not work directly on `main`.
- Read `STATUS.md`, `PROJECT_STATE.md`, and the affected specialized document before changing product code; reconcile code and canonical documentation in the same delivery.
- Internal platform actions require an active platform membership, an explicit target organization, action permission, and audit. Never impersonate a client owner or weaken tenant guards.
- Do not create a CRM that duplicates GoHighLevel, import Legacy architecture, invent commercial data, or associate a business with a third-party brand without authorization.
- Do not use Wrangler remote operations or deploy without explicit authorization. Do not describe local or merged code as published without dated anonymous HTTP evidence.
- Preserve existing user changes. Stage only files owned by the current checkpoint.

## Current Work Context

The authorized next Admin scale checkpoint is `/app/internal/organizations`: server-side search and profile filtering, stable ordering, pagination, and query-string state. Services and Integrations scaling, remaining operational error states, and the broader accessibility audit remain separate work.

## A Team Scope

Keep the orchestrator, code reviewer, security reviewer, database reviewer, and TypeScript reviewer available. Activate only workflow skills relevant to the current project and checkpoint; retain installed profiles when inactive.
