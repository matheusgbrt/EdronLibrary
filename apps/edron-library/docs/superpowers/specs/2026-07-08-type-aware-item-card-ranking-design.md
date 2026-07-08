# Type-Aware Item Card Ranking Design

## Context

Item cards currently render most facts as equal-weight text chips. This makes dense cards readable, but it does not communicate which attributes matter most for a given item type. A helmet with high armor, a weapon with high attack, and a quiver with many slots all look visually similar to low-priority metadata such as weight or classification.

The card component already has enough structured item data to rank information without changing the dataset. The design should preserve the compact grid while adding clearer priority, icons, and stronger scannability.

## Goals

- Make the most important stats obvious within each card.
- Rank information by item kind instead of rendering a flat stat list.
- Add icons to primary and secondary facts without making the cards feel decorative.
- Keep the existing dense grid and dark operational UI style.
- Keep ranking rules in TypeScript so they are testable and easy to extend.

## Non-Goals

- Do not add item scoring or recommendation logic.
- Do not redesign the full item browser layout.
- Do not change filtering, sorting, pagination, or the captured item dataset.
- Do not introduce a new icon library; use Angular Material icons already available to the component.

## Recommended Approach

Replace the flat `statRows()` output with a card view-model that groups facts into three priority tiers:

- `primary`: one to three hero facts that explain why the item matters.
- `secondary`: item-specific useful traits that should remain visible but less dominant.
- `meta`: baseline facts such as level, weight, classification, imbuement slots, and max tier.

The template renders these groups consistently:

- Primary facts render as compact stat tiles with an icon, label, value, and stronger border/background.
- Secondary facts render as icon chips with moderate emphasis.
- Meta facts render as quiet compact chips.
- Bonuses and protections render as icon chips, sorted by value descending.

## Type-Aware Ranking Rules

### Armor Items

Primary:

- `Armor` when `armor.arm` is present.
- `Armor` using `armor.def` as a fallback for shields and spellbooks.
- `Slot` when no armor value or defensive fallback exists.

Secondary:

- Armor slot.
- Highest bonuses.
- Highest protections.

Meta:

- Level.
- Weight.
- Imbuement slots.
- Classification.
- Max tier.

For helmets, armor is the first primary fact and should receive the strongest visual highlight.

### Weapon Items

Primary:

- `Attack` when present.
- Elemental damage when present.
- `Armor` from `weapon.defense` when present.
- `Hit` when hit percent is present.
- `Range` when present and especially relevant for bows, crossbows, throwing weapons, and ammunition.

Secondary:

- Weapon group.
- Hands.
- Damage type.
- Required ammo type when present.

Meta:

- Level.
- Weight.
- Imbuement slots.
- Classification.
- Max tier.

### Quiver Items

Primary:

- `Slots` from `quiver.volume`.
- Accepted ammo types when present.

Secondary:

- Highest bonuses.
- Highest protections.

Meta:

- Level.
- Weight.
- Classification.
- Max tier.

### Extra-Slot Items

Primary:

- Highest bonuses when present.
- Highest protections when present and room remains in the primary grid.
- `Attack` when present.

Secondary:

- Extra-slot subtype.
- Remaining bonuses.
- Remaining protections.
- Special effects when present and representable in a compact chip.

Meta:

- Level.
- Weight.
- Classification.
- Max tier.

## Visual Design

The card keeps the current structure: item art, name, kind badge, vocation summary, stat content, bonuses, and protections. The stat content gains hierarchy:

- Primary stat tiles sit directly below the header.
- Tiles use stronger text contrast, a subtle colored left edge or border, and a Material icon.
- Secondary chips sit below primary tiles and use smaller icon+text treatment.
- Meta chips sit last and use muted zinc styling.
- Bonus chips use green/teal emphasis.
- Protection chips use violet emphasis, but each includes a shield-style icon.

The UI should avoid card-within-card nesting. Tiles and chips are lightweight elements inside the card, not separate panels.

## Data Flow

`ItemCardComponent` should expose a method or computed helper that returns a card view-model:

```ts
interface RankedItemFact {
  label: string;
  value: string;
  icon: string;
  tone: 'primary' | 'secondary' | 'meta' | 'bonus' | 'protection';
}

interface ItemCardViewModel {
  primary: RankedItemFact[];
  secondary: RankedItemFact[];
  meta: RankedItemFact[];
  bonuses: RankedItemFact[];
  protections: RankedItemFact[];
}
```

Labels are plain English display strings because the app is English-only. Values may come directly from structured item fields. Sorting for bonuses, protections, and elemental damage should be descending by numeric value, with a stable alphabetical fallback for equal values.

## Error Handling And Edge Cases

- Missing optional numeric values should be omitted, not rendered as empty chips.
- If an item lacks primary stats for its kind, fall back to the strongest available identifying trait.
- Unknown bonus or protection keys should still render as text.
- Long values should wrap or truncate without changing card width.
- Cards with no bonuses or protections should not show empty section headers.

## Testing And Verification

- Add focused unit coverage for the ranking helper or component methods.
- Verify representative armor, weapon, quiver, and extra-slot items.
- Verify missing optional values do not create empty UI.
- Run the Angular build.
- Visually check the item grid at desktop and mobile widths to confirm text does not overlap and primary facts are readable.

## Acceptance Criteria

- Helmet cards emphasize armor above level, weight, classification, and imbuement slots.
- Shields and weapon defensive values display as `Armor`, not as a user-facing `Defense` fact.
- Weapon cards emphasize attack, elemental damage, armor, hit percent, and range according to available values.
- Quiver and extra-slot cards have meaningful primary facts instead of generic flat chips.
- Icons appear on ranked facts, bonuses, and protections.
- The card grid remains compact and visually consistent with the existing dark interface.
