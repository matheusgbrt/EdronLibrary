import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ItemBrowserStateService } from '../../services/item-browser-state.service';
import { ItemSort, ItemSortKey } from '../../services/item-sort.service';

interface SortOption {
  label: string;
  key: ItemSortKey;
  direction: ItemSort['direction'];
}

@Component({
  selector: 'app-item-browser-toolbar',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatPaginatorModule,
    MatToolbarModule,
    MatTooltipModule
  ],
  templateUrl: './item-browser-toolbar.component.html',
  styleUrl: './item-browser-toolbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemBrowserToolbarComponent {
  readonly filterClicked = output<void>();
  readonly categoryClicked = output<void>();

  protected readonly state = inject(ItemBrowserStateService);

  protected readonly sortOptions: SortOption[] = [
    { label: 'Name A-Z', key: 'name', direction: 'asc' },
    { label: 'Name Z-A', key: 'name', direction: 'desc' },
    { label: 'Level descending', key: 'level', direction: 'desc' },
    { label: 'Weight ascending', key: 'weight', direction: 'asc' },
    { label: 'Highest attack', key: 'attack', direction: 'desc' },
    { label: 'Highest armor', key: 'armor', direction: 'desc' }
  ];

  onPage(event: PageEvent): void {
    this.state.setPage(event.pageIndex, event.pageSize);
  }

  setSort(option: SortOption): void {
    this.state.setSort({ key: option.key, direction: option.direction });
  }

  activeSortLabel(): string {
    const sort = this.state.sort();
    const label = this.sortOptions.find(
      (option) => option.key === sort.key && option.direction === sort.direction
    )?.label;

    return label ?? 'Sort';
  }
}
