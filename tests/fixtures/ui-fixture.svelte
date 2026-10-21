<script lang="ts">
	import * as Dialog from '#lib/components/ui/dialog/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import '../../src/routes/layout.css';

	let value = $state('');
</script>

<label for="upgrade-input">Cartridge title</label>
<Input
	id="upgrade-input"
	bind:value />
<p data-testid="bound-value">{value}</p>

<Dialog.Root>
	<Dialog.Trigger>Open dialog</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Title>Upgrade dialog</Dialog.Title>
		<Dialog.Description>
			Checks the copied dialog components with the updated UI packages.
		</Dialog.Description>
	</Dialog.Content>
</Dialog.Root>
