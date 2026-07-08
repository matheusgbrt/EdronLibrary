import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { TranslocoPipe } from '@jsverse/transloco';

import { ItemBrowserStateService } from '../../services/item-browser-state.service';
import { ItemCardComponent } from '../item-card/item-card.component';

@Component({
  selector: 'app-item-card-grid',
  standalone: true,
  imports: [ItemCardComponent, MatIconModule, MatPaginatorModule, TranslocoPipe],
  templateUrl: './item-card-grid.component.html',
  styleUrl: './item-card-grid.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemCardGridComponent {
  protected readonly state = inject(ItemBrowserStateService);

  onPage(event: PageEvent): void {
    this.state.setPage(event.pageIndex, event.pageSize);
  }
}
