import { BreakpointObserver } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { map } from 'rxjs';

import { ItemBrowserToolbarComponent } from '../../components/item-browser-toolbar/item-browser-toolbar.component';
import { ItemCardGridComponent } from '../../components/item-card-grid/item-card-grid.component';
import { ItemCategorySidebarComponent } from '../../components/item-category-sidebar/item-category-sidebar.component';
import { ItemFilterDrawerComponent } from '../../components/item-filter-drawer/item-filter-drawer.component';
import { ItemSortDrawerComponent } from '../../components/item-sort-drawer/item-sort-drawer.component';
import { ItemBrowserStateService } from '../../services/item-browser-state.service';
import {
  ItemSeoRouteDefinition,
  ItemSeoRouteService,
  ROOT_SEO_ROUTE
} from '../../services/item-seo-route.service';

type UtilityDrawer = 'filter' | 'sort';

@Component({
  selector: 'app-item-browser-page',
  standalone: true,
  imports: [
    ItemBrowserToolbarComponent,
    ItemCardGridComponent,
    ItemCategorySidebarComponent,
    ItemFilterDrawerComponent,
    ItemSortDrawerComponent,
    MatSidenavModule
  ],
  templateUrl: './item-browser-page.component.html',
  styleUrl: './item-browser-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemBrowserPageComponent implements OnInit {
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly state = inject(ItemBrowserStateService);
  private readonly seoRouteService = inject(ItemSeoRouteService);

  protected readonly isSmallScreen = toSignal(
    this.breakpointObserver.observe('(max-width: 767px)').pipe(map((result) => result.matches)),
    { initialValue: false }
  );
  private readonly mobileCategoryOpened = signal(false);
  protected readonly activeUtilityDrawer = signal<UtilityDrawer>('filter');
  protected readonly categoryOpened = computed(() => !this.isSmallScreen() || this.mobileCategoryOpened());

  ngOnInit(): void {
    this.state.loadItems();
    this.route.data
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => {
        this.applySeoRoute((data['seoRoute'] as ItemSeoRouteDefinition | undefined) ?? ROOT_SEO_ROUTE);
      });
  }

  protected toggleCategory(): void {
    if (this.isSmallScreen()) {
      this.mobileCategoryOpened.update((opened) => !opened);
    }
  }

  protected closeCategory(): void {
    this.mobileCategoryOpened.set(false);
  }

  protected openUtilityDrawer(drawer: { open: () => void }, activeDrawer: UtilityDrawer): void {
    this.activeUtilityDrawer.set(activeDrawer);
    drawer.open();
  }

  private applySeoRoute(route: ItemSeoRouteDefinition): void {
    this.state.resetFilters();

    if (Object.keys(route.filters).length > 0) {
      this.state.patchFilters(route.filters);
    }

    this.seoRouteService.apply(route);
  }
}
