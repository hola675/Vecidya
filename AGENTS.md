# Agent Instructions

## Non-Negotiable Governance

- Follow `vecidya-platform/docs/GOVERNANCE.md` for every change.
- Read `STATUS.md` (capability matrix + Open Debt) and `PROJECT_STATE.md` before implementing; read the affected specialized document too.
- Executable evidence (code, schema, migrations, tests, configuration, validation output) outranks any document. Conversations and prior agent reports are not evidence.
- Keep code and documentation in the same delivery; reconcile affected documents before reporting completion.
- Do not represent planned, partial, local-only, or undocumented behavior as implemented, published, validated, or secure. "Published" requires a dated anonymous HTTP check.
- Keep agent instructions in English; write product documentation, implementation work, and final reports in Spanish unless the user requests otherwise.
- Do not introduce fictitious commercial data, create a CRM that duplicates GHL, or import Legacy architecture.
- Do not assume authorization to associate a business with a third-party brand (for example SURA) because a name appears in text.
- Require session, membership, and permission checks for every organization-scoped resource.
- The Markdown ceiling is 20 canonical documents (currently 16; list in `GOVERNANCE.md`). Do not create phase, audit, ADR, or report files; consolidate into the existing document that owns the topic.

## Scope

- Do not work directly on `main`; start each checkpoint from freshly fetched `origin/main` in a dedicated branch and Git worktree.
- Before branching, run `git status`, `git branch -vv`, then `git fetch origin`; preserve other agents' staged/unstaged changes and never switch a dirty shared checkout.
- Use `feat/app-mini-02b`, `feat/diagnostic-<checkpoint>`, `feat/aprende-<checkpoint>`, `fix/<id>`, or `docs/<id>`; each worktree has one owner.
- After validation, stage only owned files, commit, `git push -u origin <branch>`, and open a PR to `main`; this authorization covers only the user's authorized checkpoint. Merge only via PR when checks pass, conflicts are absent, and authorized; verify the integrated SHA and clean only an owned clean worktree.
- Never force-push `main` or deploy as part of a merge. See `vecidya-platform/docs/GOVERNANCE.md` for migration and concurrency rules.
- Develop the product only in `vecidya-platform/`.
- `legacy/` is git-ignored and absent from this clone; if present locally it is read-only reference material.
- `archive/` and `resources/` were removed from the tree in commit `ec79b22`; recover from Git history only if the user asks.
- Do not implement work beyond the phase or block explicitly requested. The authorized next block is named in `ROADMAP.md`.
- Complete the requested objective before ending a turn; if a real blocker prevents it, report the exact blocker and the remaining work.

## Runtime and Package Manager

- Node.js `>=22.12.0`; pnpm `11.21.0`; never generate npm or Yarn lockfiles.
- Run project commands from `vecidya-platform/`.

## Commands

| Task | Command |
| --- | --- |
| Install dependencies | `pnpm install` |
| Local development | `pnpm run dev` |
| Regenerate Cloudflare types (after editing `wrangler.jsonc`) | `pnpm run cf-typegen` |
| Typecheck | `pnpm run typecheck` |
| Production build | `pnpm run build` |
| Generate a migration | `pnpm drizzle-kit generate --name=<name>` |
| Apply local migrations | `pnpm wrangler d1 migrations apply DB --local` |
| Query local D1 | `pnpm wrangler d1 execute DB --local --command "<sql>"` |

There is no `test` script. E2E scripts live in `tests/e2e/`; read `vecidya-platform/docs/TESTING.md` before running any of them. `remote-staging-*` tests target the public domain and must not be run without explicit authorization.

## Database Rules

- `vecidya-platform/db/schema/` is the source of truth; generate and commit SQL migrations under `db/migrations/`.
- Create Drizzle clients only through `db/client.server.ts`; keep reusable queries in `db/queries/`.
- Do not use `drizzle-kit push` as the normal workflow.
- Use the D1 binding name `DB` for local commands; the name `vecidya-dev` is obsolete.
- Do not use Wrangler `--remote` without explicit user authorization. Never modify a remote schema manually or commit secrets.

## Secrets

- Do not read, print, or commit `.env*` or `.dev.vars`. Environment variable names are documented in `ENVIRONMENTS.md`.

## Validation

- After changing `wrangler.jsonc`, run `pnpm run cf-typegen`.
- Before committing application changes, run `pnpm run typecheck` and `pnpm run build`; run `git diff --check`.
- Validate Worker-facing behavior through the real local Cloudflare runtime.
- Do not deploy unless the user explicitly requests it: `wrangler deploy` publishes directly to `vecidya.com`.

## Visual assets

- Add photographic or complex raster assets in an optimized modern format (prefer WebP when suitable); keep SVG for vector artwork.
- Avoid oversized originals and unnecessary duplicates; preserve transparency, dimensions, and visual quality required by the layout.
- Before removing an original, verify references, build output, asset responses, and visual rendering.

## Versioning and publication policy

- The application version is the `version` field in `vecidya-platform/package.json`; do not duplicate or hard-code release versions in layouts.
- Public pages, `/app`, and `/app/internal` must render the shared version footer from `app/components/platform-footer.tsx`, including `© 2026 Vecidya`.
- A version is **published** only after the requested deploy completes and a dated anonymous HTTP check confirms the public domain; code or Git state alone is not publication evidence.
- Record version, deploy status, migration status, and HTTP evidence in `vecidya-platform/docs/ENVIRONMENTS.md` and the relevant entry in `vecidya-platform/docs/CHANGELOG.md`.
- Never publish a pilot profile automatically; follow the readiness and authorization gates in `vecidya-platform/docs/ROADMAP.md` and `STATUS.md`.

## References

| Need | File |
| --- | --- |
| Repository boundaries | `README.md` |
| Platform setup and document index | `vecidya-platform/README.md` |
| Governance, status vocabulary, baseline procedure | `vecidya-platform/docs/GOVERNANCE.md` |
| Capability matrix and Open Debt | `vecidya-platform/docs/STATUS.md` |
| Full technical snapshot | `vecidya-platform/docs/PROJECT_STATE.md` |
| Architecture and boundaries (incl. Vecidya ↔ GHL) | `vecidya-platform/docs/ARCHITECTURE.md` |
| Repository map and route inventory | `vecidya-platform/docs/STRUCTURE.md` |
| Data model and migrations | `vecidya-platform/docs/DATABASE.md` |
| Environments and what is published | `vecidya-platform/docs/ENVIRONMENTS.md` |
| Tests: inventory, coverage, how to run | `vecidya-platform/docs/TESTING.md` |
| Future work only | `vecidya-platform/docs/ROADMAP.md` |
| History | `vecidya-platform/docs/CHANGELOG.md` |
