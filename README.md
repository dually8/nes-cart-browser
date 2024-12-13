# NES Cart Browser

This is a site that lets you browse NES games by their cartridge art. You can also search for titles, select them, and read their cart information.

## Getting Started

0. Install Node.js (20.x), [pnpm](https://pnpm.io/installation), and clone the repo
1. Run `pnpm install` to install the dependencies
2. Run `pnpm run scrape` to run the web scraper
    - This scrapes [nescartdb](https://nescartdb.com/) for info and cartridge art
3. Run `pnpm run dev` to dev against the site
4. Run `pnpm run preview` to run the prod build of the site
5. Run `pnpm run build` to build the dist (outputs to `/build`).

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