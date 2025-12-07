<!-- Copilot / AI agent instructions for `nest-backend-libs` -->

# Quick orientation

- **Purpose:** This repository is a collection of reusable NestJS modules and utilities used across projects (see `README.md`). It's packaged as a library (`type: module`) and built to `dist/` with `tsc`.
- **Primary modules:** `src/authorization`, `src/authzclient`, `src/configuration`, `src/core-config`, `src/database-postgres`, `src/database-sqlite`, `src/invitations`, `src/logger`, `src/organisation*`, `src/stripe-client`, `src/open-api-generation`, `src/root-app`, and CLI helpers under `src/runningCommandLine`.
- **Entrypoint / exports:** `src/index.ts` explicitly re-exports modules and symbols consumers rely on. When adding or renaming exports, update this file.

# Build / test / local usage (concrete commands)

- Install & package manager: this repo expects `pnpm` (scripts use `pnpm`).
- Build: `pnpm run build` — runs `tsc --project tsconfig.build.json`, then copies open-api generation assets via `copyOpenApiGenerationModule`.
- Clean: `pnpm run clean` (removes `dist/`).
- Test: `pnpm test` (script sets `NODE_OPTIONS` and runs `jest --runInBand`). If running manually, preserve the `NODE_OPTIONS` from `package.json`.
- Lint: `pnpm run lint` (uses ESLint configured project-wide). Quick lint without failing unmatched patterns: `pnpm run lintone`.
- Format: `pnpm run prettier` (targets `src/*`).
- Local consumption for testing: the README shows linking locally: `pnpm add ../../../nest-backend-libs --force` from a downstream project.

# Important project conventions

- ESM / TypeScript: `package.json` has `type: "module"`. Source imports in `src/` currently reference `.js` in built output (see `src/index.ts`), so builds must produce ESM `dist/` files with `.js` extensions.
- Barrel exports are explicit: `src/index.ts` re-exports many symbols. When you add public API symbols, export them here.
- Nest module layout: each feature normally follows `module.ts`, `*.service.ts`, `*.controller.ts`, plus `dto/` and `entities/` subfolders. Mirror existing modules when adding new functionality.
- Packaging: library declares many packages as `peerDependencies` (Nest and TypeORM). Do not upgrade Nest major versions in this package without considering downstream compatibility.

# Patterns and examples to reference

- Authorization: see `src/authorization/authz.module.ts`, `src/authorization/guards/*`, and `src/authorization/strategies/*` for authentication and guard patterns.
- Database: Postgres and SQLite providers live in `src/database-postgres` and `src/database-sqlite`. Look at `PostgresDatabase.module.ts` and `PostgresTypeOrmConfigurationProvider.ts` to follow how TypeORM configs are provided.
- Open API generation: `src/open-api-generation/generate.sh` and the `copyOpenApiGenerationModule` script in `package.json` — the build must copy the shell and templates into `dist/` for the `generate-client` bin to work.
- Stripe: environment variables and webhook handling are documented in `README.md`; relevant code is in `src/stripe-client` and the README includes local webhook testing commands using the Stripe CLI.

# Environment & runtime notes

- Node engine requirement: engine field requires Node >= `22.13.1`.
- Tests may be memory-heavy; the `test` script sets `--max-old-space-size=8192`.
- Many features rely on environment variables (Stripe keys, Auth0, DB connection strings). See module-specific `*ConfigurationService.ts` for required env keys (for example: `src/invitations/InvitationConfigurationService.ts`, `src/logger/LoggingConfigurationService.ts`).

# Guidance for AI edits

- When adding or moving exports, always update `src/index.ts` to keep the public API consistent.
- If you add files that must be present in `dist/` at runtime (scripts, templates), ensure `copyOpenApiGenerationModule` will include them or add to that script.
- Prefer following existing folder structure (`controllers`, `services`, `dto`, `entities`) and naming (`<feature>.module.ts`). Use existing modules as templates.
- Keep `peerDependencies` aligned with Nest 11 and TypeORM 0.3.x unless downstream projects are also updated.

# Quick checklist for PRs

- Run `pnpm run lint` and `pnpm run build` locally.
- Confirm `dist/` contains any runtime assets (scripts/templates) required by bins (`miller`, `generate-client`).
- Add or update exports in `src/index.ts` when you change public APIs.
- Update `README.md` when adding new public modules or new env vars.
- use semantic commit messages and PR titles for changelog generation. e.g `feat: add new authorization guard for roles`. fix or chore or docs.

---

If anything here is unclear or you'd like the instructions to be more/less prescriptive (for example: stricter testing steps or CI hints), tell me which areas to expand and I'll iterate.
