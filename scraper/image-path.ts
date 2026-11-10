import path from 'node:path';

/** Keep catalog IDs from remote HTML from becoming filesystem paths. */
export function getImagePath(assetsDir: string, catalogId: string): string {
	if (/^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/.exec(catalogId)?.[0] !== catalogId) {
		throw new Error(`Invalid catalog ID: ${JSON.stringify(catalogId)}`);
	}

	const root = path.resolve(assetsDir);
	const imagePath = path.resolve(root, `${catalogId}.png`);
	if (path.dirname(imagePath) !== root) {
		throw new Error('Image path must remain inside the assets directory');
	}
	return imagePath;
}
