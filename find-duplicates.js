import { readFileSync } from 'fs';

/** @type {import('./src/models/NesCartItem').NesCartItem[]} */
const data = JSON.parse(readFileSync('./src/nesCarts.json', 'utf-8'));

/** @type {Record<string, { title: string; region: string; index: number }[]>} */
const counts = {};

data.forEach((item, index) => {
	if (!counts[item.catalogId]) {
		counts[item.catalogId] = [];
	}
	counts[item.catalogId].push({ title: item.title, region: item.region, index });
});

const duplicates = Object.entries(counts).filter(([, items]) => items.length > 1);

console.log('Total items:', data.length);
console.log('Unique catalogIds:', Object.keys(counts).length);
console.log('\nDuplicate catalogIds found:', duplicates.length);
console.log('\n=== DUPLICATES ===\n');

duplicates.forEach(([catalogId, items]) => {
	console.log(`\n📦 catalogId: "${catalogId}" (appears ${items.length} times)`);
	items.forEach(({ title, region, index }) => {
		console.log(`   - [${index}] ${title} (${region})`);
	});
});
