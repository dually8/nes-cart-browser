<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { quintInOut } from 'svelte/easing';
	import { toggleMode } from 'mode-watcher';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import Sun from 'lucide-svelte/icons/sun';
	import Moon from 'lucide-svelte/icons/moon';
	import type { NesCartItem } from '../models/NesCartItem';

	let nesCarts: NesCartItem[] = [];
	let searchQuery = '';
	let isLoading = true;

	// On search, filter the nesCarts array
	$: filteredNesCarts =
		nesCarts?.filter((nesCart) =>
			nesCart.title.toLowerCase().includes(searchQuery.toLowerCase())
		) || [];

	onMount(async () => {
		await fetchNesCarts();
	});

	async function fetchNesCarts() {
		try {
			const basePath = window.location.origin.includes('github') ? '/nes-cart-browser' : '';
			const response = await fetch(`${basePath}/nesCarts.json`);
			const _carts = await response.json() as NesCartItem[];
			nesCarts = _carts.map((cart) => ({
				...cart,
				coverPhotoUrl: `${basePath}${cart.coverPhotoUrl}`
			}));
		} catch (error) {
			console.error('Error fetching nesCarts:', error);
		} finally {
			isLoading = false;
		}
	}

	// TODO: Open dialog on cart click and show nescartdb entry
	// https://nescartdb.com/search/advanced?catalog_op=contains&catalog={catalogId}
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
		{#if isLoading}
			<!-- Skeleton cards -->
			{#each Array(6) as _}
				<Card>
					<CardTitle>
						<div class="p-2">
							<Skeleton class="h-64 w-full" />
						</div>
					</CardTitle>
					<CardContent>
						<Skeleton class="mt-2 h-6 w-3/4" />
						<Skeleton class="mt-2 h-4 w-1/2" />
					</CardContent>
				</Card>
			{/each}
		{:else if filteredNesCarts.length === 0}
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
				<Card>
					<CardHeader>
						<img
							src={nesCart.coverPhotoUrl}
							alt="Cover Photo"
							class="h-auto w-full"
							aria-hidden="true"
							loading={i < 3 ? 'eager' : 'lazy'}
							width="175"
							height="195"
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
			{/each}
		{/if}
	</div>
</div>
