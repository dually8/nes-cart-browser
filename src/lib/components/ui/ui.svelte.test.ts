import { expect, test } from 'vite-plus/test';
import { page, userEvent } from 'vite-plus/test/browser';
import { render } from 'vitest-browser-svelte';
import Fixture from '../../../../tests/fixtures/ui-fixture.svelte';

test('the input component keeps its value bound to the parent', async () => {
	const screen = await render(Fixture);
	await screen.getByRole('textbox', { name: 'Cartridge title' }).fill('Battletoads');
	await expect.element(screen.getByTestId('bound-value')).toHaveTextContent('Battletoads');
});

test('button variants preserve consumer styles and native keyboard behavior', async () => {
	const screen = await render(Fixture);
	const button = screen.getByRole('button', { name: 'Variant button', exact: true });
	await expect.element(button).toHaveStyle({ height: '48px', paddingLeft: '32px' });
	await button.element().focus();
	await userEvent.keyboard('{Enter}');
	await expect.element(screen.getByText('Selected variant: destructive')).toBeVisible();
	await expect.element(button).toHaveClass(/\bbg-destructive\b/);
	await expect.element(button).toHaveStyle({ height: '48px', paddingLeft: '32px' });
	await expect.element(screen.getByRole('button', { name: 'Disabled button' })).toBeDisabled();
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
