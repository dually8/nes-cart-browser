<script lang="ts">
	import { Button as ButtonPrimitive } from 'bits-ui';
	import { cn } from '#lib/utils.js';
	import { buttonVariants, type Props } from './index.js';

	let {
		class: className,
		variant = 'default',
		size = 'default',
		type = 'button',
		children,
		...restProps
	}: Props = $props();
</script>

<ButtonPrimitive.Root
	{type}
	class={cn(buttonVariants({ variant, size }), className)}
	{...restProps}>
	{@render children?.()}
</ButtonPrimitive.Root>
