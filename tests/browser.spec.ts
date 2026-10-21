import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
	await page.goto('./');
});

test('hydrates the cartridge list and loads images under the deployment path', async ({ page }) => {
	await expect(page.getByRole('heading', { name: '10-Yard Fight', exact: true })).toBeVisible();
	const image = page.getByRole('img', { name: 'Cover photo of 10-Yard Fight', exact: true });
	await expect(image).toBeVisible();
	await expect(image).toHaveJSProperty(
		'src',
		new URL(`${process.env.BASE_PATH ?? ''}/assets/NES-TY-USA.webp`, page.url()).href,
	);
	await expect
		.poll(() => image.evaluate((element) => (element as HTMLImageElement).naturalWidth))
		.toBeGreaterThan(0);
	await expect(
		page.getByRole('link', { name: 'View details for 10-Yard Fight on NES Cart DB' }),
	).toHaveAttribute('href', /https:\/\/nescartdb\.com\/search\/advanced\?/);
});

test('searches case-insensitively, shows no results, and restores the list', async ({ page }) => {
	const search = page.getByPlaceholder('Search', { exact: true });
	await search.fill('bAtTlEtOaDs');
	await expect(page.getByRole('heading', { name: '10-Yard Fight', exact: true })).toHaveCount(0);
	await expect(page.getByRole('heading', { name: 'Battletoads', exact: true })).toBeVisible();
	await expect(page.getByRole('heading', { name: /Battletoads.*Double Dragon/ })).toBeVisible();
	await search.fill('a-title-that-does-not-exist');
	await expect(page.getByText('No results found', { exact: true })).toBeVisible();
	await expect(page.getByRole('heading', { level: 2 })).toHaveCount(0);
	await search.clear();
	await expect(page.getByRole('heading', { name: '10-Yard Fight', exact: true })).toBeVisible();
});

test('switches theme with the keyboard and remembers it after a reload', async ({ page }) => {
	const toggle = page.getByRole('button', { name: 'Toggle theme' });
	const root = page.locator('html');
	const wasDark = await root.evaluate((element) => element.classList.contains('dark'));
	await toggle.focus();
	await page.keyboard.press('Enter');
	if (wasDark) {
		await expect(root).not.toHaveClass(/dark/);
	} else {
		await expect(root).toHaveClass(/dark/);
	}
	await page.reload();
	await expect
		.poll(() => root.evaluate((element) => element.classList.contains('dark')))
		.toBe(!wasDark);
});
