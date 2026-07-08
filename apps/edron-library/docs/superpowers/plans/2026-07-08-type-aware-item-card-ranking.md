# Type-Aware Item Card Ranking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build type-aware item card ranking so each item card highlights its most important facts with icons and visual priority.

**Architecture:** Add a pure ranking helper next to the item-card component that converts `TibiaItem` data into primary, secondary, meta, bonus, and protection facts. Keep `ItemCardComponent` responsible for translation and rendering, while the helper owns ranking, sorting, and icon/tone choices.

**Tech Stack:** Angular 22 standalone components, Angular Material icons, Transloco, TypeScript, SCSS, Angular unit test builder.

## Global Constraints

- Preserve the existing dense card grid and dark operational UI style.
- Do not change filtering, sorting, pagination, or captured item data.
- Do not introduce a new icon library; use Angular Material icons already available to the component.
- Missing optional numeric values are omitted, not rendered as empty chips.
- Bonus and protection facts sort by numeric value descending, then alphabetically for ties.
- Cards with no bonuses or protections do not show empty section headers.

---

## File Structure

- Create `apps/edron-library/src/app/items/components/item-card/item-card-rank.ts`: pure ranking helper, exported types, icon mapping, sorting helpers.
- Create `apps/edron-library/src/app/items/components/item-card/item-card-rank.spec.ts`: focused unit tests for armor, weapon, quiver, extra-slot, missing values, and sorting.
- Modify `apps/edron-library/src/app/items/components/item-card/item-card.component.ts`: remove flat `statRows()`, add `cardModel()` and translation formatting for helper facts.
- Modify `apps/edron-library/src/app/items/components/item-card/item-card.component.html`: render primary tiles, secondary chips, meta chips, bonuses, and protections.
- Modify `apps/edron-library/src/app/items/components/item-card/item-card.component.scss`: add ranked tile/chip styles and keep the card compact.

---

### Task 1: Pure Type-Aware Ranking Helper

**Files:**
- Create: `apps/edron-library/src/app/items/components/item-card/item-card-rank.ts`
- Test: `apps/edron-library/src/app/items/components/item-card/item-card-rank.spec.ts`

**Interfaces:**
- Consumes: `TibiaItem` from `../../models`
- Produces:
  - `export type RankedFactTone = 'primary' | 'secondary' | 'meta' | 'bonus' | 'protection';`
  - `export interface RankedItemFact { key: string; labelKey: string | null; label: string | null; value: string; icon: string; tone: RankedFactTone; }`
  - `export interface RankedItemCardModel { primary: RankedItemFact[]; secondary: RankedItemFact[]; meta: RankedItemFact[]; bonuses: RankedItemFact[]; protections: RankedItemFact[]; }`
  - `export function buildRankedItemCardModel(item: TibiaItem): RankedItemCardModel`

- [ ] **Step 1: Write failing ranking tests**

Create `apps/edron-library/src/app/items/components/item-card/item-card-rank.spec.ts` with representative item builders and these expectations:

```ts
import { buildRankedItemCardModel } from './item-card-rank';
import { TibiaItem } from '../../models';

const baseItem = {
  id: 'sample',
  name: 'Sample Item',
  level: 400,
  vocations: ['Knight'],
  weight: 12,
  marketable: true,
  imbuementSlots: 2,
  classification: 4,
  maxTier: null,
  bonuses: {},
  protections: {},
  specialEffects: [],
  dropsFrom: { creatures: [], bosses: [] },
  sources: { wikiUrl: null, imageUrl: null },
  assets: { imagePath: null },
  metadata: { sourceConfidence: 'high', lastUpdated: '2026-07-08' }
} satisfies Omit<TibiaItem, 'kind'>;

describe('buildRankedItemCardModel', () => {
  it('prioritizes armor before metadata for helmets', () => {
    const item = {
      ...baseItem,
      kind: 'armor',
      armor: { slot: 'Helmet', arm: 11, def: null, twoHanded: false }
    } satisfies TibiaItem;

    const model = buildRankedItemCardModel(item);

    expect(model.primary[0]).toEqual(
      expect.objectContaining({ key: 'armor', labelKey: 'itemCard.armor', value: '11', icon: 'security' })
    );
    expect(model.secondary).toEqual([
      expect.objectContaining({ key: 'slot', value: 'Helmet', icon: 'checkroom' })
    ]);
    expect(model.meta.map((fact) => fact.key)).toEqual(['level', 'weight', 'imbuementSlots', 'classification']);
  });

  it('prioritizes weapon attack, defense, and range when present', () => {
    const item = {
      ...baseItem,
      kind: 'weapon',
      weapon: {
        group: 'Bow',
        hands: 'TwoHanded',
        attack: 7,
        defense: 2,
        defenseModifier: null,
        range: 6,
        hitPercent: null,
        damageType: 'Physical',
        consumesAmmo: true
      }
    } satisfies TibiaItem;

    const model = buildRankedItemCardModel(item);

    expect(model.primary.map((fact) => fact.key)).toEqual(['attack', 'defense', 'range']);
    expect(model.secondary.map((fact) => fact.key)).toEqual(['weaponGroup', 'hands', 'damageType']);
  });

  it('prioritizes quiver volume and ammo types', () => {
    const item = {
      ...baseItem,
      kind: 'quiver',
      quiver: { volume: 25, acceptedAmmoTypes: ['Arrow', 'Bolt'] }
    } satisfies TibiaItem;

    const model = buildRankedItemCardModel(item);

    expect(model.primary).toEqual([
      expect.objectContaining({ key: 'slots', value: '25', icon: 'inventory_2' }),
      expect.objectContaining({ key: 'ammoTypes', value: 'Arrow/Bolt', icon: 'adjust' })
    ]);
  });

  it('prioritizes extra-slot subtype and attack', () => {
    const item = {
      ...baseItem,
      kind: 'extra-slot',
      extraSlot: { subtype: 'Ring', attack: 3 }
    } satisfies TibiaItem;

    const model = buildRankedItemCardModel(item);

    expect(model.primary.map((fact) => fact.key)).toEqual(['subtype', 'attack']);
  });

  it('sorts bonuses and protections by value descending then alphabetically', () => {
    const item = {
      ...baseItem,
      kind: 'armor',
      armor: { slot: 'Armor', arm: 12, def: null, twoHanded: false },
      bonuses: { Sword: 1, Axe: 3, Club: 3 },
      protections: { Fire: 5, Earth: 7, Ice: 7 }
    } satisfies TibiaItem;

    const model = buildRankedItemCardModel(item);

    expect(model.bonuses.map((fact) => fact.key)).toEqual(['Axe', 'Club', 'Sword']);
    expect(model.protections.map((fact) => fact.key)).toEqual(['Earth', 'Ice', 'Fire']);
  });

  it('omits missing optional values from ranked facts', () => {
    const item = {
      ...baseItem,
      kind: 'armor',
      classification: null,
      maxTier: null,
      armor: { slot: 'Shield', arm: null, def: null, twoHanded: false }
    } satisfies TibiaItem;

    const model = buildRankedItemCardModel(item);

    expect(model.primary).toEqual([
      expect.objectContaining({ key: 'slot', value: 'Shield' })
    ]);
    expect(model.meta.map((fact) => fact.key)).toEqual(['level', 'weight', 'imbuementSlots']);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
cd apps/edron-library
npm test -- --watch=false --browsers=ChromeHeadless --include src/app/items/components/item-card/item-card-rank.spec.ts
```

Expected: fail because `./item-card-rank` does not exist.

- [ ] **Step 3: Implement the ranking helper**

Create `apps/edron-library/src/app/items/components/item-card/item-card-rank.ts` with:

```ts
import { TibiaItem } from '../../models';

export type RankedFactTone = 'primary' | 'secondary' | 'meta' | 'bonus' | 'protection';

export interface RankedItemFact {
  key: string;
  labelKey: string | null;
  label: string | null;
  value: string;
  icon: string;
  tone: RankedFactTone;
}

export interface RankedItemCardModel {
  primary: RankedItemFact[];
  secondary: RankedItemFact[];
  meta: RankedItemFact[];
  bonuses: RankedItemFact[];
  protections: RankedItemFact[];
}

export function buildRankedItemCardModel(item: TibiaItem): RankedItemCardModel {
  const primary: RankedItemFact[] = [];
  const secondary: RankedItemFact[] = [];

  if (item.kind === 'armor') {
    pushNumber(primary, 'armor', 'itemCard.armor', item.armor.arm, 'security', 'primary');
    pushNumber(primary, 'defense', 'itemCard.defense', item.armor.def, 'shield', 'primary');
    if (primary.length === 0) {
      primary.push(rawFact('slot', null, item.armor.slot, 'checkroom', 'primary'));
    } else {
      secondary.push(rawFact('slot', null, item.armor.slot, 'checkroom', 'secondary'));
    }
  }

  if (item.kind === 'weapon') {
    pushNumber(primary, 'attack', 'itemCard.attack', item.weapon.attack, 'swords', 'primary');
    pushNumber(primary, 'defense', 'itemCard.defense', item.weapon.defense, 'shield', 'primary');
    pushNumber(primary, 'range', 'itemCard.range', item.weapon.range, 'track_changes', 'primary');
    secondary.push(rawFact('weaponGroup', null, item.weapon.group, 'category', 'secondary'));
    secondary.push(rawFact('hands', null, item.weapon.hands, 'pan_tool_alt', 'secondary'));
    secondary.push(rawFact('damageType', null, item.weapon.damageType, 'bolt', 'secondary'));
    if (item.weapon.requiredAmmoType) {
      secondary.push(rawFact('requiredAmmoType', null, item.weapon.requiredAmmoType, 'adjust', 'secondary'));
    }
  }

  if (item.kind === 'quiver') {
    primary.push(numberFact('slots', 'itemCard.slots', item.quiver.volume, 'inventory_2', 'primary'));
    if (item.quiver.acceptedAmmoTypes.length > 0) {
      primary.push(rawFact('ammoTypes', null, item.quiver.acceptedAmmoTypes.join('/'), 'adjust', 'primary'));
    }
  }

  if (item.kind === 'extra-slot') {
    primary.push(rawFact('subtype', null, item.extraSlot.subtype, 'radio_button_checked', 'primary'));
    pushNumber(primary, 'attack', 'itemCard.attack', item.extraSlot.attack ?? null, 'swords', 'primary');
  }

  return {
    primary,
    secondary,
    meta: buildMetaFacts(item),
    bonuses: buildBonusFacts(item),
    protections: buildProtectionFacts(item)
  };
}

function buildMetaFacts(item: TibiaItem): RankedItemFact[] {
  const facts: RankedItemFact[] = [
    rawFact('level', 'itemCard.level', item.level === null ? 'itemCard.unrestricted' : String(item.level), 'military_tech', 'meta'),
    rawFact('weight', 'itemCard.weight', `${item.weight} oz`, 'scale', 'meta'),
    numberFact('imbuementSlots', 'itemCard.imbuementSlots', item.imbuementSlots, 'auto_fix_high', 'meta')
  ];

  pushNumber(facts, 'classification', 'itemCard.classification', item.classification, 'workspace_premium', 'meta');
  pushNumber(facts, 'maxTier', 'itemCard.maxTier', item.maxTier, 'upgrade', 'meta');

  return facts;
}

function buildBonusFacts(item: TibiaItem): RankedItemFact[] {
  return sortedEntries(item.bonuses).map(([key, value]) =>
    rawFact(key, null, `+${value} ${key}`, bonusIcon(key), 'bonus')
  );
}

function buildProtectionFacts(item: TibiaItem): RankedItemFact[] {
  return sortedEntries(item.protections).map(([key, value]) =>
    rawFact(key, null, `${key} ${value}%`, 'health_and_safety', 'protection')
  );
}

function sortedEntries(record: Partial<Record<string, number>>): Array<[string, number]> {
  return Object.entries(record)
    .filter((entry): entry is [string, number] => entry[1] !== undefined)
    .sort(([leftKey, leftValue], [rightKey, rightValue]) => rightValue - leftValue || leftKey.localeCompare(rightKey));
}

function pushNumber(
  facts: RankedItemFact[],
  key: string,
  labelKey: string,
  value: number | null,
  icon: string,
  tone: RankedFactTone
): void {
  if (value !== null) {
    facts.push(numberFact(key, labelKey, value, icon, tone));
  }
}

function numberFact(key: string, labelKey: string, value: number, icon: string, tone: RankedFactTone): RankedItemFact {
  return rawFact(key, labelKey, String(value), icon, tone);
}

function rawFact(
  key: string,
  labelKey: string | null,
  value: string,
  icon: string,
  tone: RankedFactTone
): RankedItemFact {
  return { key, labelKey, label: labelKey === null ? key : null, value, icon, tone };
}

function bonusIcon(key: string): string {
  const icons: Record<string, string> = {
    Sword: 'swords',
    Axe: 'hardware',
    Club: 'sports_martial_arts',
    Distance: 'my_location',
    Shielding: 'shield',
    MagicLevel: 'auto_awesome',
    Fist: 'front_hand'
  };

  return icons[key] ?? 'add_circle';
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run:

```bash
cd apps/edron-library
npm test -- --watch=false --browsers=ChromeHeadless --include src/app/items/components/item-card/item-card-rank.spec.ts
```

Expected: pass for all `buildRankedItemCardModel` tests.

- [ ] **Step 5: Commit Task 1**

```bash
git add apps/edron-library/src/app/items/components/item-card/item-card-rank.ts apps/edron-library/src/app/items/components/item-card/item-card-rank.spec.ts
git commit -m "feat: rank item card facts by type"
```

---

### Task 2: Render Ranked Facts In The Item Card

**Files:**
- Modify: `apps/edron-library/src/app/items/components/item-card/item-card.component.ts`
- Modify: `apps/edron-library/src/app/items/components/item-card/item-card.component.html`

**Interfaces:**
- Consumes: `buildRankedItemCardModel(item: TibiaItem): RankedItemCardModel`
- Produces:
  - `cardModel(item: TibiaItem): ItemCardDisplayModel`
  - `displayLabel(fact: DisplayItemFact): string`

- [ ] **Step 1: Add a component integration test**

Create `apps/edron-library/src/app/items/components/item-card/item-card.component.spec.ts` with:

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTransloco, TranslocoTestingModule } from '@jsverse/transloco';
import { ItemCardComponent } from './item-card.component';
import { TibiaItem } from '../../models';

const translations = {
  itemCard: {
    level: 'Level',
    unrestricted: 'Unrestricted',
    weight: 'Weight',
    imbuementSlots: 'Imbuement slots',
    classification: 'Classification',
    maxTier: 'Max tier',
    armor: 'Armor',
    defense: 'Defense',
    attack: 'Attack',
    range: 'Range',
    slots: 'Slots',
    vocations: 'Vocations',
    bonuses: 'Bonuses',
    protections: 'Protections'
  }
};

describe('ItemCardComponent', () => {
  let fixture: ComponentFixture<ItemCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ItemCardComponent,
        TranslocoTestingModule.forRoot({
          langs: { en: translations },
          translocoConfig: { availableLangs: ['en'], defaultLang: 'en' }
        })
      ],
      providers: [provideTransloco({ config: { availableLangs: ['en'], defaultLang: 'en' } })]
    }).compileComponents();

    fixture = TestBed.createComponent(ItemCardComponent);
  });

  it('renders armor as a primary stat tile before meta chips', () => {
    fixture.componentRef.setInput('item', {
      id: 'alicorn-headguard',
      name: 'Alicorn Headguard',
      kind: 'armor',
      level: 400,
      vocations: ['Paladin'],
      weight: 39,
      marketable: true,
      imbuementSlots: 2,
      classification: 4,
      maxTier: null,
      bonuses: { Distance: 3 },
      protections: { Physical: 5 },
      specialEffects: [],
      dropsFrom: { creatures: [], bosses: [] },
      sources: { wikiUrl: null, imageUrl: null },
      assets: { imagePath: null },
      metadata: { sourceConfidence: 'high', lastUpdated: '2026-07-08' },
      armor: { slot: 'Helmet', arm: 11, def: null, twoHanded: false }
    } satisfies TibiaItem);

    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('.primary-stat')?.textContent).toContain('Armor');
    expect(element.querySelector('.primary-stat')?.textContent).toContain('11');
    expect([...element.querySelectorAll('.meta-chip')].map((chip) => chip.textContent?.trim())).toContain('Level 400');
    expect(element.querySelector('.bonus-chip')?.textContent).toContain('+3 Distance');
    expect(element.querySelector('.protection-chip')?.textContent).toContain('Physical 5%');
  });
});
```

- [ ] **Step 2: Run component test to verify it fails**

Run:

```bash
cd apps/edron-library
npm test -- --watch=false --browsers=ChromeHeadless --include src/app/items/components/item-card/item-card.component.spec.ts
```

Expected: fail because the template does not render `.primary-stat` or `.meta-chip`.

- [ ] **Step 3: Update the component TypeScript**

Modify `apps/edron-library/src/app/items/components/item-card/item-card.component.ts` to import the helper and expose display facts:

```ts
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { TibiaItem } from '../../models';
import { buildRankedItemCardModel, RankedItemCardModel, RankedItemFact } from './item-card-rank';

interface DisplayItemFact extends RankedItemFact {
  displayLabel: string;
  displayValue: string;
}

interface ItemCardDisplayModel {
  primary: DisplayItemFact[];
  secondary: DisplayItemFact[];
  meta: DisplayItemFact[];
  bonuses: DisplayItemFact[];
  protections: DisplayItemFact[];
}

@Component({
  selector: 'app-item-card',
  standalone: true,
  imports: [MatIconModule, TranslocoPipe],
  templateUrl: './item-card.component.html',
  styleUrl: './item-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemCardComponent {
  readonly item = input.required<TibiaItem>();
  private readonly transloco = inject(TranslocoService);
  private readonly activeLang = this.transloco.activeLang;

  cardModel(item: TibiaItem): ItemCardDisplayModel {
    return this.toDisplayModel(buildRankedItemCardModel(item));
  }

  vocationText(item: TibiaItem): string {
    const lang = this.activeLang();
    return item.vocations.includes('None')
      ? this.translate('itemCard.unrestricted', lang)
      : item.vocations.join(', ');
  }

  private toDisplayModel(model: RankedItemCardModel): ItemCardDisplayModel {
    return {
      primary: model.primary.map((fact) => this.toDisplayFact(fact)),
      secondary: model.secondary.map((fact) => this.toDisplayFact(fact)),
      meta: model.meta.map((fact) => this.toDisplayFact(fact)),
      bonuses: model.bonuses.map((fact) => this.toDisplayFact(fact)),
      protections: model.protections.map((fact) => this.toDisplayFact(fact))
    };
  }

  private toDisplayFact(fact: RankedItemFact): DisplayItemFact {
    const lang = this.activeLang();
    const displayLabel = fact.labelKey === null ? fact.label ?? fact.key : this.translate(fact.labelKey, lang);
    const displayValue = fact.value.startsWith('itemCard.') ? this.translate(fact.value, lang) : fact.value;

    return { ...fact, displayLabel, displayValue };
  }

  private translate(key: string, lang: string): string {
    return this.transloco.translate(key, {}, lang);
  }
}
```

- [ ] **Step 4: Update the component template**

Modify `apps/edron-library/src/app/items/components/item-card/item-card.component.html` to render ranked groups:

```html
@let currentItem = item();
@let model = cardModel(currentItem);

<article class="item-card">
  <div class="flex gap-4">
    <div class="item-art" aria-hidden="true">
      @if (currentItem.assets.imagePath) {
        <img [src]="currentItem.assets.imagePath" [alt]="currentItem.name" class="h-12 w-12 object-contain" />
      } @else {
        <mat-icon class="!h-10 !w-10 !text-4xl !text-violet-300">auto_awesome</mat-icon>
      }
    </div>

    <div class="min-w-0 flex-1">
      <div class="flex items-start justify-between gap-3">
        <h3 class="truncate text-base font-semibold text-zinc-50">{{ currentItem.name }}</h3>
        <span class="rounded bg-zinc-800 px-2 py-1 text-[0.68rem] uppercase text-zinc-400">
          {{ currentItem.kind }}
        </span>
      </div>
      <p class="mt-1 line-clamp-1 text-xs text-zinc-400">
        {{ 'itemCard.vocations' | transloco }}: {{ vocationText(currentItem) }}
      </p>
    </div>
  </div>

  <div class="primary-stat-grid mt-4">
    @for (fact of model.primary; track fact.key) {
      <div class="primary-stat">
        <mat-icon aria-hidden="true">{{ fact.icon }}</mat-icon>
        <span class="primary-stat__label">{{ fact.displayLabel }}</span>
        <strong class="primary-stat__value">{{ fact.displayValue }}</strong>
      </div>
    }
  </div>

  @if (model.secondary.length > 0) {
    <div class="mt-3 flex flex-wrap gap-1.5">
      @for (fact of model.secondary; track fact.key) {
        <span class="fact-chip secondary-chip">
          <mat-icon aria-hidden="true">{{ fact.icon }}</mat-icon>
          {{ fact.displayLabel === fact.key ? fact.displayValue : fact.displayLabel + ' ' + fact.displayValue }}
        </span>
      }
    </div>
  }

  <div class="mt-3 flex flex-wrap gap-1.5">
    @for (fact of model.meta; track fact.key) {
      <span class="fact-chip meta-chip">
        <mat-icon aria-hidden="true">{{ fact.icon }}</mat-icon>
        {{ fact.displayLabel }} {{ fact.displayValue }}
      </span>
    }
  </div>

  @if (model.bonuses.length > 0) {
    <div class="mt-3">
      <div class="mb-1 text-[0.68rem] uppercase tracking-wide text-zinc-500">{{ 'itemCard.bonuses' | transloco }}</div>
      <div class="flex flex-wrap gap-1.5">
        @for (fact of model.bonuses; track fact.key) {
          <span class="fact-chip bonus-chip">
            <mat-icon aria-hidden="true">{{ fact.icon }}</mat-icon>
            {{ fact.displayValue }}
          </span>
        }
      </div>
    </div>
  }

  @if (model.protections.length > 0) {
    <div class="mt-3">
      <div class="mb-1 text-[0.68rem] uppercase tracking-wide text-zinc-500">{{ 'itemCard.protections' | transloco }}</div>
      <div class="flex flex-wrap gap-1.5">
        @for (fact of model.protections; track fact.key) {
          <span class="fact-chip protection-chip">
            <mat-icon aria-hidden="true">{{ fact.icon }}</mat-icon>
            {{ fact.displayValue }}
          </span>
        }
      </div>
    </div>
  }
</article>
```

- [ ] **Step 5: Run component test to verify it passes**

Run:

```bash
cd apps/edron-library
npm test -- --watch=false --browsers=ChromeHeadless --include src/app/items/components/item-card/item-card.component.spec.ts
```

Expected: pass.

- [ ] **Step 6: Commit Task 2**

```bash
git add apps/edron-library/src/app/items/components/item-card/item-card.component.ts apps/edron-library/src/app/items/components/item-card/item-card.component.html apps/edron-library/src/app/items/components/item-card/item-card.component.spec.ts
git commit -m "feat: render ranked item card facts"
```

---

### Task 3: Ranked Card Styling And Verification

**Files:**
- Modify: `apps/edron-library/src/app/items/components/item-card/item-card.component.scss`

**Interfaces:**
- Consumes template classes: `.primary-stat-grid`, `.primary-stat`, `.primary-stat__label`, `.primary-stat__value`, `.fact-chip`, `.secondary-chip`, `.meta-chip`, `.bonus-chip`, `.protection-chip`
- Produces compact dark card styling with clear priority tiers.

- [ ] **Step 1: Update SCSS**

Modify `apps/edron-library/src/app/items/components/item-card/item-card.component.scss`:

```scss
:host {
  display: block;
}

.item-card {
  background: rgb(24 24 27 / 0.9);
  border: 1px solid rgb(39 39 42);
  border-radius: 0.75rem;
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.25);
  min-height: 14.5rem;
  padding: 1rem;
  transition: background-color 140ms ease, border-color 140ms ease;
}

.item-card:hover {
  background: rgb(24 24 27);
  border-color: rgb(168 85 247 / 0.6);
}

.item-art {
  align-items: center;
  background: rgb(9 9 11);
  border: 1px solid rgb(39 39 42);
  border-radius: 0.625rem;
  display: flex;
  height: 4rem;
  justify-content: center;
  width: 4rem;
}

.primary-stat-grid {
  display: grid;
  gap: 0.5rem;
  grid-template-columns: repeat(auto-fit, minmax(6.5rem, 1fr));
}

.primary-stat {
  align-items: center;
  background: linear-gradient(180deg, rgb(39 39 42 / 0.9), rgb(24 24 27 / 0.95));
  border: 1px solid rgb(168 85 247 / 0.45);
  border-left: 3px solid rgb(45 212 191);
  border-radius: 0.5rem;
  color: rgb(244 244 245);
  display: grid;
  gap: 0.125rem 0.45rem;
  grid-template-columns: 1.15rem minmax(0, 1fr);
  min-width: 0;
  padding: 0.5rem 0.55rem;
}

.primary-stat mat-icon {
  color: rgb(45 212 191);
  font-size: 1.05rem;
  height: 1.05rem;
  width: 1.05rem;
}

.primary-stat__label,
.primary-stat__value {
  min-width: 0;
  overflow-wrap: anywhere;
}

.primary-stat__label {
  color: rgb(161 161 170);
  font-size: 0.66rem;
  line-height: 0.8rem;
  text-transform: uppercase;
}

.primary-stat__value {
  color: rgb(250 250 250);
  font-size: 1rem;
  line-height: 1.2rem;
}

.fact-chip {
  align-items: center;
  border-radius: 0.375rem;
  display: inline-flex;
  font-size: 0.75rem;
  gap: 0.25rem;
  line-height: 1rem;
  min-width: 0;
  padding: 0.25rem 0.5rem;
}

.fact-chip mat-icon {
  flex: 0 0 auto;
  font-size: 0.875rem;
  height: 0.875rem;
  width: 0.875rem;
}

.secondary-chip {
  background: rgb(39 39 42);
  color: rgb(228 228 231);
}

.meta-chip {
  background: rgb(39 39 42 / 0.72);
  color: rgb(161 161 170);
}

.bonus-chip {
  background: rgb(6 78 59 / 0.35);
  color: rgb(110 231 183);
}

.protection-chip {
  background: rgb(88 28 135 / 0.35);
  color: rgb(216 180 254);
}
```

- [ ] **Step 2: Run targeted tests**

Run:

```bash
cd apps/edron-library
npm test -- --watch=false --browsers=ChromeHeadless --include src/app/items/components/item-card/item-card-rank.spec.ts --include src/app/items/components/item-card/item-card.component.spec.ts
```

Expected: pass.

- [ ] **Step 3: Run production build**

Run:

```bash
cd apps/edron-library
npm run build
```

Expected: production build succeeds with no TypeScript, template, style budget, or SCSS errors.

- [ ] **Step 4: Visual check**

Run:

```bash
cd apps/edron-library
npm start -- --host 127.0.0.1 --port 4200
```

Open `http://127.0.0.1:4200` and verify:

- Armor cards show `Armor` as a primary tile when present.
- Weapon cards show `Attack`, `Defense`, and `Range` primary tiles according to available fields.
- Quiver and extra-slot cards show meaningful primary tiles.
- Bonus and protection chips include icons and sorted values.
- No text overlaps at desktop or mobile widths.

- [ ] **Step 5: Commit Task 3**

```bash
git add apps/edron-library/src/app/items/components/item-card/item-card.component.scss
git commit -m "style: add hierarchy to item cards"
```

---

## Self-Review

- Spec coverage: Task 1 implements ranking rules, icons, omission of missing optional values, and bonus/protection sorting. Task 2 implements rendering tiers and empty-section behavior. Task 3 implements compact visual hierarchy and build/visual verification.
- Placeholder scan: no TBD/TODO/implement-later placeholders remain.
- Type consistency: `RankedItemFact`, `RankedItemCardModel`, `buildRankedItemCardModel`, `DisplayItemFact`, and `ItemCardDisplayModel` names match between tasks.
