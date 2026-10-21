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

## Phase 4: UI and runtime helpers

- Updated Lucide to 1.60.0, tailwind-merge to 3.7.0, tailwind-variants to 3.3.1, tsx to 4.23.15, and Node 24 types to 24.19.2.
- Type checks, production browser tests, and unit tests pass.

## Phase 5: testing, linting, formatting, and final security refresh

- Updated Vitest and its Playwright provider together to 5.0.5, the Svelte browser renderer to 3.1.0, and ESLint to 10.13.0 with compatible companion packages.
- Replaced the placeholder arithmetic test with a class-override regression. Added real-browser component tests for input binding and dialog open/close, Escape dismissal, and focus restoration.
- Updated Prettier to 3.9.10, its Svelte plugin to 4.1.1, and its Tailwind plugin to 0.8.1. Configured the active Tailwind CSS entry point and committed formatting separately.
- Refreshed the last vulnerable transitive packages using pnpm's lockfile update mode. No forced overrides, advisory exclusions, or peer-warning suppressions were added.
- The final registry scan reports **zero known vulnerabilities at every severity** across 333 dependency entries. Evidence: [final.json](dependency-audit/final.json).
- All 31 outdated retained direct packages were updated. Removed the unused automatic adapter; the four already-current packages remain unchanged. The app now has 35 direct packages.
- The final outdated check lists only Node 26 types and TypeScript 7. Those majors are deliberately excluded in favor of Node 24 types and TypeScript 6, matching the runtime/framework/lint peer requirements. Evidence: [final-outdated.json](dependency-audit/final-outdated.json).

## Phase 6: deployment workflow

- Updated all six deployment Actions to the audited releases and pinned their exact commit IDs. Evidence: [action-pins.json](dependency-audit/action-pins.json).
- Added pull-request validation and a root/subdirectory matrix, including frozen installation, the full security scan, formatting/lint/type checks, component tests, and production browser tests.
- Deployment waits for validation and is disabled on pull-request events. Pages write/OIDC permissions are scoped to the deployment job.
- The deployment build takes its base path from the Pages configuration output and preserves hidden build files in the uploaded artifact.
- Validated YAML parsing, verified action IDs against the captured upstream tag resolutions, and checked the PR deployment gate and frozen-install steps. No GitHub Actions run or deployment was triggered because all changes remain local.

## Final validation

| Check | Result |
| --- | --- |
| `pnpm install --frozen-lockfile` | Pass; lockfile unchanged |
| `pnpm run lint` | Pass |
| `pnpm run check` | Pass; 0 errors and 0 warnings |
| Root production tests | Pass; 3 Chromium end-to-end tests |
| Root unit/component tests | Pass; 1 unit and 2 browser component tests |
| `/nes-cart-browser/` production and component suites | Pass; all 6 tests |
| Firefox production smoke suite | Pass; all 3 end-to-end tests |
| Svelte analysis | No issues across all 18 changed/new components; optional suggestions about existing element-reference bindings were left outside the migration |
| Dependency security scan | Pass; 0 known vulnerabilities |
| Development server | Pass; app renders and cartridge asset responds with HTTP 200 after initial dependency optimization |
| Workflow syntax, action pins, and deployment gating | Pass local checks; live GitHub run deferred |

The full scraper was not run because it rewrites the dataset and downloads assets from the external site. Its source is covered by TypeScript checks, its Firefox engine is installed and tested, and tsx was updated. Existing untracked `.vscode` files were left untouched. The optional Runed peer declaration remains the upstream compatibility limitation described above.

## Local commit sequence

1. `docs: record dependency audit and upgrade plan`
2. `test: repair upgrade checks and pin the local toolchain`
3. `build(deps): apply current-major security updates`
4. `build!: migrate to SvelteKit 3 and Vite 8`
5. `build(deps): update UI helpers and Node 24 tooling`
6. `build(deps): upgrade Vitest and ESLint with UI regressions`
7. `style: upgrade Svelte and Tailwind formatting`
8. `build(deps): resolve remaining transitive advisories`
9. `ci: validate both deployment paths and pin updated actions`
10. `docs: record completed upgrade validation`

Nothing was pushed, and no remote workflow or deployment was run.
