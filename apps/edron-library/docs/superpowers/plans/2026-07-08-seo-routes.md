# SEO Routes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add category and pilot item URLs with route-aware filters, titles, descriptions, canonicals, and sitemap entries.

**Architecture:** A plain TypeScript SEO route catalog provides route definitions, filter patches, and metadata. Angular routes reuse `ItemBrowserPageComponent`; the page applies the active route definition to browser state and metadata services. Static sitemap entries mirror the scoped route set.

**Tech Stack:** Angular standalone routes, Angular `Title` and `Meta`, Angular signals, Vitest/Karma-compatible Angular unit tests.

## Global Constraints

- The app remains English-only.
- The first release includes categories plus five pilot item pages only.
- All SEO URLs use `https://edronlibrary.com`.
- Existing browser cards, filters, and sort behavior are reused.
- No SSR or prerendering is introduced in this slice.

---

### Task 1: SEO Route Catalog

**Files:**
- Create: `apps/edron-library/src/app/items/services/item-seo-route.service.ts`
- Test: `apps/edron-library/src/app/items/services/item-seo-route.service.spec.ts`

**Interfaces:**
- Produces: `SEO_ROUTE_DEFINITIONS`, `findSeoRouteByPath(path: string)`, `buildSeoRoutes()`.

- [ ] Write failing tests for category and item metadata/filter definitions.
- [ ] Run the focused spec and verify failures.
- [ ] Implement the route catalog.
- [ ] Run the focused spec and verify pass.

### Task 2: Route-Aware Browser Page

**Files:**
- Modify: `apps/edron-library/src/app/app.routes.ts`
- Modify: `apps/edron-library/src/app/items/pages/item-browser-page/item-browser-page.component.ts`
- Test: `apps/edron-library/src/app/items/pages/item-browser-page/item-browser-page.component.spec.ts`

**Interfaces:**
- Consumes: `SEO_ROUTE_DEFINITIONS` and route `data.seoRoute`.
- Produces: browser state patches and route-aware metadata updates.

- [ ] Write failing tests proving category routes and item routes patch filters.
- [ ] Run the focused spec and verify failures.
- [ ] Add routes and page route handling.
- [ ] Run the focused spec and verify pass.

### Task 3: Static SEO Assets

**Files:**
- Modify: `apps/edron-library/public/sitemap.xml`

**Interfaces:**
- Consumes: scoped SEO route list from the design.
- Produces: sitemap entries Google can crawl.

- [ ] Update sitemap entries for root, categories, and pilot item pages.
- [ ] Run build to verify assets copy correctly.
- [ ] Commit the complete SEO route slice.
