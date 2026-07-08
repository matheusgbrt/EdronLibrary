# Edron Library Data Capturer Spec

## Purpose

The data capturer turns Tibia wiki source data into the structured item dataset consumed by the Edron Library frontend.

The frontend is intentionally static and client-side. This project owns the data pipeline that makes that possible: fetch source pages, parse item facts, normalize them into the shared item model, validate the result, apply manual corrections, and write the generated dataset into the Angular app.

## Project Location

```text
apps/edron-library-data-capturer
```

Common commands:

```bash
npm run data:capture
npm run data:generate
npm run data:validate
npm run data:all
```

## Pipeline Overview

The pipeline has three primary stages.

### Capture

Command:

```bash
npm run data:capture
```

Primary file:

- `src/commands/capture-items.ts`

Responsibilities:

- Read configured capture categories.
- Fetch category members from wiki source pages.
- Fetch individual item pages.
- Parse raw infobox fields and text sections.
- Write raw captured records and capture errors.

Outputs:

```text
output/raw-captured-items.json
output/capture-errors.json
raw/pages/
raw/api/
```

### Generate

Command:

```bash
npm run data:generate
```

Primary file:

- `src/commands/generate-items.ts`

Responsibilities:

- Read `output/raw-captured-items.json`.
- Match each record back to its capture category.
- Normalize each raw item into the frontend item model.
- Apply manual overrides.
- Validate every item with Zod schemas.
- Optionally download item images when image downloading is enabled.
- Write generated data to the capturer output and frontend assets.

Outputs:

```text
output/items.generated.json
../edron-library/src/assets/data/items.json
../edron-library/src/assets/images/items/
```

### Validate

Command:

```bash
npm run data:validate
```

Primary file:

- `src/commands/validate-items.ts`

Responsibilities:

- Read the generated dataset.
- Validate it against `ItemDatasetSchema`.
- Fail when generated data no longer conforms to the frontend contract.

## Source Configuration

Primary files:

- `src/config/sources.ts`
- `src/config/categories.ts`
- `src/config/paths.ts`

Capture categories define:

- Stable category key.
- Frontend item kind.
- Optional item subtype.
- Armor slot, weapon group, or extra-slot subtype.
- Wiki category titles and optional list pages.

Supported normalized item groups:

- Armor: Helmet, Armor, Legs, Boots, Shield, Spellbook.
- Weapons: Sword, Axe, Club, Bow, Crossbow, Wand, Rod, Throwing, Ammunition.
- Quivers.
- Extra-slot items: Trinket, LightSource, Tool, Other.

Eligibility rules:

- Category membership alone is not trusted.
- Raw fields such as `objectclass`, `primarytype`, `slot`, and `weapontype` are checked to avoid pulling unrelated pages.
- User pages are excluded from weapon capture.
- Quivers and extra-slot items have dedicated eligibility checks.

## Raw Parsing

Primary parser files:

- `src/parsers/item-page-parser.ts`
- `src/parsers/infobox-parser.ts`
- `src/parsers/attributes-parser.ts`
- `src/parsers/drops-parser.ts`
- `src/parsers/image-parser.ts`

Parsing responsibilities:

- Preserve raw source fields for normalization.
- Extract attributes such as skill bonuses, protections, and elemental damage from wiki text.
- Extract drop sources into structured categories.
- Extract image URLs and asset path information.

Rules:

- Parsers should remain source-oriented and avoid frontend-specific ranking or display logic.
- String cleanup should be centralized in utilities when repeated.
- Attribute parsing must distinguish between skill bonuses and elemental damage.
- Dropped-by parsing should preserve source names rather than translate them.

## Normalization

Primary files:

- `src/normalizers/normalize-item.ts`
- `src/normalizers/normalize-armor.ts`
- `src/normalizers/normalize-weapon.ts`
- `src/normalizers/normalize-quiver.ts`
- `src/normalizers/normalize-extra-slot.ts`

Normalization responsibilities:

- Produce frontend `TibiaItem` shapes.
- Normalize IDs, names, vocations, levels, weights, marketability, imbuement slots, classification, max tier, bonuses, protections, drops, sources, assets, and metadata.
- Populate kind-specific models for armor, weapons, quivers, and extra-slot items.
- Infer data quality where critical fields are missing.

Weapon rules:

- Physical attack belongs in `weapon.attack`.
- Ranged `atk_mod` values for bows, crossbows, and throwing weapons are attack modifiers and normalize into `weapon.attack`.
- Ranged `hit_mod` values normalize into `weapon.hitPercent`.
- Elemental attack fields normalize into `weapon.elementDamage`.
- Explicit wand/rod-style `damagetype` values normalize into `weapon.damageType` when no elemental attack field is present.
- Explicit `damagerange` estimates such as `19 (13-25)` or `56-74` normalize into `weapon.damageRange` with `average`, `min`, `max`, and `raw`; min/max-only values compute `average` from the midpoint.
- Elemental damage must not be emitted as a skill bonus.
- Weapon defense-like values normalize into `weapon.defense`; the frontend may display that value as Armor.

Armor rules:

- Armor value normalizes into `armor.arm`.
- Shield/spellbook defense normalizes into `armor.def` when applicable.
- The frontend displays shield defense as Armor, but the data model preserves the structured source distinction.

Extra-slot rules:

- Subtypes are normalized into `extraSlot.subtype`.
- Extra-slot subtype alone should not imply a high-priority frontend stat.

## Manual Overrides

Primary files:

- `src/overrides/apply-overrides.ts`
- `patches/manual-overrides.json`
- `patches/ignored-pages.json`

Rules:

- Overrides are applied after normalization and before final dataset validation.
- Overrides exist for source inconsistencies and known edge cases.
- Overrides should stay minimal and documented by the changed fields.
- Ignored pages should be used when source pages are not valid item records for the target browser.

## Validation

Primary files:

- `src/validation/tibia-item.schema.ts`
- `src/validation/item-dataset.schema.ts`

Rules:

- Every generated item must pass `TibiaItemSchema`.
- The full output must pass `ItemDatasetSchema`.
- Validation failures are logged during generation and excluded from the final validated list.
- `data:validate` must pass before generated data is considered ready for frontend use.

Dataset metadata:

- `schemaVersion` is `1`.
- `sourceSummary.primary` is currently `tibiafandom`.
- `sourceSummary.generatedBy` is `apps/edron-library-data-capturer`.

## Output Contract With Frontend

The generated frontend dataset path is:

```text
apps/edron-library/src/assets/data/items.json
```

Contract rules:

- The frontend treats this file as static read-only data.
- The frontend should not repair normalization problems at display time when the capturer can fix them.
- Data fields used by filters, sorts, and card ranking must be normalized consistently.
- Changes to the generated data shape require schema updates and frontend model updates.

## Tests

Current focused tests:

- `src/parsers/attributes-parser.test.ts`
- `src/normalizers/normalize-weapon.test.ts`

Expected verification commands:

```bash
npx tsx --test src/parsers/attributes-parser.test.ts src/normalizers/normalize-weapon.test.ts
npx tsc --noEmit
npm run data:validate
```

Important regression coverage:

- Attribute parsing separates elemental damage from skill bonuses.
- Ranged weapon `atk_mod` normalizes into attack.
- Ranged weapon `hit_mod` is preserved as hit percent.

## Future Work

Likely next improvements:

- Broaden parser and normalizer regression coverage.
- Add tests for armor, extra-slot, quiver, drops, and overrides.
- Track source update dates or revisions more explicitly.
- Consider separate source adapters if TibiaWiki and Tibia Fandom are both used as primary sources.
