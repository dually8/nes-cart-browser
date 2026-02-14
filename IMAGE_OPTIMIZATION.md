# Image Optimization Guide

This document provides recommendations for improving image loading performance in the NES Cart Browser application to achieve better Lighthouse scores and faster page loads.

## Current State

### Current Implementation

The application currently uses `@unpic/svelte` (v0.0.53) for image handling:

```svelte
<Image
  src={nesCart.coverPhotoUrl}
  alt={'Cover photo of ' + nesCart.title}
  width={175}
  height={195}
  layout="constrained"
  priority={i < 10} />
```

**Current Stats:**
- Total images: ~790 NES cartridge cover images
- Total size: 68MB in `/static/assets/`
- Format: WebP (already optimized!)
- Loading strategy: First 10 images prioritized, rest lazy-loaded

### Strengths of Current Approach

✅ Already using WebP format (modern, efficient)
✅ Using the `@unpic/svelte` Image component
✅ Priority loading for first 10 images
✅ Constrained layout with fixed dimensions (prevents layout shift)
✅ Lazy loading for below-the-fold images (implicit with unpic)

### Potential Issues

❌ Large total asset size (68MB) - all images loaded at full size
❌ No responsive image sizes - always loads 175x195 regardless of screen size
❌ No LQIP (Low Quality Image Placeholder) for progressive loading
❌ No image format negotiation (AVIF fallback, etc.)
❌ Missing `loading="lazy"` attribute on Image component
❌ All 790 images included in static build (even if never viewed)

## Recommended Improvements

### Option 1: Use SvelteKit's Official `@sveltejs/enhanced-img` (RECOMMENDED)

This is the **official SvelteKit solution** for static images, built on top of `vite-imagetools`.

#### Benefits

✅ **Official SvelteKit package** - Best long-term support
✅ **Multiple formats** - Generates AVIF, WebP, and fallback formats automatically
✅ **Responsive images** - Creates multiple sizes for different screen widths
✅ **Automatic optimization** - Compresses images at build time
✅ **Better Lighthouse scores** - Optimized for Core Web Vitals
✅ **Privacy** - Strips EXIF metadata
✅ **Layout stability** - Sets proper width/height to prevent CLS

#### Installation

```bash
pnpm add -D @sveltejs/enhanced-img
```

#### Configuration

Update `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { enhancedImages } from '@sveltejs/enhanced-img';

export default defineConfig({
  plugins: [
    enhancedImages(), // Must come before sveltekit()
    sveltekit()
  ]
});
```

#### Usage

Update `/src/routes/+page.svelte`:

```svelte
<script lang="ts">
  // Remove: import { Image } from '@unpic/svelte';
  // Images are now handled by the enhanced:img component
</script>

<!-- Replace Image component with enhanced:img -->
<enhanced:img
  src="../assets/{nesCart.catalogId}.webp"
  alt="Cover photo of {nesCart.title}"
  loading={i < 10 ? 'eager' : 'lazy'}
/>
```

**Note:** The `enhanced:img` component will:
- Automatically set width/height based on the actual image
- Generate multiple formats (AVIF, WebP, original)
- Create responsive sizes
- Optimize compression

#### Migration Steps

1. Install `@sveltejs/enhanced-img`
2. Update `vite.config.ts` as shown above
3. Replace `<Image>` components with `<enhanced:img>`
4. Remove fixed width/height (let the component infer from actual images)
5. Keep `loading="lazy"` for below-fold images
6. Test build and verify images load correctly

#### Expected Improvements

- **Lighthouse Performance**: +10-20 points (by serving optimal formats and sizes)
- **Load Time**: 40-60% faster (AVIF is ~50% smaller than WebP)
- **LCP (Largest Contentful Paint)**: Improved by priority loading
- **CLS (Cumulative Layout Shift)**: Maintained at 0 (proper dimensions)

---

### Option 2: Use `@zerodevx/svelte-img` for Progressive Loading

If you want **progressive image loading with LQIP** (Low Quality Image Placeholder), use this package.

#### Benefits

✅ **LQIP support** - Shows blurred placeholder while loading
✅ **Smooth fade-in** - Better UX as images load
✅ **Responsive images** - Multiple sizes for different viewports
✅ **Multiple formats** - AVIF, WebP, JPEG
✅ **Built on vite-imagetools** - Same foundation as enhanced-img

#### Installation

```bash
pnpm add -D @zerodevx/svelte-img
```

#### Configuration

Update `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { imagetools } from '@zerodevx/svelte-img/vite';

export default defineConfig({
  plugins: [
    imagetools(), // Add before sveltekit()
    sveltekit()
  ]
});
```

#### Usage

```svelte
<script>
  import Img from '@zerodevx/svelte-img';
  import coverMeta from '../assets/NES-AB-USA.webp?as=run';
</script>

<Img src={coverMeta} alt="Game cover" />
```

**Note:** This requires importing each image individually, which may be tedious for 790 images. Consider if the LQIP effect is worth the extra complexity.

---

### Option 3: Keep `@unpic/svelte` with Optimizations

If you want to **keep the current approach**, here are improvements:

#### Update Image Component

```svelte
<Image
  src={nesCart.coverPhotoUrl}
  alt="Cover photo of {nesCart.title}"
  width={175}
  height={195}
  layout="constrained"
  priority={i < 10}
  loading={i < 10 ? 'eager' : 'lazy'}  // Add explicit loading attribute
  breakpoints={[175, 350, 525]}  // Add responsive breakpoints
/>
```

#### Pre-optimize Images

Use a tool like `sharp-cli` or `imagemin` to further compress the WebP images:

```bash
# Install sharp-cli
pnpm add -D sharp-cli

# Optimize all WebP images
npx sharp-cli -i 'static/assets/*.webp' -o 'static/assets/optimized/' --webp
```

---

## Comparison: Which Option to Choose?

| Feature | enhanced-img | svelte-img | unpic (current) |
|---------|-------------|-----------|-----------------|
| **Official SvelteKit** | ✅ Yes | ❌ No | ❌ No |
| **Build-time optimization** | ✅ Yes | ✅ Yes | ❌ No |
| **Multiple formats (AVIF)** | ✅ Yes | ✅ Yes | ⚠️ Limited |
| **Responsive sizes** | ✅ Auto | ✅ Auto | ⚠️ Manual |
| **LQIP support** | ❌ No | ✅ Yes | ❌ No |
| **Easy migration** | ✅ Moderate | ⚠️ Complex | ✅ Current |
| **File size reduction** | ✅ 40-60% | ✅ 40-60% | ❌ 0% |
| **Best for** | Most projects | Progressive UX | Already works |

**Recommendation: Use `@sveltejs/enhanced-img`** for the best balance of performance, maintainability, and official support.

---

## Additional Optimizations

### 1. Implement Virtual Scrolling / Pagination

With 790 images, consider not loading all at once:

```svelte
<script>
  let visibleCarts = $state(20); // Start with 20
  
  function loadMore() {
    visibleCarts += 20;
  }
  
  // Or use infinite scroll with intersection observer
</script>

{#each filteredNesCarts.slice(0, visibleCarts) as nesCart, i}
  <!-- Render cart -->
{/each}

{#if visibleCarts < filteredNesCarts.length}
  <Button on:click={loadMore}>Load More</Button>
{/if}
```

**Expected Impact:**
- Initial load: Only 20 images (~1.7MB instead of 68MB)
- **Lighthouse Performance**: +20-30 points
- **FCP (First Contentful Paint)**: Much faster

### 2. Preload Critical Images

For the first visible row of images, add preload hints:

```svelte
<svelte:head>
  {#each filteredNesCarts.slice(0, 5) as cart}
    <link rel="preload" as="image" href={cart.coverPhotoUrl} />
  {/each}
</svelte:head>
```

### 3. Use CDN for Static Assets

If deploying to Vercel, Netlify, or Cloudflare Pages, ensure images are served from their CDN with proper caching headers.

### 4. Implement Service Worker Caching

Cache images in a service worker for repeat visits:

```typescript
// In your service worker
self.addEventListener('fetch', (event) => {
  if (event.request.destination === 'image') {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request).then((fetchResponse) => {
          return caches.open('images').then((cache) => {
            cache.put(event.request, fetchResponse.clone());
            return fetchResponse;
          });
        });
      })
    );
  }
});
```

---

## Implementation Plan

### Phase 1: Quick Wins (1 hour)
1. ✅ Add explicit `loading="lazy"` to non-priority images
2. ✅ Implement "Load More" button to limit initial images to 20
3. ✅ Add preload hints for first 5 images

**Expected Lighthouse Improvement:** +15-25 points

### Phase 2: Enhanced Images (2-3 hours)
1. Install and configure `@sveltejs/enhanced-img`
2. Update all `<Image>` components to `<enhanced:img>`
3. Test build and verify all images load correctly
4. Update `nesCarts.json` scraper to store relative paths

**Expected Lighthouse Improvement:** +20-30 points

### Phase 3: Advanced (Optional, 2-4 hours)
1. Implement infinite scroll with Intersection Observer
2. Add service worker for image caching
3. Consider LQIP with `svelte-img` if UX benefit is desired

---

## Expected Lighthouse Scores

### Current (Estimated)
- **Performance**: 60-70
- **LCP**: 2.5-4s
- **Total Blocking Time**: Low (good)
- **CLS**: 0 (good - fixed dimensions)

### After Enhanced Images + Load More
- **Performance**: 90-95
- **LCP**: 1.2-2s
- **Total Blocking Time**: Low (good)
- **CLS**: 0 (good)

### After All Optimizations
- **Performance**: 95-100
- **LCP**: 0.8-1.5s
- **Total Blocking Time**: Low (good)
- **CLS**: 0 (good)

---

## Testing Checklist

After implementing changes:

- [ ] Run Lighthouse audit (Performance, Accessibility, Best Practices, SEO)
- [ ] Test on slow 3G network throttling
- [ ] Verify images load on mobile devices
- [ ] Check that first 10 images load quickly (priority)
- [ ] Verify lazy loading works for below-fold images
- [ ] Test search functionality still works
- [ ] Verify AVIF images work in modern browsers
- [ ] Check WebP fallback works in older browsers
- [ ] Measure LCP, FCP, CLS metrics
- [ ] Compare build size before/after

---

## Resources

- [SvelteKit Enhanced Images Docs](https://svelte.dev/docs/kit/images)
- [@sveltejs/enhanced-img on npm](https://www.npmjs.com/package/@sveltejs/enhanced-img)
- [svelte-img GitHub](https://github.com/zerodevx/svelte-img)
- [vite-imagetools GitHub](https://github.com/JonasKruckenberg/imagetools)
- [Web.dev: Optimize Images](https://web.dev/fast/#optimize-your-images)
- [Web.dev: Lazy Loading](https://web.dev/lazy-loading-images/)

---

## Conclusion

For the **best results with minimal effort**, implement:

1. **Phase 1 optimizations** (Load More button) - Quick win
2. **@sveltejs/enhanced-img** - Official, performant, maintainable

This combination should improve your Lighthouse Performance score from ~65 to **90+** and significantly reduce initial page load time.
