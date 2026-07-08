import { Injectable } from '@angular/core';

import { Element, SkillBonus, TibiaItem } from '../models';

export type BaseItemSortKey =
  | 'name'
  | 'level'
  | 'weight'
  | 'imbuementSlots'
  | 'classification'
  | 'maxTier'
  | 'armor'
  | 'attack'
  | 'damageRange'
  | 'range'
  | 'hitPercent';

export type ElementDamageSortKey = `elementDamage.${Element}`;
export type SkillBonusSortKey = `bonus.${SkillBonus}`;
export type ProtectionSortKey = `protection.${Element}`;
export type ItemSortKey =
  | BaseItemSortKey
  | ElementDamageSortKey
  | SkillBonusSortKey
  | ProtectionSortKey;

export interface ItemSort {
  key: ItemSortKey;
  direction: 'asc' | 'desc';
}

export interface ItemSortOption {
  group: 'General' | 'Combat' | 'Elemental damage' | 'Skill bonuses' | 'Protections';
  label: string;
  key: ItemSortKey;
  defaultDirection: ItemSort['direction'];
}

export const DEFAULT_ITEM_SORTS: ItemSort[] = [{ key: 'name', direction: 'asc' }];

export const ITEM_SORT_OPTIONS: ItemSortOption[] = [
  { group: 'General', label: 'Name', key: 'name', defaultDirection: 'asc' },
  { group: 'General', label: 'Level', key: 'level', defaultDirection: 'desc' },
  { group: 'General', label: 'Weight', key: 'weight', defaultDirection: 'asc' },
  { group: 'General', label: 'Imbuement slots', key: 'imbuementSlots', defaultDirection: 'desc' },
  { group: 'General', label: 'Classification', key: 'classification', defaultDirection: 'desc' },
  { group: 'General', label: 'Max tier', key: 'maxTier', defaultDirection: 'desc' },
  { group: 'Combat', label: 'Attack', key: 'attack', defaultDirection: 'desc' },
  { group: 'Combat', label: 'Armor', key: 'armor', defaultDirection: 'desc' },
  { group: 'Combat', label: 'Damage range', key: 'damageRange', defaultDirection: 'desc' },
  { group: 'Combat', label: 'Attack range', key: 'range', defaultDirection: 'desc' },
  { group: 'Combat', label: 'Hit %', key: 'hitPercent', defaultDirection: 'desc' },
  { group: 'Elemental damage', label: 'Fire damage', key: 'elementDamage.Fire', defaultDirection: 'desc' },
  { group: 'Elemental damage', label: 'Earth damage', key: 'elementDamage.Earth', defaultDirection: 'desc' },
  { group: 'Elemental damage', label: 'Energy damage', key: 'elementDamage.Energy', defaultDirection: 'desc' },
  { group: 'Elemental damage', label: 'Ice damage', key: 'elementDamage.Ice', defaultDirection: 'desc' },
  { group: 'Elemental damage', label: 'Holy damage', key: 'elementDamage.Holy', defaultDirection: 'desc' },
  { group: 'Elemental damage', label: 'Death damage', key: 'elementDamage.Death', defaultDirection: 'desc' },
  { group: 'Skill bonuses', label: 'Sword', key: 'bonus.Sword', defaultDirection: 'desc' },
  { group: 'Skill bonuses', label: 'Axe', key: 'bonus.Axe', defaultDirection: 'desc' },
  { group: 'Skill bonuses', label: 'Club', key: 'bonus.Club', defaultDirection: 'desc' },
  { group: 'Skill bonuses', label: 'Distance', key: 'bonus.Distance', defaultDirection: 'desc' },
  { group: 'Skill bonuses', label: 'Shielding', key: 'bonus.Shielding', defaultDirection: 'desc' },
  { group: 'Skill bonuses', label: 'Magic level', key: 'bonus.MagicLevel', defaultDirection: 'desc' },
  { group: 'Skill bonuses', label: 'Fist', key: 'bonus.Fist', defaultDirection: 'desc' },
  { group: 'Protections', label: 'Physical protection', key: 'protection.Physical', defaultDirection: 'desc' },
  { group: 'Protections', label: 'Fire protection', key: 'protection.Fire', defaultDirection: 'desc' },
  { group: 'Protections', label: 'Earth protection', key: 'protection.Earth', defaultDirection: 'desc' },
  { group: 'Protections', label: 'Energy protection', key: 'protection.Energy', defaultDirection: 'desc' },
  { group: 'Protections', label: 'Ice protection', key: 'protection.Ice', defaultDirection: 'desc' },
  { group: 'Protections', label: 'Holy protection', key: 'protection.Holy', defaultDirection: 'desc' },
  { group: 'Protections', label: 'Death protection', key: 'protection.Death', defaultDirection: 'desc' }
];

@Injectable({ providedIn: 'root' })
export class ItemSortService {
  sortItems(items: TibiaItem[], sort: ItemSort | ItemSort[]): TibiaItem[] {
    const sorts = Array.isArray(sort) ? sort : [sort];
    return [...items].sort((left, right) => this.compareItems(left, right, sorts));
  }

  private compareItems(left: TibiaItem, right: TibiaItem, sorts: ItemSort[]): number {
    for (const sort of sorts) {
      const compared = this.compareBySort(left, right, sort);

      if (compared !== 0) {
        return compared;
      }
    }

    return left.name.localeCompare(right.name);
  }

  private compareBySort(left: TibiaItem, right: TibiaItem, sort: ItemSort): number {
    const direction = sort.direction === 'asc' ? 1 : -1;

    if (sort.key === 'name') {
      return left.name.localeCompare(right.name) * direction;
    }

    const leftValue = this.numericValue(left, sort.key);
    const rightValue = this.numericValue(right, sort.key);

    if (leftValue === null && rightValue === null) {
      return left.name.localeCompare(right.name);
    }

    if (leftValue === null) {
      return 1;
    }

    if (rightValue === null) {
      return -1;
    }

    const compared = leftValue - rightValue;
    return compared * direction;
  }

  private numericValue(item: TibiaItem, key: ItemSortKey): number | null {
    if (this.isElementDamageKey(key)) {
      const element = key.replace('elementDamage.', '') as Element;
      return item.kind === 'weapon' ? item.weapon.elementDamage?.[element] ?? null : null;
    }

    if (this.isSkillBonusKey(key)) {
      const skill = key.replace('bonus.', '') as SkillBonus;
      return item.bonuses[skill] ?? null;
    }

    if (this.isProtectionKey(key)) {
      const element = key.replace('protection.', '') as Element;
      return item.protections[element] ?? null;
    }

    switch (key) {
      case 'level':
        return item.level;
      case 'weight':
        return item.weight;
      case 'imbuementSlots':
        return item.imbuementSlots;
      case 'classification':
        return item.classification;
      case 'maxTier':
        return item.maxTier;
      case 'armor':
        if (item.kind === 'armor') {
          return item.armor.arm !== null && item.armor.arm > 0 ? item.armor.arm : item.armor.def;
        }

        return item.kind === 'weapon' ? item.weapon.defense : null;
      case 'attack':
        return item.kind === 'weapon' ? item.weapon.attack : null;
      case 'damageRange':
        return item.kind === 'weapon' ? item.weapon.damageRange?.average ?? null : null;
      case 'range':
        return item.kind === 'weapon' ? item.weapon.range : null;
      case 'hitPercent':
        return item.kind === 'weapon' ? item.weapon.hitPercent : null;
      case 'name':
        return null;
    }
  }

  private isElementDamageKey(key: ItemSortKey): key is ElementDamageSortKey {
    return key.startsWith('elementDamage.');
  }

  private isSkillBonusKey(key: ItemSortKey): key is SkillBonusSortKey {
    return key.startsWith('bonus.');
  }

  private isProtectionKey(key: ItemSortKey): key is ProtectionSortKey {
    return key.startsWith('protection.');
  }
}
