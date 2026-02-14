# Upgrade Guide: Svelte 5 & SvelteKit 2.x

This document outlines what it would take to upgrade this NES Cart Browser application to the latest versions of Svelte and SvelteKit, along with related dependencies.

## Current State (as of February 2026)

### Current Versions
| Package | Current Version | Latest Version | Status |
|---------|----------------|----------------|---------|
| Svelte | 4.2.7 | 5.51.0 | Major upgrade needed |
| SvelteKit | 2.0.0 | 2.51.0 | Minor upgrade available |
| bits-ui | 0.21.1 | Latest (Svelte 5 compatible) | Compatible |
| Tailwind CSS | 3.3.6 | 3.4+ | Minor upgrade available |
| Vite | 5.0.3 | 5.x (latest) | Minor upgrade available |
| @unpic/svelte | 0.0.53 | Check npm | May need upgrade |

### Dependencies That Will Need Updates
- `@sveltejs/kit` - Already on 2.x, minor update to latest
- `@sveltejs/vite-plugin-svelte` - Will need v4+ for Svelte 5
- `svelte-check` - Will need v4+ for Svelte 5
- `bits-ui` - Update to latest (already Svelte 5 compatible)
- `lucide-svelte` - Update to latest
- `mode-watcher` - Check for Svelte 5 compatibility
- `prettier-plugin-svelte` - Update to v4+ for Svelte 5

## Svelte 5 Migration Overview

### Breaking Changes

Svelte 5 introduces a completely new reactive system called "runes" that replaces the implicit reactivity of Svelte 4. Here are the major changes:

#### 1. Reactivity System - Runes API

**Before (Svelte 4):**
```svelte
<script>
  let count = 0;
  $: doubled = count * 2;
  
  function increment() {
    count += 1;
  }
</script>
```

**After (Svelte 5):**
```svelte
<script>
  let count = $state(0);
  const doubled = $derived(count * 2);
  
  function increment() {
    count += 1;
  }
</script>
```

**Key Changes:**
- `let` → `$state()` for reactive variables
- `$:` → `$derived()` for computed values
- `$:` → `$effect()` for side effects
- **Important:** `$effect()` only runs on the client, NOT during SSR/prerendering

#### 2. Component Props

**Before (Svelte 4):**
```svelte
<script>
  export let title;
  export let coverPhotoUrl;
</script>
```

**After (Svelte 5):**
```svelte
<script>
  let { title, coverPhotoUrl } = $props();
</script>
```

#### 3. Slots → Snippets

Svelte 5 introduces a new "snippets" mechanism that replaces the older `<slot>` API. This affects component composition patterns.

#### 4. Event Handlers

Event handling syntax may need updates, particularly for component events and custom events.

## Migration Strategy for This Project

### Files That Will Need Changes

#### 1. `/src/routes/+page.svelte` (Main Component)

**Current reactive statements to migrate:**
```javascript
// Current (Svelte 4)
let nesCarts: NesCartItem[] = takeCarts(20);
let searchQuery = '';
$: filteredNesCarts = nesCarts?.filter(...)

// Svelte 5
let nesCarts = $state<NesCartItem[]>(takeCarts(20));
let searchQuery = $state('');
const filteredNesCarts = $derived(
  nesCarts?.filter((nesCart) =>
    nesCart.title.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []
);
```

**`onMount` considerations:**
- `onMount` is still supported in Svelte 5 but consider if it should be `$effect` instead
- For this use case, `onMount` is appropriate since we're initializing data

**Event handlers:**
- `on:click={toggleMode}` → May need to be updated depending on mode-watcher's Svelte 5 version
- `bind:value={searchQuery}` → Should still work but verify with `$state`

#### 2. Component Library Files

The components from `bits-ui` should already be Svelte 5 compatible, but verify:
- `/src/lib/components/ui/button`
- `/src/lib/components/ui/card`
- `/src/lib/components/ui/input`

These are likely already using Svelte 5 patterns since bits-ui is designed for Svelte 5.

#### 3. Dependencies to Check
- **mode-watcher** (v0.3.0) - Check if it's Svelte 5 compatible or needs upgrade
- **lucide-svelte** (v0.363.0) - Likely compatible but check for Svelte 5 specific version

### Migration Steps

#### Phase 1: Preparation
1. **Backup your work** - Commit all current changes
2. **Run current tests** - Ensure everything passes with Svelte 4
   ```bash
   pnpm run test
   pnpm run build
   ```
3. **Document current behavior** - Take screenshots, note features
4. **Review dependencies** - Check which need Svelte 5 versions

#### Phase 2: Update Dependencies

1. **Update package.json**:
   ```bash
   pnpm add -D svelte@^5.51.0
   pnpm add -D @sveltejs/kit@^2.51.0
   pnpm add -D @sveltejs/vite-plugin-svelte@^4.0.0
   pnpm add -D svelte-check@^4.0.0
   pnpm add -D prettier-plugin-svelte@^4.0.0
   ```

2. **Update component libraries**:
   ```bash
   pnpm add bits-ui@latest
   pnpm add lucide-svelte@latest
   pnpm add mode-watcher@latest
   ```

3. **Update Tailwind and Vite**:
   ```bash
   pnpm add -D tailwindcss@latest
   pnpm add -D vite@latest
   pnpm add -D autoprefixer@latest
   pnpm add -D postcss@latest
   ```

#### Phase 3: Run Automatic Migration

Svelte provides a migration tool:
```bash
npx sv migrate svelte-5
```

**Note:** This tool is not perfect. It will:
- Convert many `let` declarations to `$state()`
- Convert some `$:` to `$derived()` or `$effect()`
- May not handle complex reactive statements correctly
- **You MUST manually review all changes**

#### Phase 4: Manual Migration

After running the automatic migration:

1. **Review all `$effect()` calls**:
   - Ensure they're only for side effects, not computed values
   - Remember they don't run during SSR
   - Convert to `$derived()` if computing values

2. **Update component props**:
   - Change `export let` to `$props()` destructuring
   - Add types where needed

3. **Test each component**:
   - Verify reactive updates still work
   - Check that computed values update correctly
   - Ensure side effects run at the right time

4. **Update event handlers** if needed

#### Phase 5: Testing

1. **Type checking**:
   ```bash
   pnpm run check
   ```

2. **Unit tests**:
   ```bash
   pnpm run test:unit
   ```

3. **Build**:
   ```bash
   pnpm run build
   ```

4. **Integration tests**:
   ```bash
   pnpm run test:integration
   ```

5. **Manual testing**:
   - Test search functionality
   - Test theme toggle
   - Test image loading
   - Test clicking on carts
   - Verify on different screen sizes

## SvelteKit 2.x Update

The app is already on SvelteKit 2.0.0, so updating to 2.51.0 should be straightforward:

```bash
pnpm add -D @sveltejs/kit@^2.51.0
```

No breaking changes expected between 2.0.0 and 2.51.0. Check the [SvelteKit changelog](https://github.com/sveltejs/kit/releases) for new features.

## Component Library Updates

### bits-ui and shadcn-svelte

Good news: **Both bits-ui and shadcn-svelte are fully compatible with Svelte 5** as of 2026.

- **bits-ui** is explicitly designed for Svelte 5
- Components used in this project (Button, Card, Input) should work without changes
- May need to update to latest version to ensure compatibility

### Verification Steps

After updating bits-ui:
1. Check that all UI components still render
2. Verify button clicks work
3. Verify input binding works
4. Check card layout
5. Test dark mode toggle

## Potential Issues and Solutions

### Issue 1: `$effect()` Running on Mount
**Problem:** Converting `onMount` to `$effect()` may cause issues with SSR.

**Solution:** Keep using `onMount()` for initialization code, or ensure `$effect()` code is client-only safe.

### Issue 2: Reactive Statements with Side Effects
**Problem:** Some `$:` statements may mix computed values and side effects.

**Solution:** Split into separate `$derived()` and `$effect()` calls.

### Issue 3: Component Library Breaking Changes
**Problem:** bits-ui or mode-watcher might have breaking changes.

**Solution:** Check their migration guides and changelogs. May need to update component implementations.

### Issue 4: TypeScript Errors
**Problem:** Type definitions may change between versions.

**Solution:** Update type imports and definitions. Run `pnpm run check` frequently.

## Testing Checklist

After migration, verify:

- [ ] Application builds successfully (`pnpm run build`)
- [ ] Type checking passes (`pnpm run check`)
- [ ] All tests pass (`pnpm run test`)
- [ ] Search functionality works
- [ ] Cart images load correctly
- [ ] Theme toggle works (light/dark mode)
- [ ] Clicking carts opens correct nescartdb.com URLs
- [ ] Responsive layout works on mobile/tablet/desktop
- [ ] No console errors in browser
- [ ] Lighthouse score hasn't regressed

## Timeline Estimate

- **Small project** (this app): 2-4 hours
  - 30 min: Update dependencies
  - 1-2 hours: Run migration tool and manual fixes
  - 1-2 hours: Testing and debugging

## Resources

- [Svelte 5 Migration Guide](https://svelte.dev/docs/svelte/v5-migration-guide)
- [Svelte 5 Documentation](https://svelte.dev/docs)
- [SvelteKit Releases](https://github.com/sveltejs/kit/releases)
- [bits-ui Documentation](https://www.bits-ui.com/docs/getting-started)
- [shadcn-svelte Svelte 5 Migration](https://shadcn-svelte.com/docs/migration/svelte-5)

## Next Steps

See [IMAGE_OPTIMIZATION.md](./IMAGE_OPTIMIZATION.md) for recommendations on improving image loading performance.
