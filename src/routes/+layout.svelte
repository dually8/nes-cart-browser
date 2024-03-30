<script>
	import '../app.pcss';
	import { ModeWatcher } from 'mode-watcher';
	export const prerender = true;
	export const trailingSlash = 'always';
</script>

<ModeWatcher />
<slot />
