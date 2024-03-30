# NES Cart Browser

This is a site that lets you browse NES games by their cartridge art. You can also search for titles, select them, and read their cart information.

## Getting Started

0. Install Node.js (20.x) and clone the repo
1. Run `npm ci` to install the dependencies
2. Run `npm run scrape` to run the web scraper
    - This scrapes [nescartdb](https://nescartdb.com/) for info and cartridge art
3. Run `npm run dev` to dev against the site
4. Run `npm run preview` to run the prod build of the site
5. Run `npm run build` to build the dist (outputs to `/build`).

---

## Resources

- Powered by [`create-svelte`](https://github.com/sveltejs/kit/tree/main/packages/create-svelte).
- [shadcn-svelte](https://www.shadcn-svelte.com/)
- https://www.shadcn-svelte.com/docs/components/skeleton
- https://www.shadcn-svelte.com/docs/components/card
- https://www.shadcn-svelte.com/docs/components/button