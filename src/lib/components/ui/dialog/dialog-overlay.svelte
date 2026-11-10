<script lang="ts">
	import { Dialog as DialogPrimitive } from 'bits-ui';
	import { cn } from '#lib/utils.js';
	import { fade, type FadeParams } from 'svelte/transition';

	type $$Props = DialogPrimitive.OverlayProps & {
		transition?: typeof fade;
		transitionConfig?: FadeParams;
	};

	let className: $$Props['class'] = undefined;
	export let transition = fade;
	export let transitionConfig: FadeParams = { duration: 150 };
	export { className as class };
</script>

<DialogPrimitive.Overlay
	forceMount
	{...$$restProps}>
	{#snippet child({ props, open })}
		{#if open}
			<div
				{...props}
				class={cn('fixed inset-0 z-50 bg-background/80 backdrop-blur-sm', className)}
				transition:transition={transitionConfig}>
			</div>
		{/if}
	{/snippet}
</DialogPrimitive.Overlay>
