# NES Cart Browser

This is a site that lets you browse NES games by their cartridge art. You can also search for titles, select them, and read their cart information.

## Getting Started

0. Install Node.js 24 (the exact local baseline is in `.node-version`), pnpm 12.14.0, and clone the repo. The package manager version is pinned in `package.json`.
1. Run `pnpm install` to install the dependencies
2. Run `pnpm run scrape` to run the web scraper
    - This scrapes [nescartdb](https://nescartdb.com/) for info and cartridge art
3. Run `pnpm run dev` to dev against the site
4. Run `pnpm run preview` to run the prod build of the site
5. Run `pnpm run build` to build the dist (outputs to `/build`).

## Validation

Install with `pnpm install --frozen-lockfile`, then run `pnpm run lint`, `pnpm run check`, and `pnpm run test`. Install test browsers with `pnpm exec playwright install chromium firefox`; Firefox is used by the scraper. End-to-end tests build and serve the production site automatically on port 4173.

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
