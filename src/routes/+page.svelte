<script lang="ts">
	import { fade } from 'svelte/transition';
	import { quintInOut } from 'svelte/easing';
	import { toggleMode } from 'mode-watcher';
	import { Image } from '@unpic/svelte';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import Sun from 'lucide-svelte/icons/sun';
	import Moon from 'lucide-svelte/icons/moon';
	import type { NesCartItem } from '../models/NesCartItem';
	import carts from '../nesCarts.json';
	import { onMount } from 'svelte';
	import { base } from '$app/paths';

	const baseCarts = carts.map((cart) => ({
		...cart,
		coverPhotoUrl: `${base}${cart.coverPhotoUrl}`
	}));

	let nesCarts: NesCartItem[] = takeCarts(20);

	let searchQuery = '';

	// On search, filter the nesCarts array
	$: filteredNesCarts =
		nesCarts?.filter((nesCart) =>
			nesCart.title.toLowerCase().includes(searchQuery.toLowerCase())
		) || [];

	// TODO: Open dialog on cart click and show nescartdb entry
	// https://nescartdb.com/search/advanced?catalog_op=contains&catalog={catalogId}

	function takeCarts(numCarts?: number) {
		return baseCarts.slice(0, numCarts ? Math.max(numCarts, 0) : undefined);
	}

	onMount(() => {
		nesCarts = takeCarts();
	});
</script>

<div class="container py-2">
	<div class="flex justify-between gap-1 py-4">
		<Input type="text" placeholder="Search" class="grow" bind:value={searchQuery} />
		<Button on:click={toggleMode} variant="outline" size="icon" class="flex-initial">
			<Sun
				class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
			/>
			<Moon
				class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
			/>
			<span class="sr-only">Toggle theme</span>
		</Button>
	</div>
	<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
		{#if filteredNesCarts.length === 0}
			<p
				class="px-1 text-lg font-semibold"
				in:fade={{
					delay: 100,
					duration: 300,
					easing: quintInOut
				}}
			>
				No results found
			</p>
		{:else}
			{#each filteredNesCarts as nesCart, i}
				<a
					href={`https://nescartdb.com/search/advanced?catalog_op=contains&catalog=${nesCart.catalogId}`}
					aria-label={`View details for ${nesCart.title} on NES Cart DB`}
				>
					<Card>
						<CardHeader class="items-center">
							<Image
								src={nesCart.coverPhotoUrl}
								alt={'Cover photo of ' + nesCart.title}
								width={175}
								height={195}
								layout="constrained"
								priority={i < 10}
							/>
						</CardHeader>
						<CardContent>
							<h2 class="text-xl font-semibold">
								{nesCart.title}
							</h2>
							<p class="text-lg">
								{nesCart.catalogId}
							</p>
						</CardContent>
					</Card>
				</a>
			{/each}
		{/if}
	</div>
</div>
