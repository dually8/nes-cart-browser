<script lang="ts">
	import * as Dialog from '#lib/components/ui/dialog/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Button, type ButtonVariant } from '#lib/components/ui/button/index.js';
	import '../../src/routes/layout.css';

	let value = $state('');
	let variant = $state<ButtonVariant>('outline');
</script>

<label for="upgrade-input">Cartridge title</label>
<Input
	id="upgrade-input"
	bind:value />
<p data-testid="bound-value">{value}</p>

<Button
	{variant}
	size="sm"
	class="h-12 px-8"
	onclick={() => (variant = variant === 'outline' ? 'destructive' : 'outline')}>
	Variant button
</Button>
<p>Selected variant: {variant}</p>
<Button disabled>Disabled button</Button>

<Dialog.Root>
	<Dialog.Trigger>Open dialog</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Title>Upgrade dialog</Dialog.Title>
		<Dialog.Description>
			Checks the copied dialog components with the updated UI packages.
		</Dialog.Description>
	</Dialog.Content>
</Dialog.Root>
