import { BreakpointObserver } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatSidenavModule } from '@angular/material/sidenav';
import { map } from 'rxjs';

import { ItemBrowserToolbarComponent } from '../../components/item-browser-toolbar/item-browser-toolbar.component';
import { ItemCardGridComponent } from '../../components/item-card-grid/item-card-grid.component';
import { ItemCategorySidebarComponent } from '../../components/item-category-sidebar/item-category-sidebar.component';
import { ItemFilterDrawerComponent } from '../../components/item-filter-drawer/item-filter-drawer.component';
import { ItemBrowserStateService } from '../../services/item-browser-state.service';

@Component({
  selector: 'app-item-browser-page',
  standalone: true,
  imports: [
    ItemBrowserToolbarComponent,
    ItemCardGridComponent,
    ItemCategorySidebarComponent,
    ItemFilterDrawerComponent,
    MatSidenavModule
  ],
  templateUrl: './item-browser-page.component.html',
  styleUrl: './item-browser-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemBrowserPageComponent implements OnInit {
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly state = inject(ItemBrowserStateService);

  protected readonly isSmallScreen = toSignal(
    this.breakpointObserver.observe('(max-width: 767px)').pipe(map((result) => result.matches)),
    { initialValue: false }
  );
  private readonly mobileCategoryOpened = signal(false);
  protected readonly categoryOpened = computed(() => !this.isSmallScreen() || this.mobileCategoryOpened());

  ngOnInit(): void {
    this.state.loadItems();
  }

  protected toggleCategory(): void {
    if (this.isSmallScreen()) {
      this.mobileCategoryOpened.update((opened) => !opened);
    }
  }

  protected closeCategory(): void {
    this.mobileCategoryOpened.set(false);
  }
}
