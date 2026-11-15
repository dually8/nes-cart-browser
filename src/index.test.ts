import { describe, it, expect } from 'vite-plus/test';
import { cn } from './lib/utils.js';

describe('component class overrides', () => {
	it('allows consumer spacing overrides without losing interaction styles', () => {
		const classes = cn('p-2 md:p-4 focus:ring-2 disabled:opacity-50', 'p-6 md:p-8').split(' ');
		expect(classes).toEqual(
			expect.arrayContaining(['p-6', 'md:p-8', 'focus:ring-2', 'disabled:opacity-50']),
		);
		expect(classes).not.toContain('p-2');
		expect(classes).not.toContain('md:p-4');
	});
});
