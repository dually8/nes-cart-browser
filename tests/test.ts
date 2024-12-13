import { expect, test } from '@playwright/test';

test('Page should load and be searchable', async ({ page }) => {
	await page.goto('/');
	const searchBar = await page.getByPlaceholder('Search');
	expect(searchBar).toBeVisible();
	const mainGrid = await page.locator('.grid');
	expect(mainGrid).toBeVisible();
	await expect(page.getByText('10-Yard Fight')).toBeVisible();
	searchBar.fill('Battletoads');
	await expect(page.getByText('10-Yard Fight')).not.toBeVisible();
	await expect(page.getByText('Battletoads').first()).toBeVisible();
	await expect(page.getByText('Double Dragon').first()).toBeVisible();
});
