# Dependency upgrade research

Observed October 20, 2026, America/New_York (registry capture `2026-10-21T01:38:52Z`). This is an audit and migration assessment; no dependencies, lockfile, or application source were changed. Versions below are the registry's stable `latest` tags at capture time, not inferred from documentation or prerelease tags. The full publisher metadata is in [dependency-registry-research.json](dependency-registry-research.json); [dependency-compatible-research.json](dependency-compatible-research.json) records selected older-major targets. These snapshots came directly from public npm registry packuments.

## Recommended compatibility targets

The coherent current framework target is **Svelte 5.57.2 + SvelteKit 3.1.0 + Vite 8.3.4 + vite-plugin-svelte 7.3.1 + adapter-static 4.0.0 + TypeScript 6.0.3**. This is a major migration, rather than a manifest-only refresh. Kit's published peers require TypeScript `^6.0.0`, Svelte `^5.57.1`, Vite `^8.0.12`, and plugin `^7.0.0`; Kit requires Node `>=22.17`. [Kit registry metadata](https://registry.npmjs.org/@sveltejs/kit/3.1.0), [plugin metadata](https://registry.npmjs.org/@sveltejs/vite-plugin-svelte/7.3.1), [static adapter metadata](https://registry.npmjs.org/@sveltejs/adapter-static/4.0.0).

**Do not blindly upgrade TypeScript to latest 7.0.2.** `typescript-eslint` 8.72.0 supports `>=4.8.4 <6.1.0`, while `svelte-check` 4.7.7 supports TypeScript 5 or 6. TypeScript 6.0.3 is the newest stable 6.x observed and satisfies both tools and Kit 3. [typescript-eslint support policy](https://typescript-eslint.io/users/dependency-versions/), [svelte-check metadata](https://registry.npmjs.org/svelte-check/4.7.7), [TypeScript 6.0.3 metadata](https://registry.npmjs.org/typescript/6.0.3).

Keep Node 24 LTS and match `@types/node` to 24.x (latest observed **24.19.2**), instead of choosing the registry's Node 26 types merely because they are newest. The deployment workflow already requests Node `24.x`; Node 24 is LTS and satisfies all proposed tool constraints. [Node release status](https://nodejs.org/en/about/previous-releases), [Node 24 types metadata](https://registry.npmjs.org/@types/node/24.19.2).

For a staged first pass, use Kit **2.70.3**, Svelte **5.57.2**, Vite **7.3.7**, existing plugin **6.2.4**, and Vitest/browser provider **4.1.12**. This keeps the existing framework/configuration generation while updating its current majors. Published peers also permit updating Kit 2.70.3 to Vite 8/plugin 7 as a separate intermediate step. [Kit 2 metadata](https://registry.npmjs.org/@sveltejs/kit/2.70.3), [Vite 7 metadata](https://registry.npmjs.org/vite/7.3.7), [plugin 6 metadata](https://registry.npmjs.org/@sveltejs/vite-plugin-svelte/6.2.4), [Vitest 4 metadata](https://registry.npmjs.org/vitest/4.1.12).

## Framework migration work relevant to this repository

Upgrade to the latest Kit 2 first, then review `sv migrate sveltekit-3`. Required Kit 3 changes include moving `svelte.config.js` configuration into `sveltekit(...)` in Vite, replacing `$lib` imports with `#lib` plus explicit extensions and package import mappings, extending `$app/tsconfig` with explicit include/exclude arrays, and replacing removed `base` imports from `$app/paths`. [Official Kit 3 migration guide](https://svelte.dev/docs/kit/migrating-to-sveltekit-3).

Local affected files include `svelte.config.js` (static adapter, prerender handler, alias, deployment base), `vite.config.ts`, `tsconfig.json`, `eslint.config.js` (imports the old config), `src/routes/+page.svelte:13` (`base`), and many component `$lib` imports. Preserve and test GitHub Pages URLs with a nonempty `BASE_PATH` during migration. Review the existing `@/*` alias when moving configuration; use package subpath imports for internal code where appropriate. [Official configuration/alias changes](https://svelte.dev/docs/kit/migrating-to-sveltekit-3#Configuration).

Vite 8 changes its build pipeline to Rolldown/Oxc, adjusts CommonJS interop, and changes some plugin/configuration behavior. This project has no custom Rollup/esbuild settings in `vite.config.ts`; primary risk lies in framework, CSS plugins, bundled dependencies, and prerender output. Validate build and runtime behavior together. [Vite migration guide](https://vite.dev/guide/migration).

Plugin 7 requires Vite 8 and removes deprecated configuration/plugin APIs. The existing simple `vitePreprocess({})` setup has no removed options; Svelte remains on major 5. [Official plugin changelog](https://github.com/sveltejs/vite-plugin-svelte/blob/main/packages/vite-plugin-svelte/CHANGELOG.md#700).

`@sveltejs/adapter-auto` is declared but the app selects `adapter-static`. Prefer removing the unused auto adapter if a repository-wide usage check confirms it is unnecessary. Upgrading auto to 8 or static to 4 independently of Kit 3 violates their published Kit peer constraints. [Auto metadata](https://registry.npmjs.org/@sveltejs/adapter-auto/8.0.0), [static metadata](https://registry.npmjs.org/@sveltejs/adapter-static/4.0.0).

## Styling, UI, and formatting

Tailwind is already on 4.x and uses the official Vite plugin. Upgrade `tailwindcss` and `@tailwindcss/vite` together to **4.3.3**; the latest plugin supports Vite 8. `tailwind-merge` 3.7.0 and `tailwind-variants` 3.3.1 remain on their existing majors, and variants requires merge >=3. [Tailwind Vite metadata](https://registry.npmjs.org/@tailwindcss/vite/4.3.3), [variants metadata](https://registry.npmjs.org/tailwind-variants/3.3.1).

The CSS theme lives in `src/routes/layout.css`. An older `tailwind.config.js` still defines a different HSL theme, but no `@config` reference was found in source. Tailwind 4 does not automatically detect JavaScript configuration. Confirm the file is obsolete before removing it; do not accidentally reactivate it during upgrades. No daisyUI dependency or source usage was found. [Tailwind configuration migration](https://tailwindcss.com/docs/upgrade-guide#Using-a-JavaScript-config-file).

Upgrade the formatter group together: Prettier **3.9.10**, Svelte plugin **4.1.1**, Tailwind plugin **0.8.1**. Plugin Svelte 4 requires Svelte 5 and removes `svelteBracketNewLine` and `svelteStrictMode`; neither option is configured here. [Official Svelte formatter changelog](https://github.com/sveltejs/prettier-plugin-svelte/blob/main/CHANGELOG.md#400).

When refreshing Prettier configuration, add `tailwindStylesheet: './src/routes/layout.css'` so class sorting reads the Tailwind 4 theme. Its docs require the CSS entry point for Tailwind 4. Keep the Tailwind plugin last in the plugins array, as it already is. Run formatting separately to make any broad formatting diff reviewable. [Official Tailwind formatter configuration](https://github.com/tailwindlabs/prettier-plugin-tailwindcss#specifying-your-tailwind-stylesheet-path-tailwind-css-v4).

Bits UI **2.20.0** requires Svelte `^5.33.0` and `@internationalized/date` `^3.8.1`, which the proposed Svelte/date versions satisfy. Locally copied shadcn components will not update automatically with dependencies; visually and functionally verify dialogs, focus/keyboard behavior, dark mode, and buttons. [Bits UI metadata](https://registry.npmjs.org/bits-ui/2.20.0).

Lucide's **0.x → 1.x** upgrade removes brand icons. Review imports, particularly any GitHub/GitLab/brand icon, before accepting the major. [Official Svelte Lucide migration guide](https://lucide.dev/guide/svelte/migration).

## Linting and TypeScript

Upgrade ESLint and `@eslint/js` together to **10.13.0 / 10.0.1**, alongside `typescript-eslint` **8.72.0**, `eslint-plugin-svelte` **3.23.1**, `@eslint/compat` **2.1.1**, globals **17.13.0**, and `eslint-config-prettier` **10.1.8**. Latest TypeScript/Svelte lint packages explicitly accept ESLint 10. [Svelte lint metadata](https://registry.npmjs.org/eslint-plugin-svelte/3.23.1), [typescript-eslint metadata](https://registry.npmjs.org/typescript-eslint/8.72.0), [ESLint JS metadata](https://registry.npmjs.org/@eslint/js/10.0.1).

ESLint 10 requires newer Node versions, changes configuration lookup, removes legacy configs, and adds recommended rules (`no-unassigned-vars`, `no-useless-assignment`, `preserve-caught-error`). This repo already uses flat config, so expect mostly rule findings and the Kit config import adjustment. [Official ESLint 10 migration guide](https://eslint.org/docs/latest/use/migrate-to-10.0.0).

TypeScript 6 introduces configuration default changes and deprecations. Recheck the fully inherited compiler configuration after Kit sync, including root directory, included ambient types, and deprecated compiler options; do not simply suppress all deprecation notices. [Official TypeScript 6 release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-6-0.html#breaking-changes-and-deprecations-in-typescript-60).

## Tests

Upgrade Vitest and `@vitest/browser-playwright` together to **5.0.5**; the provider has an exact Vitest peer dependency. Upgrade `vitest-browser-svelte` to **3.1.0**, whose peers accept Vitest 4 or 5. [Provider metadata](https://registry.npmjs.org/@vitest/browser-playwright/5.0.5), [Svelte renderer metadata](https://registry.npmjs.org/vitest-browser-svelte/3.1.0).

Vitest 5 raises Node to >=22.12, defaults `clearMocks` on, changes full test name matching, and changes inline project inheritance/server sharing. The current Vite test configuration has client/server inline projects each extending the root Vite config, which itself declares projects; review this structure as part of the upgrade rather than preserving it without validation. [Official Vitest 5 migration guide](https://vitest.dev/guide/migration/).

The latest Svelte browser renderer examples use `await render(...)` and optionally `page.render`; follow the current API when adding component coverage. [Official renderer README](https://github.com/vitest-community/vitest-browser-svelte).

Align `playwright` and `@playwright/test` at **1.64.1** and reinstall matching browser binaries after upgrading. Each Playwright version expects specific browsers; package updates alone do not replace all browser installations. [Official browser install/update guidance](https://playwright.dev/docs/browsers).

Local end-to-end configuration expects port **4173**, while `preview` explicitly starts port **5173**. Repair that mismatch before treating end-to-end failures as upgrade regressions (`playwright.config.ts` versus `package.json`).

## All direct dependencies

The locked version is corroborated by the restored installed package metadata. The declared range is from `package.json`. A newer `latest` does not imply it is a compatible immediate target; TypeScript and unused adapters are explicit exceptions above. Metadata links identify the publisher's exact release. Four unchanged direct dependencies are included.

| Package | Locked version | Declared range | Latest stable | Latest Node engine |
| --- | --- | --- | --- | --- |
| @eslint/compat | 2.0.2 | ^2.0.2 | [2.1.1](https://registry.npmjs.org/@eslint/compat/2.1.1) | ^20.19.0 \|\| ^22.13.0 \|\| >=24 |
| @eslint/js | 9.39.2 | ^9.39.2 | [10.0.1](https://registry.npmjs.org/@eslint/js/10.0.1) | ^20.19.0 \|\| ^22.13.0 \|\| >=24 |
| @internationalized/date | 3.11.0 | ^3.11.0 | [3.12.4](https://registry.npmjs.org/@internationalized/date/3.12.4) | Not declared |
| @lucide/svelte | 0.561.0 | ^0.561.0 | [1.60.0](https://registry.npmjs.org/@lucide/svelte/1.60.0) | Not declared |
| @playwright/test | 1.49.1 | ^1.28.1 | [1.64.1](https://registry.npmjs.org/@playwright/test/1.64.1) | >=20 |
| @sveltejs/adapter-auto | 7.0.1 | ^7.0.1 | [8.0.0](https://registry.npmjs.org/@sveltejs/adapter-auto/8.0.0) | Not declared |
| @sveltejs/adapter-static | 3.0.10 | ^3.0.10 | [4.0.0](https://registry.npmjs.org/@sveltejs/adapter-static/4.0.0) | Not declared |
| @sveltejs/kit | 2.52.0 | ^2.52.0 | [3.1.0](https://registry.npmjs.org/@sveltejs/kit/3.1.0) | >=22.17 |
| @sveltejs/vite-plugin-svelte | 6.2.4 | ^6.2.4 | [7.3.1](https://registry.npmjs.org/@sveltejs/vite-plugin-svelte/7.3.1) | ^20.19 \|\| ^22.12 \|\| >=24 |
| @tailwindcss/vite | 4.1.18 | ^4.1.18 | [4.3.3](https://registry.npmjs.org/@tailwindcss/vite/4.3.3) | Not declared |
| @types/node | 24.10.13 | ^24 | [26.6.5](https://registry.npmjs.org/@types/node/26.6.5) | Not declared |
| @unpic/svelte | 1.0.1 | ^1.0.1 | [1.0.1](https://registry.npmjs.org/@unpic/svelte/1.0.1) | Not declared |
| @vitest/browser-playwright | 4.0.18 | ^4.0.18 | [5.0.5](https://registry.npmjs.org/@vitest/browser-playwright/5.0.5) | Not declared |
| bits-ui | 2.15.5 | ^2.15.5 | [2.20.0](https://registry.npmjs.org/bits-ui/2.20.0) | >=20 |
| clsx | 2.1.1 | ^2.1.1 | [2.1.1](https://registry.npmjs.org/clsx/2.1.1) | >=6 |
| eslint | 9.39.2 | ^9.39.2 | [10.13.0](https://registry.npmjs.org/eslint/10.13.0) | ^20.19.0 \|\| ^22.13.0 \|\| >=24 |
| eslint-config-prettier | 9.1.0 | ^9.1.0 | [10.1.8](https://registry.npmjs.org/eslint-config-prettier/10.1.8) | Not declared |
| eslint-plugin-svelte | 3.15.0 | ^3.15.0 | [3.23.1](https://registry.npmjs.org/eslint-plugin-svelte/3.23.1) | ^18.18.0 \|\| ^20.9.0 \|\| >=21.1.0 |
| globals | 17.3.0 | ^17.3.0 | [17.13.0](https://registry.npmjs.org/globals/17.13.0) | >=18 |
| mode-watcher | 1.1.0 | ^1.1.0 | [1.1.0](https://registry.npmjs.org/mode-watcher/1.1.0) | Not declared |
| playwright | 1.49.1 | ^1.42.1 | [1.64.1](https://registry.npmjs.org/playwright/1.64.1) | >=20 |
| prettier | 3.4.2 | ^3.1.1 | [3.9.10](https://registry.npmjs.org/prettier/3.9.10) | >=14 |
| prettier-plugin-svelte | 3.4.1 | ^3.4.1 | [4.1.1](https://registry.npmjs.org/prettier-plugin-svelte/4.1.1) | >=20 |
| prettier-plugin-tailwindcss | 0.5.14 | ^0.5.9 | [0.8.1](https://registry.npmjs.org/prettier-plugin-tailwindcss/0.8.1) | >=20.19 |
| svelte | 5.51.2 | ^5.51.2 | [5.57.2](https://registry.npmjs.org/svelte/5.57.2) | >=18 |
| svelte-check | 4.4.0 | ^4.4.0 | [4.7.7](https://registry.npmjs.org/svelte-check/4.7.7) | >= 18.0.0 |
| tailwind-merge | 3.4.1 | ^3.4.1 | [3.7.0](https://registry.npmjs.org/tailwind-merge/3.7.0) | Not declared |
| tailwind-variants | 3.2.2 | ^3.2.2 | [3.3.1](https://registry.npmjs.org/tailwind-variants/3.3.1) | >=16.9.x |
| tailwindcss | 4.1.18 | ^4.1.18 | [4.3.3](https://registry.npmjs.org/tailwindcss/4.3.3) | Not declared |
| tsx | 4.21.0 | ^4.21.0 | [4.23.15](https://registry.npmjs.org/tsx/4.23.15) | >=18.0.0 |
| tw-animate-css | 1.4.0 | ^1.4.0 | [1.4.0](https://registry.npmjs.org/tw-animate-css/1.4.0) | Not declared |
| typescript | 5.9.3 | ^5.9.3 | [7.0.2](https://registry.npmjs.org/typescript/7.0.2) | >=16.20.0 |
| typescript-eslint | 8.55.0 | ^8.55.0 | [8.72.0](https://registry.npmjs.org/typescript-eslint/8.72.0) | ^18.18.0 \|\| ^20.9.0 \|\| >=21.1.0 |
| vite | 7.3.1 | ^7.3.1 | [8.3.4](https://registry.npmjs.org/vite/8.3.4) | ^20.19.0 \|\| >=22.12.0 |
| vitest | 4.0.18 | ^4.0.18 | [5.0.5](https://registry.npmjs.org/vitest/5.0.5) | ^22.12.0 \|\| ^24.0.0 \|\| >=26.0.0 |
| vitest-browser-svelte | 2.0.2 | ^2.0.2 | [3.1.0](https://registry.npmjs.org/vitest-browser-svelte/3.1.0) | Not declared |

## Package manager configuration

Pin one reviewed pnpm version in `package.json`'s `packageManager` field and use it locally and in CI; the repository currently has no pin, and the workflow's pnpm setup has no explicit version. Pnpm 12 is the current release line; changing its major should be treated as its own migration. [Pnpm installation and pin behavior](https://pnpm.io/installation).

For pnpm 11/12, move `.npmrc`'s `engine-strict=true` into `pnpm-workspace.yaml` as `engineStrict: true`; current pnpm reads only authentication/registry configuration from `.npmrc`. [Official configuration locations](https://pnpm.io/settings), [engineStrict reference](https://pnpm.io/settings/cli#enginestrict).

Replace `onlyBuiltDependencies` with reviewed `allowBuilds` entries (`esbuild: true`, and preserve other existing approvals only where still needed). The old setting was removed in pnpm 11. The new default `verifyDepsBeforeRun: install` can cause `pnpm run`/`pnpm exec` to install stale dependencies before the command; decide whether a reproducible audit/CI flow should instead use `error` after an explicit frozen-lockfile install. [Official build settings and migration](https://pnpm.io/settings/build#allowbuilds), [pre-run dependency verification](https://pnpm.io/settings/build#verifydepsbeforerun).

Update README's Node 20 guidance to the selected Node 24 baseline; Node 20 is EOL in the observed release table. [Node release status](https://nodejs.org/en/about/previous-releases).

## Deployment Actions

The workflow is another upgrade surface. Versions below were read directly from each repository's latest stable GitHub release and its tagged `action.yml`; evidence is in [actions-upgrade-research.json](actions-upgrade-research.json).

| Action | Current workflow | Latest stable | Runtime |
| --- | --- | --- | --- |
| actions/checkout | v4 | [v7.0.1](https://github.com/actions/checkout/releases/tag/v7.0.1) | Node 24 |
| actions/setup-node | v4 | [v7.1.0](https://github.com/actions/setup-node/releases/tag/v7.1.0) | Node 24 |
| actions/configure-pages | v5 | [v6.0.0](https://github.com/actions/configure-pages/releases/tag/v6.0.0) | Node 24 |
| pnpm/action-setup | v4 | [v6.1.0](https://github.com/pnpm/action-setup/releases/tag/v6.1.0) | Node 24 |
| actions/upload-pages-artifact | v3 | [v5.0.0](https://github.com/actions/upload-pages-artifact/releases/tag/v5.0.0) | Composite; delegates to upload-artifact v7 |
| actions/deploy-pages | v4 | [v5.0.1](https://github.com/actions/deploy-pages/releases/tag/v5.0.1) | Node 24 |

Review each intervening major release before changing the workflow. Node used internally by an action is separate from the Node selected for application commands. New action runtimes require supported runners; this workflow uses a GitHub-hosted Ubuntu runner. Upload Pages Artifact 5 makes hidden-file inclusion an explicit input: confirm `.nojekyll` and any other needed dotfiles are included in the published artifact. [Official upload action release](https://github.com/actions/upload-pages-artifact/releases/tag/v5.0.0), [tagged action implementation](https://github.com/actions/upload-pages-artifact/blob/v5.0.0/action.yml).

## Limits

These are compatibility recommendations based on registry metadata, official migration guidance, and this repository's configuration/import usage. They are not proof that the proposed versions pass the app's checks; install and regression validation belong to the upgrade implementation. See the main dependency audit for installed inventory, security advisories, and baseline test results. Registry releases can move during the audit: this snapshot observed Bits UI 2.20.0 and Lucide 1.60.0 after an earlier outdated query returned 2.19.5 / 1.59.0.


