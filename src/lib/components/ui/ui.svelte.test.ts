import { expect, test } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import Fixture from '../../../../tests/fixtures/ui-fixture.svelte';

test('the input component keeps its value bound to the parent', async () => {
	const screen = await render(Fixture);
	await screen.getByRole('textbox', { name: 'Cartridge title' }).fill('Battletoads');
	await expect.element(screen.getByTestId('bound-value')).toHaveTextContent('Battletoads');
});

test('the dialog opens, closes, and restores keyboard focus', async () => {
	const screen = await render(Fixture);
	const trigger = screen.getByRole('button', { name: 'Open dialog' });
	await trigger.click();
	const dialog = page.getByRole('dialog', { name: 'Upgrade dialog' });
	await expect.element(dialog).toBeVisible();
	await page.getByRole('button', { name: 'Close', exact: true }).click();
	await expect.element(dialog).not.toBeInTheDocument();
	await expect.element(trigger).toHaveFocus();
	await trigger.click();
	await expect.element(dialog).toBeVisible();
	await userEvent.keyboard('{Escape}');
	await expect.element(dialog).not.toBeInTheDocument();
	await expect.element(trigger).toHaveFocus();
});
