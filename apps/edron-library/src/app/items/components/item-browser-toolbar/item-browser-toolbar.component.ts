import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ItemBrowserStateService } from '../../services/item-browser-state.service';
import { ITEM_SORT_OPTIONS } from '../../services/item-sort.service';

@Component({
  selector: 'app-item-browser-toolbar',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
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
  readonly sortClicked = output<void>();
  readonly categoryClicked = output<void>();

  protected readonly state = inject(ItemBrowserStateService);

  onPage(event: PageEvent): void {
    this.state.setPage(event.pageIndex, event.pageSize);
  }

  activeSortLabel(): string {
    const sorts = this.state.sorts();

    if (sorts.length > 1) {
      return `${sorts.length} sorts`;
    }

    const sort = sorts[0];
    const label = ITEM_SORT_OPTIONS.find((option) => option.key === sort?.key)?.label;
    const direction = sort?.direction === 'desc' ? 'high first' : 'low first';

    return label ? `${label}, ${direction}` : 'Sort';
  }
}
