import path from 'node:path';
import { describe, expect, it } from 'vitest';
import carts from '../src/nesCarts.json';
import { getImagePath } from './image-path';

const assetsDir = path.resolve('static/assets');

describe('scraped image paths', () => {
	it('preserves every bundled catalog ID and filename', () => {
		for (const cart of carts) {
			expect(getImagePath(assetsDir, cart.catalogId)).toBe(
				path.join(assetsDir, `${cart.catalogId}.png`),
			);
		}
	});

	it.each([
		'../../outside-assets',
		'..\\..\\outside-assets',
		'../nested\\outside-assets',
		'/tmp/outside-assets',
		'C:\\outside-assets',
		'\\\\server\\share\\outside-assets',
		'%2e%2e%2foutside-assets',
		'NES/../../outside-assets',
		'NES\u0000-ID',
		' NES-TY-USA',
		'NES-TY-USA\n',
		'NES-TY-USA ',
		'',
	])('rejects unsafe remote catalog ID %j', (catalogId) => {
		expect(() => getImagePath(assetsDir, catalogId)).toThrow('Invalid catalog ID');
	});
});
