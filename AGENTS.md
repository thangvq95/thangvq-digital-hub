## Agent rules (universal)

### Source of truth

- `plan.md` for product/roadmap.
- `CONTEXT.md` for domain terms + architecture rules.
- `docs/adr/` for decisions.

### Stack & structure

- Next.js 14+ App Router (no `pages/`).
- Tailwind CSS v4 + ShadcnUI.
- Supabase PostgreSQL.
- `app/` routes: `/` portfolio, `/tech` dashboard.
- UI components in `components/portfolio/` and `components/dashboard/`.

### Coding rules

- Prefer Server Components; use `"use client"` only when needed.
- Keep components small + typed.
- No direct secrets in client code.

### Issue tracker

GitHub Issues. See `docs/agents/issue-tracker.md`.

### Triage labels

Default vocabulary. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout. See `docs/agents/domain.md`.
