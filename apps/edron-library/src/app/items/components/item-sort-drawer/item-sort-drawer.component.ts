import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ItemBrowserStateService } from '../../services/item-browser-state.service';
import { DEFAULT_ITEM_SORTS, ITEM_SORT_OPTIONS, ItemSort, ItemSortKey } from '../../services/item-sort.service';

type SortGroup = (typeof ITEM_SORT_OPTIONS)[number]['group'];

@Component({
  selector: 'app-item-sort-drawer',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatSelectModule,
    MatTooltipModule
  ],
  templateUrl: './item-sort-drawer.component.html',
  styleUrl: './item-sort-drawer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemSortDrawerComponent {
  protected readonly state = inject(ItemBrowserStateService);

  readonly closeClicked = output<void>();

  protected readonly groups: SortGroup[] = ['General', 'Combat', 'Elemental damage', 'Skill bonuses', 'Protections'];
  protected readonly directions: ItemSort['direction'][] = ['desc', 'asc'];

  optionsFor(group: SortGroup): typeof ITEM_SORT_OPTIONS {
    return ITEM_SORT_OPTIONS.filter((option) => option.group === group);
  }

  addSort(): void {
    const currentSorts = this.state.sorts();
    const selectedKeys = new Set(currentSorts.map((sort) => sort.key));
    const option =
      ITEM_SORT_OPTIONS.find((entry) => entry.key !== 'name' && !selectedKeys.has(entry.key)) ?? ITEM_SORT_OPTIONS[0];
    const nextSort = { key: option.key, direction: option.defaultDirection };
    const isOnlyDefaultNameSort =
      currentSorts.length === 1 &&
      currentSorts[0].key === DEFAULT_ITEM_SORTS[0].key &&
      currentSorts[0].direction === DEFAULT_ITEM_SORTS[0].direction;

    this.state.setSorts(isOnlyDefaultNameSort ? [nextSort] : [...currentSorts, nextSort]);
  }

  resetSorts(): void {
    this.state.setSorts(DEFAULT_ITEM_SORTS.map((sort) => ({ ...sort })));
  }

  removeSort(index: number): void {
    this.state.setSorts(this.state.sorts().filter((_, sortIndex) => sortIndex !== index));
  }

  moveSort(index: number, offset: -1 | 1): void {
    const next = [...this.state.sorts()];
    const target = index + offset;

    if (target < 0 || target >= next.length) {
      return;
    }

    [next[index], next[target]] = [next[target], next[index]];
    this.state.setSorts(next);
  }

  setSortKey(index: number, key: ItemSortKey): void {
    const option = ITEM_SORT_OPTIONS.find((entry) => entry.key === key);
    this.patchSort(index, {
      key,
      direction: option?.defaultDirection ?? this.state.sorts()[index]?.direction ?? 'desc'
    });
  }

  setDirection(index: number, direction: ItemSort['direction']): void {
    this.patchSort(index, { direction });
  }

  sortLabel(sort: ItemSort): string {
    return ITEM_SORT_OPTIONS.find((option) => option.key === sort.key)?.label ?? sort.key;
  }

  directionLabel(direction: ItemSort['direction']): string {
    return direction === 'desc' ? 'High first' : 'Low first';
  }

  private patchSort(index: number, partial: Partial<ItemSort>): void {
    this.state.setSorts(
      this.state.sorts().map((sort, sortIndex) => (sortIndex === index ? { ...sort, ...partial } : sort))
    );
  }
}
