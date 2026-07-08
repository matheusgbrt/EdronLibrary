# Edron Library

Edron Library is a monorepo for a Tibia item browser and the data pipeline that feeds it.

The project started with two goals:

- Exercise SDD and my ability to review, question, and criticize generated code while shaping the product through written specs and deliberate iteration.
- Solve a personal pain point: comparing Tibia equipment across Fandom/Wiki pages is awkward when you want to rank, filter, and sort items by the stats that actually matter for a character.

Instead of jumping between item pages and mentally comparing armor, attack, elemental damage, protections, skill bonuses, imbuement slots, level requirements, and vocation restrictions, Edron Library turns the item data into a browsable decision tool.

## Monorepo Structure

This repository contains two projects under `apps/`.

### `apps/edron-library`

The frontend application.

It is an Angular item browser focused on dense, practical comparison of Tibia equipment. It provides:

- Type-aware item cards for armor, weapons, quivers, and extra-slot items.
- Ranked card information so the most important stats are visually prioritized.
- Filters for item kind, vocation, category, bonuses, protections, elemental damage, level, weight, imbuement slots, classification, and drop sources.
- Multi-sort support for comparing items by ordered priorities such as elemental damage, attack, level, protections, or bonuses.
- External links back to TibiaWiki and Tibia Fandom for item detail pages.

Common commands:

```bash
cd apps/edron-library
npm install
npm start
npm test -- --watch=false
npm run build
```

### `apps/edron-library-data-capturer`

The data capture and normalization project.

It fetches item data from wiki sources, parses raw fields, normalizes them into the frontend item model, validates the generated dataset, and writes the output consumed by the Angular app.

Common commands:

```bash
cd apps/edron-library-data-capturer
npm install
npm run data:capture
npm run data:generate
npm run data:validate
npm run data:all
```

The generated frontend dataset is written to:

```text
apps/edron-library/src/assets/data/items.json
```

## Why This Exists

Tibia equipment decisions are rarely about one stat. A helmet might be mostly about armor, a bow about range, attack, hit chance, and distance fighting, and a weapon might trade physical attack for elemental damage. The public wiki pages contain the information, but they are not designed for ranking or comparing large sets of items by a player's priorities.

Edron Library is meant to close that gap: capture the reference data, normalize it into a structured model, and provide an interface built around comparison.

## Development Notes

- The app is intended to be published at `https://edronlibrary.com/`.
- Static SEO assets such as `robots.txt`, `sitemap.xml`, icons, and the web manifest live in `apps/edron-library/public`.
- Design and planning docs live under `apps/edron-library/docs`.

## Status

This is an active project. The current focus is improving data quality, item-card prioritization, filtering, sorting, and the comparison workflow.
