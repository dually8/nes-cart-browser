# NES Cart Browser

This is a site that lets you browse NES games by their cartridge art. You can also search for titles, select them, and read their cart information.

## Getting Started

0. Install Node.js 24.22.3 (pinned in `.node-version`), Bun 1.4.4, and clone the repo. The package manager version is pinned in `package.json`.
1. Run `bun install --frozen-lockfile` to install the dependencies.
2. Run `bun run dev` to develop against the site.
3. Run `bun run build` to build the static site in `/build`, then `bun run preview` to preview it.

## Validation

Install with `bun install --frozen-lockfile`, then run `bun run lint`, `bun run check`, and `bun run test`. Install test browsers with `bunx --no-install playwright install chromium firefox`; Firefox is also used by the scraper. End-to-end tests build and serve the production site automatically on port 4173.

Set `BASE_PATH=/nes-cart-browser` when running the browser tests to also verify a GitHub Pages subdirectory deployment. The test configuration uses this path for both its build and browser URL.

## Todo

- [ ] Selecting a cartridge pops open a dialog that shows it's info and a link to its entry in nescartdb
- [ ] Add fade in/out animations for the cards

---

## Resources

- Powered by [`create-svelte`](https://github.com/sveltejs/kit/tree/main/packages/create-svelte).
- [shadcn-svelte](https://www.shadcn-svelte.com/)
- https://www.shadcn-svelte.com/docs/components/skeleton
- https://www.shadcn-svelte.com/docs/components/card
- https://www.shadcn-svelte.com/docs/components/button
