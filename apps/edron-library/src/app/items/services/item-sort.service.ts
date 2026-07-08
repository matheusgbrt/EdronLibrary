import { Injectable } from '@angular/core';

import { TibiaItem } from '../models';

export type ItemSortKey =
  | 'name'
  | 'level'
  | 'weight'
  | 'imbuementSlots'
  | 'classification'
  | 'maxTier'
  | 'armor'
  | 'attack'
  | 'defense';

export interface ItemSort {
  key: ItemSortKey;
  direction: 'asc' | 'desc';
}

@Injectable({ providedIn: 'root' })
export class ItemSortService {
  sortItems(items: TibiaItem[], sort: ItemSort): TibiaItem[] {
    return [...items].sort((left, right) => this.compareItems(left, right, sort));
  }

  private compareItems(left: TibiaItem, right: TibiaItem, sort: ItemSort): number {
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
    return compared === 0 ? left.name.localeCompare(right.name) : compared * direction;
  }

  private numericValue(item: TibiaItem, key: ItemSortKey): number | null {
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
        return item.kind === 'armor' ? item.armor.arm : null;
      case 'attack':
        return item.kind === 'weapon' ? item.weapon.attack : null;
      case 'defense':
        if (item.kind === 'weapon') {
          return item.weapon.defense;
        }
        return item.kind === 'armor' ? item.armor.def : null;
      case 'name':
        return null;
    }
  }
}
