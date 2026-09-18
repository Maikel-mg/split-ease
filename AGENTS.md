# AGENTS.md

## Project

Shared-expense manager (groups, expenses, simplified debt settlement).
Next.js App Router + Supabase (Postgres/Auth) + TypeScript + Tailwind/shadcn.

Layers: `core/` (entities, ports, services, use-cases) -> `data/` (repositories) -> `app/` (routes, server actions)

### Commands

`pnpm` is the intended package manager (`pnpm-lock.yaml`), but it is not
installed on every machine in this project. `npm run <script>` runs the same
`package.json` scripts and is a drop-in fallback.

- `pnpm dev` — dev server
- `pnpm build` — production build
- `pnpm test` — test suite (vitest); 4 files, 41 tests, green
- `pnpm typecheck` — `tsc --noEmit`; currently fails with 5 pre-existing errors
- `pnpm lint` — **not configured**: no ESLint dependency or config, and `next lint` was removed in Next 16

### Database

There is no `supabase/` folder and no migration tooling. Schema changes are plain
`.sql` files in `scripts/` (`001`..`013`), run by hand in the Supabase SQL editor.
`groups.is_private` and `groups.archived` were added through the dashboard and are
only backfilled in `013`.

## Agent skills

### Issue tracker

Issues for this repo live in GitHub Issues (`Maikel-mg/split-ease`), operated via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical triage roles use their default label strings (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `CONTEXT.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
