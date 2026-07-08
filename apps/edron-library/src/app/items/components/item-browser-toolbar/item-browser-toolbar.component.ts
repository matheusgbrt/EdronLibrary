import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { LanguageSwitcherComponent } from '../../../core/i18n/language-switcher/language-switcher.component';
import { ItemBrowserStateService } from '../../services/item-browser-state.service';
import { ItemSort, ItemSortKey } from '../../services/item-sort.service';

interface SortOption {
  labelKey: string;
  key: ItemSortKey;
  direction: ItemSort['direction'];
}

@Component({
  selector: 'app-item-browser-toolbar',
  standalone: true,
  imports: [
    LanguageSwitcherComponent,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatPaginatorModule,
    MatToolbarModule,
    MatTooltipModule,
    TranslocoPipe
  ],
  templateUrl: './item-browser-toolbar.component.html',
  styleUrl: './item-browser-toolbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemBrowserToolbarComponent {
  readonly filterClicked = output<void>();
  readonly categoryClicked = output<void>();

  protected readonly state = inject(ItemBrowserStateService);
  private readonly transloco = inject(TranslocoService);
  private readonly activeLang = this.transloco.activeLang;

  protected readonly sortOptions: SortOption[] = [
    { labelKey: 'sort.nameAsc', key: 'name', direction: 'asc' },
    { labelKey: 'sort.nameDesc', key: 'name', direction: 'desc' },
    { labelKey: 'sort.levelDesc', key: 'level', direction: 'desc' },
    { labelKey: 'sort.weightAsc', key: 'weight', direction: 'asc' },
    { labelKey: 'sort.attackDesc', key: 'attack', direction: 'desc' },
    { labelKey: 'sort.defenseDesc', key: 'defense', direction: 'desc' },
    { labelKey: 'sort.armorDesc', key: 'armor', direction: 'desc' }
  ];

  onPage(event: PageEvent): void {
    this.state.setPage(event.pageIndex, event.pageSize);
  }

  setSort(option: SortOption): void {
    this.state.setSort({ key: option.key, direction: option.direction });
  }

  activeSortLabel(): string {
    const lang = this.activeLang();
    const sort = this.state.sort();
    const labelKey = this.sortOptions.find(
      (option) => option.key === sort.key && option.direction === sort.direction
    )?.labelKey;

    return labelKey
      ? this.transloco.translate(labelKey, {}, lang)
      : this.transloco.translate('items.sort', {}, lang);
  }
}
