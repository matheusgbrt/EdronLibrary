import { Injectable } from '@angular/core';

import {
  ArmorSlot,
  Element,
  ExtraSlotSubtype,
  ItemKind,
  SkillBonus,
  TibiaItem,
  Vocation,
  WeaponGroup
} from '../models';

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
  elementalDamages: Partial<Record<Element, number>>;
  dropsFrom: string[];
}

export const DEFAULT_ITEM_FILTERS: ItemFilters = {
  query: '',
  kinds: [],
  armorSlots: [],
  weaponGroups: [],
  extraSlotSubtypes: [],
  vocations: [],
  minLevel: null,
  maxLevel: null,
  minWeight: null,
  maxWeight: null,
  minImbuementSlots: null,
  classification: null,
  minMaxTier: null,
  bonuses: {},
  protections: {},
  elementalDamages: {},
  dropsFrom: []
};

@Injectable({ providedIn: 'root' })
export class ItemFilterService {
  applyFilters(items: TibiaItem[], filters: ItemFilters): TibiaItem[] {
    return items.filter((item) => this.matchesItem(item, filters));
  }

  private matchesItem(item: TibiaItem, filters: ItemFilters): boolean {
    return (
      this.matchesQuery(item, filters.query) &&
      this.matchesSelected(filters.kinds, item.kind) &&
      this.matchesCategoryFilters(item, filters) &&
      this.matchesVocations(item, filters.vocations) &&
      this.matchesRange(this.levelValue(item), filters.minLevel, filters.maxLevel) &&
      this.matchesRange(item.weight, filters.minWeight, filters.maxWeight) &&
      this.matchesMinimum(item.imbuementSlots, filters.minImbuementSlots) &&
      this.matchesExact(item.classification, filters.classification) &&
      this.matchesMinimum(item.maxTier, filters.minMaxTier) &&
      this.matchesThresholds(item.bonuses, filters.bonuses) &&
      this.matchesThresholds(item.protections, filters.protections) &&
      this.matchesElementalDamage(item, filters.elementalDamages) &&
      this.matchesDrops(item, filters.dropsFrom)
    );
  }

  private matchesQuery(item: TibiaItem, query: string): boolean {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return true;
    }

    return this.searchTokens(item).some((token) => token.toLowerCase().includes(normalizedQuery));
  }

  private searchTokens(item: TibiaItem): string[] {
    return [
      item.name,
      item.kind,
      ...item.vocations,
      ...item.metadata.tags,
      ...Object.keys(item.bonuses),
      ...Object.keys(item.protections),
      ...this.dropSources(item),
      item.kind === 'armor' ? item.armor.slot : '',
      item.kind === 'weapon' ? item.weapon.group : '',
      item.kind === 'extra-slot' ? item.extraSlot.subtype : '',
      item.kind === 'quiver' ? 'Quiver' : ''
    ].filter(Boolean);
  }

  private matchesCategoryFilters(item: TibiaItem, filters: ItemFilters): boolean {
    if (item.kind === 'armor' && filters.armorSlots.length > 0) {
      return filters.armorSlots.includes(item.armor.slot);
    }

    if (item.kind === 'weapon' && filters.weaponGroups.length > 0) {
      return filters.weaponGroups.includes(item.weapon.group);
    }

    if (item.kind === 'extra-slot' && filters.extraSlotSubtypes.length > 0) {
      return filters.extraSlotSubtypes.includes(item.extraSlot.subtype);
    }

    return (
      filters.armorSlots.length === 0 &&
      filters.weaponGroups.length === 0 &&
      filters.extraSlotSubtypes.length === 0
    );
  }

  private matchesVocations(item: TibiaItem, selectedVocations: Vocation[]): boolean {
    if (selectedVocations.length === 0 || item.vocations.includes('None')) {
      return true;
    }

    return item.vocations.some((vocation) => selectedVocations.includes(vocation));
  }

  private matchesSelected<T>(selected: T[], value: T): boolean {
    return selected.length === 0 || selected.includes(value);
  }

  private matchesRange(value: number, min: number | null, max: number | null): boolean {
    if (min !== null && value < min) {
      return false;
    }

    return max === null || value <= max;
  }

  private matchesMinimum(value: number | null, minimum: number | null): boolean {
    return minimum === null || (value !== null && value >= minimum);
  }

  private matchesExact(value: number | null, expected: number | null): boolean {
    return expected === null || value === expected;
  }

  private matchesThresholds<T extends string>(
    values: Partial<Record<T | string, number>>,
    thresholds: Partial<Record<T, number>>
  ): boolean {
    return (Object.keys(thresholds) as T[]).every((key) => {
      const minimum = thresholds[key];
      if (minimum === null || minimum === undefined) {
        return true;
      }

      return (values[key] ?? 0) >= minimum;
    });
  }

  private matchesElementalDamage(
    item: TibiaItem,
    thresholds: Partial<Record<Element, number>>
  ): boolean {
    if (Object.keys(thresholds).length === 0) {
      return true;
    }

    if (item.kind !== 'weapon') {
      return false;
    }

    return this.matchesThresholds(item.weapon.elementDamage ?? {}, thresholds);
  }

  private matchesDrops(item: TibiaItem, dropsFrom: string[]): boolean {
    if (dropsFrom.length === 0) {
      return true;
    }

    const sources = this.dropSources(item).map((source) => source.toLowerCase());
    return dropsFrom.every((drop) => sources.some((source) => source.includes(drop.toLowerCase())));
  }

  private dropSources(item: TibiaItem): string[] {
    return [
      ...item.dropsFrom.normal,
      ...item.dropsFrom.boss,
      ...item.dropsFrom.invasion,
      ...item.dropsFrom.quest,
      ...item.dropsFrom.other
    ];
  }

  private levelValue(item: TibiaItem): number {
    return item.level ?? 0;
  }
}
