# Dependency upgrade results

Work is local on `codex/dependency-upgrades`. The original audit is a historical snapshot; this file records implementation results.

## Phase 1: reproducible checks

- Pinned Node 24.22.0 and pnpm 12.14.0; migrated pnpm configuration and esbuild build permission.
- Fixed formatting/lint failures without touching the pre-existing untracked `.vscode` files.
- Repaired the Playwright server URL and added production regressions for image loading, search/no-results/reset, and keyboard theme switching/persistence.
- Frozen installation, lint, and type checks pass. The old Playwright browser binary was absent; browser assertions were validated after the phase 2 browser-package update.

## Phase 2: security updates on current majors

- Updated Svelte, Kit 2, Vite 7, Vitest 4, svelte-check, and both Playwright packages.
- Lint, type checks, three production browser tests, and the existing unit test pass.
- Registry advisory findings dropped from 91 (4 critical) to 48 (0 critical). Evidence: [phase-2.json](dependency-audit/phase-2.json).

## Phase 3: framework migration

- Migrated to Kit 3.1.0, static adapter 4.0.0, Vite 8.3.4, Svelte Vite plugin 7.3.1, and TypeScript 6.0.3.
- Moved framework configuration into Vite, migrated internal imports and asset paths, and expanded explicit TypeScript coverage to config/tests/scraper files.
- Updated Tailwind/Vite plugin, Bits UI/date, and the TypeScript lint integration as framework prerequisites. Removed the unused auto adapter and inactive Tailwind 3 configuration.
- Lint, type checks, unit test, and production browser tests at both root and `/nes-cart-browser/` pass. Svelte analysis found no component issues.
- Remaining upstream peer warning: Bits UI and its toolbelt resolve Runed 0.35.1, whose **optional** Kit integration declares Kit `^2.21.0`. Even Runed 0.37.1 still declares that range. The app does not import `runed/kit`; no peer suppression or forced transitive major override was added. The framework-independent utilities and app behavior are validated, but the separate Runed Kit integration is outside the supported combination.
