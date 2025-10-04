# Repository Guidelines

## Project Overview

Buildla is a Next.js platform that enables businesses to create intelligent AI assistants for their Squarespace websites, with specialized focus on construction and renovation services. The app helps generate automated quotes for bathroom renovations with Swedish market pricing logic, including ROT tax deduction calculations.

## Project Structure & Module Organization
Next.js App Router routes live in `src/app`, mirroring dashboard, widget, and auth flows. Shared interface logic stays in `src/components`; keep Radix wrappers in `ui/` and feature modules in folders such as `chat/` or `assistants/`. Domain helpers and Supabase clients belong in `src/lib`, while validation schemas sit in `src/types`. Static assets live in `public/`. FAQ scraping utilities stay in `scripts/`, and Supabase migrations are tracked in `supabase-migrations/` for SQL editor runs.

## Build, Test, and Development Commands
- `pnpm install` — install dependencies.
- `pnpm dev` — run Next.js with Turbopack locally.
- `pnpm build` / `pnpm start` — create and serve the production bundle.
- `pnpm lint` — execute ESLint and resolve findings before review.
- `node scripts/faq-scraper.js --site=traguiden.se --dry-run` — preview FAQ ingestion; drop `--dry-run` once validated.

## Coding Style & Naming Conventions
Write TypeScript with 2-space indentation, double quotes, and no trailing semicolons, following `src/components/ui/button.tsx`. Compose UI with Tailwind utilities and the shared `cn` helper. Use PascalCase filenames for React components, camelCase for functions and hooks, and prefix server actions with the feature (`chatUpdateAssistant`). Keep configuration constants in `src/lib`, gate secrets behind `process.env`, and never export Supabase credentials.

## Commit & Pull Request Guidelines
Follow the emerging Conventional Commit pattern (`feat:`, `fix:`, `refactor:`). Keep subjects imperative, ≤72 characters, and include scopes when helpful (`feat(chat): enable uploads`). Pull requests should explain the problem, summarize the solution, link related issues, and attach screenshots or screen captures for UI work. Call out Supabase migrations, new env vars, or manual data steps so reviewers can verify them quickly.

## Git Push Policy
Push branches with `git push origin <branchName>` only. Skip the `-u` (`--set-upstream`) flag so remotes stay clean and contributors opt in explicitly when they need upstream tracking.
