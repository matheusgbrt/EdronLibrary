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
  let bonuses = buildBonusFacts(item);
  let protections = buildProtectionFacts(item);

  if (item.kind === 'armor') {
    pushNumber(primary, 'armor', 'itemCard.armor', defensiveArmorValue(item.armor.arm, item.armor.def), 'security', 'primary');

    if (primary.length === 0) {
      primary.push(rawFact('slot', null, item.armor.slot, 'checkroom', 'primary'));
    } else {
      secondary.push(rawFact('slot', null, item.armor.slot, 'checkroom', 'secondary'));
    }
  }

  if (item.kind === 'weapon') {
    pushNumber(primary, 'attack', 'itemCard.attack', item.weapon.attack, 'flash_on', 'primary');
    primary.push(...buildElementDamageFacts(item.weapon.elementDamage));
    pushNumber(primary, 'armor', 'itemCard.armor', item.weapon.defense, 'security', 'primary');
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
    const promotedBonuses = buildPrimaryBonusFacts(item).slice(0, 2);
    primary.push(...promotedBonuses);

    const promotedProtections = buildPrimaryProtectionFacts(item).slice(0, Math.max(0, 2 - primary.length));
    primary.push(...promotedProtections);

    bonuses = removePromotedFacts(bonuses, promotedBonuses);
    protections = removePromotedFacts(protections, promotedProtections);

    pushNumber(primary, 'attack', 'itemCard.attack', item.extraSlot.attack ?? null, 'flash_on', 'primary');

    if (primary.length === 0) {
      primary.push(rawFact('subtype', null, item.extraSlot.subtype, 'radio_button_checked', 'primary'));
    } else {
      secondary.push(rawFact('subtype', null, item.extraSlot.subtype, 'radio_button_checked', 'secondary'));
    }
  }

  return {
    primary,
    secondary,
    meta: buildMetaFacts(item),
    bonuses,
    protections
  };
}

function defensiveArmorValue(armor: number | null, defense: number | null): number | null {
  if (armor !== null && armor > 0) {
    return armor;
  }

  return defense;
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
  return sortedEntries(item.bonuses).map(([key, value]) => rawFact(key, null, `+${value} ${key}`, bonusIcon(key), 'bonus'));
}

function buildProtectionFacts(item: TibiaItem): RankedItemFact[] {
  return sortedEntries(item.protections).map(([key, value]) => rawFact(key, null, `${key} ${value}%`, 'health_and_safety', 'protection'));
}

function removePromotedFacts(facts: RankedItemFact[], promotedFacts: RankedItemFact[]): RankedItemFact[] {
  if (promotedFacts.length === 0) {
    return facts;
  }

  const promotedKeys = new Set(promotedFacts.map((fact) => fact.key));
  return facts.filter((fact) => !promotedKeys.has(fact.key));
}

function buildPrimaryBonusFacts(item: TibiaItem): RankedItemFact[] {
  return sortedEntries(item.bonuses).map(([key, value]) => ({
    ...rawFact(key, null, `+${value}`, bonusIcon(key), 'primary'),
    label: key
  }));
}

function buildPrimaryProtectionFacts(item: TibiaItem): RankedItemFact[] {
  return sortedEntries(item.protections).map(([key, value]) => ({
    ...rawFact(key, null, `${value}%`, 'health_and_safety', 'primary'),
    label: key
  }));
}

function buildElementDamageFacts(elementDamage: Partial<Record<string, number>> | undefined): RankedItemFact[] {
  if (!elementDamage) {
    return [];
  }

  return sortedEntries(elementDamage).map(([key, value]) => ({
    ...rawFact(`elementDamage.${key}`, null, String(value), elementIcon(key), 'primary'),
    label: key
  }));
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
    Sword: 'flash_on',
    Axe: 'hardware',
    Club: 'sports_martial_arts',
    Distance: 'my_location',
    Shielding: 'shield',
    MagicLevel: 'auto_awesome',
    Fist: 'front_hand'
  };

  return icons[key] ?? 'add_circle';
}

function elementIcon(key: string): string {
  const icons: Record<string, string> = {
    Physical: 'flash_on',
    Fire: 'local_fire_department',
    Earth: 'terrain',
    Energy: 'electric_bolt',
    Ice: 'ac_unit',
    Holy: 'wb_sunny',
    Death: 'skull',
  };

  return icons[key] ?? 'bolt';
}
