# Tibia Item Browser Spec

## Purpose

This repository now contains an Angular-based Tibia item browser page intended to behave like a dense game marketplace or item listing interface.

The current implementation is a client-side-only first version:

- Angular application
- Angular Material for drawers, toolbar, buttons, form controls, icons, menus, and paginator
- Tailwind CSS for layout, spacing, density, dark styling, borders, and responsive behavior
- Transloco for runtime UI i18n
- Angular Signals for local browser state
- Static JSON item data loaded through `HttpClient`
- No backend
- No NgRx
- No Bootstrap
- No Angular Material table
- No AG Grid

## Scope Implemented

The following deliverables were implemented:

1. Item browser page shell
2. Persistent left category sidebar
3. Right-side filter drawer
4. Card-based item grid
5. Dense item card component
6. Signal-based item browser state service
7. Filter service and sort service
8. Paginator wired to filtered and sorted state
9. Static JSON item data loading from assets
10. Small, focused standalone components
11. Runtime i18n for generic UI chrome only

## Page Layout Rules

The page is built around Angular Material drawers:

- Left drawer: category sidebar
- Right drawer: filter drawer
- Center content: toolbar plus scrollable card grid

Layout rules:

- Full-screen dark page shell
- Desktop keeps the category sidebar visible as a side drawer
- Mobile and smaller screens switch the category sidebar to overlay behavior
- Filter drawer always opens as an overlay from the right
- Main content scrolls independently inside `mat-drawer-content`
- The toolbar remains at the top of the content column
- Item results render as cards inside a CSS grid

Primary shell component:

- `src/app/items/pages/item-browser-page/item-browser-page.component.*`

## Routing and App Bootstrap

The Angular starter shell was replaced with the item browser route.

Current app entry behavior:

- `src/app/app.routes.ts` routes `''` to `ItemBrowserPageComponent`
- `src/app/app.html` now renders only `<router-outlet />`
- `src/app/app.config.ts` provides `HttpClient` so asset data can be loaded
- `src/app/app.ts` initializes persisted language selection at startup

## I18n Rules

The repository now includes runtime i18n through Transloco.

Files:

- `src/app/core/i18n/transloco-loader.ts`
- `src/app/core/i18n/transloco.config.ts`
- `src/app/core/i18n/language.service.ts`
- `src/app/core/i18n/transloco-paginator-intl.ts`
- `src/app/core/i18n/language-switcher/*`
- `src/assets/i18n/en.json`
- `src/assets/i18n/pt-BR.json`

Current language support:

- `en`
- `pt-BR`

Spanish is intentionally not included.

Language persistence rules:

- Storage key: `app.language`
- Default language: `en`
- Invalid saved language values fall back to `en`
- Switching language does not reload the page
- Visible UI updates immediately on language change

Critical translation boundary:

- Only generic application UI text is translated
- Tibia canonical values are never translated
- No translation keys are built from item kinds, vocations, skills, elements, armor slots, weapon groups, extra-slot subtypes, item names, or drop/source names
- Item JSON shape remains unchanged

Translated UI areas:

- Toolbar chrome
- Filter drawer chrome
- Generic filter labels
- Result count
- Empty/loading/error states
- Item-card section labels
- Paginator labels

Non-translated Tibia/domain areas:

- Item names
- Creature, boss, quest, and source names
- Vocation names
- Skill names
- Element names
- Item kind values
- Armor slot values
- Weapon group values
- Extra-slot subtype values

## Visual Direction

The implemented UI follows the requested dark fantasy/game data browser direction:

- Page background uses near-black zinc styling
- Panels and cards use darker zinc surfaces
- Borders are subtle and compact
- Accent color uses violet/purple selectively
- Item cards are dense and information-heavy rather than large or decorative
- Hover states slightly brighten borders and surfaces

Styling split:

- Angular Material supplies component primitives and accessibility behavior
- Tailwind supplies layout, spacing, sizing, responsive rules, and utility-driven styling
- Component SCSS handles custom card styling and a few focused overrides

Theme files:

- `src/material-theme.scss`
- `src/styles.css`

## Folder Structure

The item browser feature was added under `src/app/items/` using this structure:

```text
src/app/items/
  components/
    chip-toggle-filter/
    filter-section/
    item-browser-toolbar/
    item-card/
    item-card-grid/
    item-category-sidebar/
    item-filter-drawer/
    number-range-filter/
  models/
  pages/
    item-browser-page/
  services/
    item-browser-state.service.ts
    item-data.service.ts
    item-filter.service.ts
    item-sort.service.ts
```

## Standalone Component Rules

All feature components are implemented as standalone Angular components.

Shared component rules:

- Use `ChangeDetectionStrategy.OnPush`
- Keep filtering and sorting logic out of view components
- Use state service methods for mutations
- Use focused inputs and outputs for reusable filter controls

## Components Implemented

### Item Browser Page

File:

- `src/app/items/pages/item-browser-page/item-browser-page.component.ts`

Responsibilities:

- Hosts the drawer container
- Loads data on init
- Adapts left drawer mode for mobile vs desktop with `BreakpointObserver`
- Coordinates mobile category drawer open and close state

### Item Browser Toolbar

Files:

- `src/app/items/components/item-browser-toolbar/*`

Responsibilities:

- Filter button
- Mobile category button
- Sort menu
- Current visible result range
- Desktop paginator

Rules:

- Filter click emits an output
- Category click emits an output
- Sort changes call the browser state service
- Desktop keeps paginator inside the toolbar

### Item Category Sidebar

Files:

- `src/app/items/components/item-category-sidebar/*`

Responsibilities:

- Displays grouped categories
- Applies category filters through the shared state service
- Reflects selected category visually

Category groups implemented:

- Armor
  - Helmets
  - Armors
  - Legs
  - Boots
  - Shields
  - Spellbooks
- Weapons
  - Swords
  - Axes
  - Clubs
  - Bows
  - Crossbows
  - Wands
  - Rods
  - Throwing
  - Ammunition
- Extra Slot
  - Quivers
  - Trinkets
  - Light Sources
  - Tools
  - Others

Implementation detail:

- Sidebar categories do not navigate to separate routes
- Sidebar selection mutates browser filters in-place

### Item Filter Drawer

Files:

- `src/app/items/components/item-filter-drawer/*`

Responsibilities:

- Hosts the filter UI inside the right overlay drawer
- Supports live filtering
- Exposes a close output for the parent drawer
- Exposes clear-all action

Filter sections implemented:

- Search
- Item type
- Vocation
- Level range
- Armor slot
- Weapon group
- Extra slot
- Skill bonuses
- Protections
- Imbuements and class
- Weight
- Drops from

Notes:

- `Classification` uses `mat-select`
- Bonus and protection thresholds use numeric input fields
- `Drops from` is comma-separated text input
- Filtering is live; no explicit apply button is required

### Item Card Grid

Files:

- `src/app/items/components/item-card-grid/*`

Responsibilities:

- Shows loading state
- Shows load error state
- Shows empty-result state
- Renders paged items in a CSS grid
- Shows mobile paginator below the grid

Grid rule:

- Cards render with CSS grid, not table layout

### Item Card

Files:

- `src/app/items/components/item-card/*`

Responsibilities:

- Render core item identity
- Render vocation summary
- Render dense stat chips
- Render bonuses
- Render protections
- Adjust displayed stats based on item kind

Card behavior:

- Armor cards show slot and armor/defense where available
- Weapon cards show group and attack/defense/range where available
- Quiver cards show volume and ammo types
- Extra-slot cards show subtype and optional attack
- Missing images fall back to a Material icon

### Reusable Filter Components

Files:

- `src/app/items/components/filter-section/*`
- `src/app/items/components/chip-toggle-filter/*`
- `src/app/items/components/number-range-filter/*`

Responsibilities:

- `app-filter-section`: common titled section wrapper with divider styling
- `app-chip-toggle-filter`: multi-select chip-like toggle group
- `app-number-range-filter`: reusable min/max numeric range control

## State Management Spec

Primary state file:

- `src/app/items/services/item-browser-state.service.ts`

State is managed with Angular Signals only.

No NgRx or global store was introduced.

### Primary Signals

- `allItems`
- `filters`
- `sort`
- `pageIndex`
- `pageSize`
- `loading`
- `loadError`

### Derived Signals

- `filteredItems`
- `sortedItems`
- `totalCount`
- `pagedItems`
- `pageStart`
- `pageEnd`

### Mutation Methods

- `loadItems()`
- `patchFilters(partial: Partial<ItemFilters>)`
- `resetFilters()`
- `setSort(sort: ItemSort)`
- `setPage(pageIndex: number, pageSize: number)`
- `setCategoryFilter(category: CategoryFilter)`
- `toggleVocation(vocation: Vocation)`
- `setBonusThreshold(skill: SkillBonus, value: number | null)`
- `setProtectionThreshold(element: Element, value: number | null)`

### State Rules

- Filter changes reset `pageIndex` to `0`
- Sort changes reset `pageIndex` to `0`
- Data loading runs once unless item state is empty and not already loading
- Data loading errors set `loadError`
- Paged items always derive from the sorted items array

## Filter Model Spec

Filter model file:

- `src/app/items/services/item-filter.service.ts`

Implemented filter shape:

```ts
export interface ItemFilters {
  query: string;
  kinds: ItemKind[];
  armorSlots: ArmorSlot[];
  weaponGroups: WeaponGroup[];
  extraSlotSubtypes: ExtraSlotSubtype[];
  vocations: Vocation[];
  minLevel: number | null;
  maxLevel: number | null;
  minWeight: number | null;
  maxWeight: number | null;
  minImbuementSlots: number | null;
  classification: number | null;
  minMaxTier: number | null;
  bonuses: Partial<Record<SkillBonus, number>>;
  protections: Partial<Record<Element, number>>;
  dropsFrom: string[];
}
```

Default filter rules:

- Empty arrays mean unrestricted
- `null` numeric filters mean unrestricted
- Empty query means unrestricted
- Empty bonus/protection maps mean unrestricted

## Filtering Behavior

Filtering logic lives in `ItemFilterService`.

### Query Matching

The search query currently checks these item fields:

- Item name
- Item kind
- Vocation names
- Metadata tags
- Bonus keys
- Protection keys
- Drop source names
- Armor slot when applicable
- Weapon group when applicable
- Extra-slot subtype when applicable
- Literal `Quiver` token for quivers

Query matching is case-insensitive and substring-based.

### Category Matching

Category filtering combines with the rest of the filter state.

Current rules:

- Armor slot filters only match armor items
- Weapon group filters only match weapon items
- Extra-slot subtype filters only match extra-slot items
- If a category-specific filter array is active, other item kinds do not match that category section

### Vocation Matching

Rules implemented:

- No selected vocation means unrestricted
- Items containing `None` are treated as unrestricted and always pass vocation filtering
- Otherwise, an item passes if any selected vocation matches the item’s vocation list

### Level Matching

Rules implemented:

- `null` item level is treated as `0` for range comparison
- Min and max are both optional

### Numeric Threshold Matching

Rules implemented:

- `imbuementSlots` uses minimum comparison
- `classification` uses exact comparison
- `maxTier` uses minimum comparison
- Bonus thresholds require item bonus value to be at least the selected threshold
- Protection thresholds require item protection value to be at least the selected threshold

### Drop Source Matching

Rules implemented:

- Input is comma-separated in the UI
- Stored internally as string array
- Every entered token must match at least one drop source by case-insensitive substring

## Sort Model Spec

Sort model file:

- `src/app/items/services/item-sort.service.ts`

Implemented sort keys:

- `name`
- `level`
- `weight`
- `imbuementSlots`
- `classification`
- `maxTier`
- `armor`
- `attack`
- `defense`

Sort direction:

- `asc`
- `desc`

Default sort:

- `{ key: 'name', direction: 'asc' }`

## Sorting Behavior

Sorting logic lives in `ItemSortService`.

Rules implemented:

- `name` uses `localeCompare`
- Numeric sorts handle `null` values explicitly
- `null` numeric values sort last
- Ties fall back to item name sorting

Kind-specific numeric rules:

- `armor` reads `item.armor.arm` only for armor items
- `attack` reads `item.weapon.attack` only for weapon items
- `defense` reads weapon defense for weapon items and armor defense for armor items

## Data Loading Spec

Data service file:

- `src/app/items/services/item-data.service.ts`

Current data source:

- `/assets/data/items.json`

Actual repository file:

- `public/assets/data/items.json`

Implementation:

- Uses `HttpClient`
- Returns `Observable<TibiaItem[]>`
- Loaded on page init through the state service

## Mock Data Included

The repository now contains local mock items to exercise the UI and filter logic.

Current included sample categories:

- Armor
- Weapon
- Quiver
- Extra-slot

Current included sample examples:

- Demon Helmet
- Magic Plate Armor
- Falcon Greaves
- Gnome Sword
- Falcon Bow
- Cobra Wand
- Jungle Quiver
- Lit Torch
- Moon Mirror
- Monk Bracers

This data is placeholder/static development data and not a complete production dataset.

## Accessibility Rules Applied

Accessibility behavior currently included:

- Icon buttons use `aria-label`
- Filter close button uses `aria-label`
- Material paginator remains keyboard accessible
- Selected category state is not indicated by color alone; active entries also change surface and border treatment
- Reusable controls use native Material form field semantics

## Responsive Behavior

Responsive rules currently implemented:

- Left category drawer is `side` mode on desktop
- Left category drawer is `over` mode on small screens
- Right filter drawer is always `over` mode
- Toolbar paginator is desktop-only
- Grid-level paginator is shown on smaller screens
- Card grid increases columns across breakpoints

## Implementation Constraints Followed

The feature was built following these constraints:

- No backend/API server
- No MongoDB
- No authentication
- No admin editing flow
- No server-side filtering
- No global NgRx store
- No data-table layout
- No infinite scroll

## Important Deviations and Clarifications

The implementation follows the requested feature closely, with these practical clarifications:

- The filter drawer includes `Extra slot` rather than a separate `Quivers` filter section because quivers are already represented by item kind and sidebar category
- `Classification` is implemented in the combined `Imbuements and class` section
- `Armor slot`, `Weapon group`, and `Extra slot` are separate filter sections instead of one combined item type/category control, which keeps the UI denser and easier to scan
- Mock images are currently empty strings, so cards fall back to a Material icon until real assets are added

## Verification Status

Validation completed:

- `npx tsc -p tsconfig.app.json --noEmit`
- `npx ngc -p tsconfig.app.json --noEmit`

Result:

- TypeScript compile check passed
- Angular template compilation passed

Build/runtime limitation on this machine:

- `npm run build` could not run because the local Node version is `v24.13.0`
- Installed Angular CLI requires at least `v24.15.0` on the Node 24 line
- `npm start` is blocked by the same Node version requirement

## Recommended Next Steps

The current implementation is appropriate for a first browser prototype. The next repository changes should likely be:

1. Replace mock JSON with the real item dataset
2. Add real sprite/image assets to `assets`
3. Expand filter sections for any remaining domain-specific fields
4. Add unit tests for `ItemFilterService` and `ItemSortService`
5. Re-run full Angular build and local serve after upgrading Node
