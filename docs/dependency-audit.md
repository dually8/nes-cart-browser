# Dependency and upgrade audit

Audit date: October 20, 2026 (America/New_York).

## Recommendation

Upgrade in stages. First repair the existing verification setup and refresh security-sensitive packages on their current major versions. Then migrate the framework and tooling in coordinated groups. A blanket update to every `latest` tag would select incompatible versions: TypeScript 7.0.2 is outside SvelteKit 3.1.0's `^6.0.0` peer range, outside svelte-check 4.7.7's TypeScript 5/6 range, and outside typescript-eslint 8.72.0's `<6.1.0` range.

This audit changes documentation only. No application source, dependency declarations, lockfile, or deployment workflow was upgraded. Existing checks were executed against the locked versions. The local pnpm pre-run verification refreshed `node_modules` using that lockfile.

The complete direct-dependency inventory, exact target versions, package peer constraints, migration references, and workflow action research are in [dependency-upgrade-research.md](dependency-upgrade-research.md). The evidence files are listed below.

## Scope and architecture

- 36 direct packages: 35 development dependencies and `mode-watcher` under dependencies. The initial outdated query flags 32 packages; four are already at their latest stable releases.
- Svelte 5 components already use runes, snippets, and event attributes. A separate Svelte 4-to-5 conversion is unnecessary. The official Svelte analyzer found no issues or suggestions in `src/routes/+page.svelte`.
- SvelteKit prerenders the app using `adapter-static`, with a GitHub Pages deployment. There are no application server routes, form actions, remote functions, or custom server hooks in the source inventory.
- Browser code imports several packages declared as development dependencies. This is normal for a bundled static site, but means `pnpm audit --prod` would not establish the safety of the shipped browser bundle.
- Reviewed the manifest and lockfile, Svelte/Vite/Tailwind/ESLint/Prettier/TypeScript/Playwright configurations, app entry components, UI dependency imports, scraper, tests, and GitHub Actions workflow. This is an upgrade audit, not an exhaustive application security review.

## Priority findings

### 1. Refresh vulnerable dependencies before undertaking every major migration

`pnpm audit --json` reports **91 findings: 4 critical, 39 high, 39 moderate, and 9 low**, across 332 dependency entries. These are registry advisory findings, including repeat advisories for different affected package versions; they are not 91 demonstrated exploits in this application. Full affected paths and patched ranges are preserved in [audit.json](dependency-audit/audit.json).

The four critical findings affect the Vitest browser/API tooling. The app enables a browser test project, although it currently contains no matching component tests. Actual exposure depends on starting the affected UI/browser/API server and its reachability; the static GitHub Pages output does not host that test server. The Vitest maintainer advisory also specifically identifies Windows browser/UI use as an affected condition. See the [Vitest advisory](https://github.com/vitest-dev/vitest/security/advisories/GHSA-5xrq-8626-4rwp).

| Package/group | Locked | First recommended step | Relevance |
| --- | --- | --- | --- |
| `vitest`, `@vitest/browser-playwright`, transitive `@vitest/browser`/`@vitest/mocker` | 4.0.18 | Align on 4.1.12, regenerate lockfile | Addresses the reported critical tooling findings and later mocker fixes within the current major. Latest observed required 4.x patched floor is 4.1.11. |
| `playwright`, `@playwright/test` | 1.49.1 | Align both on 1.64.1; reinstall matching browser binaries | High advisory fixed in 1.55.1 concerns specific macOS browser installer scripts; this does not establish exploitation on this Windows workstation. The version gap also affects test/browser compatibility. |
| `svelte` | 5.51.2 | 5.57.2 | Multiple SSR/XSS findings; latest patched floor reported for these findings is 5.55.7. Some affect SSR only; one concerns DOM clobbering. |
| `@sveltejs/kit` | 2.52.0 | 2.70.3 before Kit 3 | Multiple deserialization, request processing, and remote-function advisories; latest reported 2.x patched floor is 2.70.2. Server/experimental feature conditions largely do not match the current static deployment. |
| `vite` | 7.3.1 | 7.3.7 before Vite 8 | Development server file access and Windows editor-launch findings. A static production deployment does not eliminate developer-tool exposure. |
| `devalue` | 5.6.2 | Resolve to at least 5.9.3 through updated parents | Serialization, prototype handling, and resource exhaustion findings. Trace updated Svelte/Kit resolutions rather than assuming a direct-package bump fixes every copy. |
| `rollup` | 4.57.1 | At least 4.59.0 while on Vite 7 | Build tooling path traversal/file-write advisory. |
| Other build/lint/test transitives | See evidence | Refresh parents and compatible transitive resolutions | Includes PostCSS, minimatch, brace-expansion, js-yaml, yaml, nanoid, flatted, picomatch, ws, esbuild, source-map-js, postcss-selector-parser, ajv, and @humanfs/node. |

Sources for package-specific patched ranges are the individual advisory links in the captured audit response. The browser-installer finding is detailed in the [Playwright advisory](https://github.com/advisories/GHSA-7mvr-c777-76hp). Re-run the full audit after each dependency group: the proposed targets have not been installed here, so a clean resulting dependency graph has not been demonstrated. Avoid `audit --fix --force` or unconstrained global overrides; old transitive major versions may have different APIs.

### 2. Treat SvelteKit 3 as a source/configuration migration

The recommended eventual framework combination is Svelte **5.57.2**, Kit **3.1.0**, static adapter **4.0.0**, Svelte Vite plugin **7.3.1**, Vite **8.3.4**, TypeScript **6.0.3**, and svelte-check **4.7.7**. These satisfy the inspected framework peer ranges; they remain an untested proposal for this app.

Specific changes required by the [official Kit 3 migration guide](https://svelte.dev/docs/kit/migrating-to-sveltekit-3):

- Move configuration from `svelte.config.js` into `sveltekit(...)` in `vite.config.ts`. Preserve prerender handling, static adapter output/compression, alias behavior, and the GitHub Pages base path.
- Update `eslint.config.js`, which imports the configuration file that Kit 3 removes.
- Replace `$lib` imports with declared `#lib` package subpath imports and appropriate extensions. Review copied UI files and the shadcn generator configuration as well as the app page.
- Replace the removed `base` export from `$app/paths` in `src/routes/+page.svelte`. Use the current asset helper with the required path format and verify cartridge images under `/nes-cart-browser/`.
- Change the TypeScript base configuration from `./.svelte-kit/tsconfig.json` to `$app/tsconfig`, adding explicit include/exclude settings. Include the scraper and test/config files deliberately; a previously implicit include must not disappear silently.
- Upgrade `adapter-static` with Kit 3. Its latest major must not be paired with the current Kit 2 installation.

The guide recommends upgrading to the latest Kit 2 before migrating to Kit 3. Use the same staging for this application so deprecation warnings can guide the migration. Vite 8 also changes the bundler to Rolldown; verify static assets and CSS output even when the config does not contain explicit Rollup options.

### 3. Repair the test baseline before relying on it for upgrades

| Check | Observed result |
| --- | --- |
| `pnpm run check` | Pass: 0 errors, 0 warnings. |
| `pnpm run build` | Pass: static site written to `build`. This run used the root base path. |
| `pnpm run test:unit` | Pass: 1 test. It only asserts `1 + 2 === 3`; it does not cover application behavior. No Svelte component tests exist. |
| `pnpm run lint` | Fail at Prettier. Pre-existing differences in `.vscode/settings.json`, `find-duplicates.js`, `src/routes/+page.svelte`, and `src/routes/layout.css`. The `.vscode` directory was already untracked and was left untouched. New audit files were subsequently formatted separately. |
| `pnpm exec eslint .` | Fail: two unused-variable errors in `find-duplicates.js` (`duplicateItems`, `id`). |
| `pnpm run test:e2e` | Fail: timed out after 60,000 ms waiting for the web server. The preview starts on 5173; Playwright waits for 4173. |

Additional browser-test defects found by inspection: `page.goto('/')` has no configured `use.baseURL`; two `toBeVisible()` calls and `searchBar.fill(...)` are not awaited. Fix these along with the port mismatch. The current e2e run never reached these assertions, so their behavior was not verified.

Add meaningful upgrade regression coverage for initial rendering and hydration, search, no-result state, clearing search, theme switching, and image URLs at both the root and GitHub Pages subpath. Include keyboard/focus checks if retaining the copied dialog components. Keep the separate Vitest browser/server project intent when migrating to Vitest 5; review its changed project inheritance rules and the existing `extends: './vite.config.ts'` pattern.

### 4. Make Node and pnpm reproducible

- CI selects Node 24.x; README still says Node 20.x. The observed local Node is 24.22.0. Keep Node 24 and align local setup, documentation, and engine constraints. Keep `@types/node` on the Node 24 line (target 24.19.2); its `latest` tag is 26.6.5 and would describe a different runtime.
- `package.json` has neither `engines` nor `packageManager`. The pnpm setup action also has no explicit version. Pin an exact supported pnpm version in the manifest and make CI consume it.
- The observed pnpm is 12.14.0. Its pre-run verification automatically refreshed dependencies from the existing lockfile and reported `ERR_PNPM_IGNORED_BUILDS` for esbuild, despite the repository's older `onlyBuiltDependencies` configuration. The subsequent type check and build passed. This is an installation-policy compatibility finding, not a reason to disable verification.
- Migrate the dependency build allowlist deliberately if adopting pnpm 12. Move `engine-strict` from `.npmrc` to the supported workspace setting for that pnpm version; current pnpm reads only auth/registry settings from `.npmrc`. See [pnpm settings](https://pnpm.io/settings).
- CI already has a checked-in lockfile. Use an explicit frozen-lockfile install, then run formatting/lint/type/tests before deployment. The existing workflow only installs and builds; it runs on main/manual dispatch, without pull-request validation.

### 5. Clean up unused or stale upgrade surface

- Remove `@sveltejs/adapter-auto` if GitHub Pages remains the target. The application imports only `adapter-static`; upgrading an unused deployment adapter adds no value.
- `tailwind.config.js` appears to be a Tailwind 3 remnant. The app already imports Tailwind 4 through CSS and the Vite plugin, and no `@config` loads that JavaScript configuration. Verify whether any intended container/theme settings need moving into CSS before removing it. The active CSS defines its theme independently.
- Update `prettier-plugin-tailwindcss` together with Prettier and its Svelte plugin. The old 0.5.14 Tailwind formatter predates this Tailwind 4 setup; explicitly configure its CSS entry point as required by current plugin guidance. Expect formatting churn and isolate it from behavior changes.
- `@internationalized/date` has no direct source import, but is a Bits UI peer. Keep it if retaining Bits UI rather than deleting it based on that absence alone.
- Bits UI is used by copied dialog components, while the app page currently links externally instead of opening a dialog. Decide whether to retain this planned UI before removing its packages.
- `vitest-browser-svelte` has no test imports because there are no component tests. Keep it if adding those tests; otherwise it is optional test infrastructure.
- shadcn components are copied source, not an installed `shadcn-svelte` runtime package. Review their compatibility with newer Bits UI and icon exports; updating packages will not regenerate those components. No daisyUI dependency is present.
- `playwright` is used by the scraper; retain it alongside `@playwright/test`. Install Chromium for browser tests and Firefox for the scraper after upgrading. Do not run the full scraper as a routine upgrade check because it contacts the external database and rewrites data/assets.
- `mode-watcher`, `@unpic/svelte`, `clsx`, and `tw-animate-css` are already at the latest stable versions observed. Retain them unless a separate simplification is justified.

## Suggested implementation sequence

1. **Reproducible baseline:** pin Node/pnpm, resolve pnpm configuration compatibility, repair lint/format and e2e setup, add useful app regression coverage, and add PR validation. Preserve the existing untracked `.vscode` changes.
2. **Security refresh on current majors:** Svelte 5.57.2, Kit 2.70.3, Vite 7.3.7, Vitest/browser provider 4.1.12, Playwright/test 1.64.1, compatible transitive refreshes. Keep plugin 6.2.4, static adapter 3.0.10, and TypeScript 5.9.3 for this intermediate step. Re-run the complete audit and verification suite.
3. **Framework migration:** Kit 3.1.0 + static adapter 4.0.0 + plugin 7.3.1 + Vite 8.3.4 + TypeScript 6.0.3, with the source/configuration changes above. Validate `BASE_PATH=/nes-cart-browser` as well as a root deployment. Do not select TypeScript 7.
4. **UI/styling group:** update Tailwind/Vite plugin together to 4.3.3, Bits UI/date, class-merging/variant helpers, and Lucide. Validate theme, responsive layout, image rendering, and copied component exports. No Svelte syntax rewrite is planned.
5. **Tooling groups:** upgrade Vitest/browser provider together to 5.0.5 and browser-Svelte helper to 3.1.0; upgrade ESLint 10 with its compatible JS config, TypeScript integration, and Svelte plugin; upgrade the Prettier plugin group in a distinct formatting change. See the inventory for exact versions.
6. **Deployment dependencies:** upgrade workflow actions using the researched compatible majors. Pin chosen revisions and verify runner support. Confirm frozen install, clean audit triage, build, and tests before publishing.

Each group should have a reviewable manifest/lockfile diff and pass checks before the next group. Exact versions here describe the observed registry snapshot; query again at implementation time because tags can change. Peer-range compatibility is necessary but does not replace installing and testing the proposal.

## Evidence and limitations

- [Full registry advisory response](dependency-audit/audit.json): severity totals, affected locked versions, dependency paths, advisory URLs, patched ranges.
- [Initial outdated response](dependency-audit/outdated.json): direct installed/latest comparison. Use its `current`/`latest` values as a snapshot; do not interpret its unchanged `wanted` fields as proof the declared caret ranges cannot update.
- [Full direct-package registry snapshot](dependency-registry-research.json): stable tags, publication timestamps, Node engines, and peers.
- [Compatible intermediate-version snapshot](dependency-compatible-research.json): exact current-major targets and TypeScript 6/Node 24 type targets.
- [Workflow action release snapshot](actions-upgrade-research.json): release versions and action runtime requirements.
- [Research and migration details](dependency-upgrade-research.md): official references, all direct packages, and workflow action versions.

Registry evidence was captured on October 20 locally (October 21 UTC). Independent registry queries returned different latest Bits UI and Lucide versions; the later full registry snapshot is authoritative for this report. The proposed upgraded dependency tree was not installed or tested. The root-path production build passed, but a GitHub Pages subpath build, visual/browser regression pass, and scraper smoke test remain upgrade acceptance requirements. No deployment was performed.
