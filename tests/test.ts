import { expect, test } from '@playwright/test';

test('Page should load and be searchable', async ({ page }) => {
	await page.goto('./');
	const searchBar = page.getByPlaceholder('Search');
	await expect(searchBar).toBeVisible();
	const mainGrid = page.locator('.grid');
	await expect(mainGrid).toBeVisible();
	await expect(page.getByText('10-Yard Fight')).toBeVisible();
	await expect
		.poll(() =>
			page
				.locator('.grid img')
				.first()
				.evaluate((image: HTMLImageElement) => image.naturalWidth),
		)
		.toBeGreaterThan(0);
	await searchBar.fill('Battletoads');
	await expect(page.getByText('10-Yard Fight')).not.toBeVisible();
	await expect(page.getByText('Battletoads').first()).toBeVisible();
	await expect(page.getByText('Double Dragon').first()).toBeVisible();
});

test('Theme toggle remains interactive after hydration', async ({ page }) => {
	await page.goto('./');
	const root = page.locator('html');
	const initiallyDark = await root.evaluate((element) => element.classList.contains('dark'));
	await page.getByRole('button', { name: 'Toggle theme' }).click();
	if (initiallyDark) {
		await expect(root).not.toHaveClass(/dark/);
	} else {
		await expect(root).toHaveClass(/dark/);
	}
});
