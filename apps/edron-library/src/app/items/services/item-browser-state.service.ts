import { Injectable, computed, inject, signal } from '@angular/core';

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
import { ItemDataService } from './item-data.service';
import { DEFAULT_ITEM_FILTERS, ItemFilterService, ItemFilters } from './item-filter.service';
import { DEFAULT_ITEM_SORTS, ItemSort, ItemSortService } from './item-sort.service';

@Injectable({ providedIn: 'root' })
export class ItemBrowserStateService {
  private readonly itemDataService = inject(ItemDataService);
  private readonly itemFilterService = inject(ItemFilterService);
  private readonly itemSortService = inject(ItemSortService);

  readonly allItems = signal<TibiaItem[]>([]);
  readonly filters = signal<ItemFilters>({ ...DEFAULT_ITEM_FILTERS });
  readonly sorts = signal<ItemSort[]>(DEFAULT_ITEM_SORTS.map((sort) => ({ ...sort })));
  readonly pageIndex = signal(0);
  readonly pageSize = signal(20);
  readonly loading = signal(false);
  readonly loadError = signal<string | null>(null);

  readonly filteredItems = computed(() =>
    this.itemFilterService.applyFilters(this.allItems(), this.filters())
  );

  readonly sortedItems = computed(() =>
    this.itemSortService.sortItems(this.filteredItems(), this.sorts())
  );

  readonly totalCount = computed(() => this.sortedItems().length);

  readonly pagedItems = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    return this.sortedItems().slice(start, start + this.pageSize());
  });

  readonly pageStart = computed(() => {
    if (this.totalCount() === 0) {
      return 0;
    }

    return this.pageIndex() * this.pageSize() + 1;
  });

  readonly pageEnd = computed(() =>
    Math.min((this.pageIndex() + 1) * this.pageSize(), this.totalCount())
  );

  loadItems(): void {
    if (this.allItems().length > 0 || this.loading()) {
      return;
    }

    this.loading.set(true);
    this.loadError.set(null);

    this.itemDataService.getItems().subscribe({
      next: (items) => {
        this.allItems.set(items);
        this.loading.set(false);
      },
      error: () => {
        this.loadError.set('Unable to load item data.');
        this.loading.set(false);
      }
    });
  }

  patchFilters(partial: Partial<ItemFilters>): void {
    this.filters.update((filters) => ({
      ...filters,
      ...partial,
      bonuses: partial.bonuses ?? filters.bonuses,
      protections: partial.protections ?? filters.protections,
      elementalDamages: partial.elementalDamages ?? filters.elementalDamages
    }));
    this.pageIndex.set(0);
  }

  resetFilters(): void {
    this.filters.set({
      ...DEFAULT_ITEM_FILTERS,
      bonuses: {},
      protections: {},
      elementalDamages: {},
      dropsFrom: []
    });
    this.pageIndex.set(0);
  }

  setSort(sort: ItemSort): void {
    this.setSorts([sort]);
  }

  setSorts(sorts: ItemSort[]): void {
    this.sorts.set(sorts.length > 0 ? sorts : DEFAULT_ITEM_SORTS.map((sort) => ({ ...sort })));
    this.pageIndex.set(0);
  }

  setPage(pageIndex: number, pageSize: number): void {
    this.pageIndex.set(pageIndex);
    this.pageSize.set(pageSize);
  }

  setCategoryFilter(category: CategoryFilter): void {
    this.patchFilters({
      kinds: category.kinds,
      armorSlots: category.armorSlots,
      weaponGroups: category.weaponGroups,
      extraSlotSubtypes: category.extraSlotSubtypes
    });
  }

  toggleVocation(vocation: Vocation): void {
    this.patchFilters({ vocations: this.toggleValue(this.filters().vocations, vocation) });
  }

  setBonusThreshold(skill: SkillBonus, value: number | null): void {
    this.patchFilters({ bonuses: this.withThreshold(this.filters().bonuses, skill, value) });
  }

  setProtectionThreshold(element: Element, value: number | null): void {
    this.patchFilters({ protections: this.withThreshold(this.filters().protections, element, value) });
  }

  setElementalDamageThreshold(element: Element, value: number | null): void {
    this.patchFilters({
      elementalDamages: this.withThreshold(this.filters().elementalDamages, element, value)
    });
  }

  private toggleValue<T>(values: T[], value: T): T[] {
    return values.includes(value) ? values.filter((entry) => entry !== value) : [...values, value];
  }

  private withThreshold<T extends string>(
    thresholds: Partial<Record<T, number>>,
    key: T,
    value: number | null
  ): Partial<Record<T, number>> {
    const next = { ...thresholds };

    if (value === null || Number.isNaN(value)) {
      delete next[key];
    } else {
      next[key] = value;
    }

    return next;
  }
}

export interface CategoryFilter {
  kinds: ItemKind[];
  armorSlots: ArmorSlot[];
  weaponGroups: WeaponGroup[];
  extraSlotSubtypes: ExtraSlotSubtype[];
}
