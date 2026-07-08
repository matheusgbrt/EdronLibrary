# SEO Routes Design

## Goal

Add crawlable category and pilot item URLs for Edron Library so Google can index useful Tibia item comparison pages beyond the root app URL.

## Scope

The first release includes category routes and a small set of item routes for validation:

- `/weapons/bows`
- `/weapons/crossbows`
- `/weapons/axes`
- `/weapons/swords`
- `/armor/helmets`
- `/armor/shields`
- `/armor/boots`
- `/extra-slot/trinkets`
- `/extra-slot/quivers`
- `/items/amber-bow`
- `/items/amber-greataxe`
- `/items/alicorn-headguard`
- `/items/alicorn-ring`
- `/items/amethyst-necklace`

## Architecture

All SEO routes reuse `ItemBrowserPageComponent`. A route catalog describes each route path, display title, meta description, canonical URL, and filter patch. On route changes, the browser page loads items, applies the route filter, updates page metadata, and resets to the first page.

The route catalog is plain TypeScript so it can be used both by Angular routes and focused unit tests. The initial sitemap is static and contains the root URL plus the scoped SEO route set.

## Metadata Rules

- Page titles are English only.
- Canonical URLs use `https://edronlibrary.com`.
- Category descriptions mention the relevant Tibia equipment comparison dimensions.
- Item descriptions mention stats, requirements, imbuement slots, protections, bonuses, and wiki links.
- Missing or unknown routes fall back to the root browser metadata.

## Testing

Unit tests cover:

- Route catalog path generation.
- Category route filters.
- Item route query filters.
- Metadata generation for category and item pages.
- Browser page route application through the state service.
