import { BreakpointObserver } from '@angular/cdk/layout';
import { signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReplaySubject, of } from 'rxjs';
import { Mock, vi } from 'vitest';

import { ItemBrowserPageComponent } from './item-browser-page.component';
import { ItemBrowserStateService } from '../../services/item-browser-state.service';
import { DEFAULT_ITEM_FILTERS } from '../../services/item-filter.service';
import {
  findSeoRouteByPath,
  ItemSeoRouteDefinition,
  ItemSeoRouteService
} from '../../services/item-seo-route.service';
import { DEFAULT_ITEM_SORTS } from '../../services/item-sort.service';

describe('ItemBrowserPageComponent SEO routes', () => {
  let fixture: ComponentFixture<ItemBrowserPageComponent>;
  let routeData: ReplaySubject<{ seoRoute?: ItemSeoRouteDefinition }>;
  let state: ItemBrowserStateService;
  let seo: Pick<ItemSeoRouteService, 'apply'>;

  beforeEach(async () => {
    routeData = new ReplaySubject<{ seoRoute?: ItemSeoRouteDefinition }>(1);
    state = {
      loadItems: vi.fn(),
      resetFilters: vi.fn(),
      patchFilters: vi.fn(),
      setPage: vi.fn(),
      setSorts: vi.fn(),
      setBonusThreshold: vi.fn(),
      setProtectionThreshold: vi.fn(),
      setElementalDamageThreshold: vi.fn(),
      filters: signal({
        ...DEFAULT_ITEM_FILTERS,
        bonuses: {},
        protections: {},
        elementalDamages: {},
        dropsFrom: []
      }),
      sorts: signal(DEFAULT_ITEM_SORTS),
      loading: signal(false),
      loadError: signal(null),
      pagedItems: signal([]),
      totalCount: signal(0),
      pageIndex: signal(0),
      pageSize: signal(20)
    } as unknown as ItemBrowserStateService;
    seo = {
      apply: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [ItemBrowserPageComponent],
      providers: [
        {
          provide: BreakpointObserver,
          useValue: {
            observe: () => of({ matches: false })
          }
        },
        {
          provide: ActivatedRoute,
          useValue: {
            data: routeData.asObservable()
          }
        },
        { provide: ItemBrowserStateService, useValue: state },
        { provide: ItemSeoRouteService, useValue: seo }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ItemBrowserPageComponent);
  });

  it('applies category route filters and metadata', () => {
    const route = findSeoRouteByPath('/weapons/bows');

    expect(route).toBeTruthy();

    fixture.detectChanges();
    routeData.next({ seoRoute: route });

    expect(state.loadItems as Mock).toHaveBeenCalled();
    expect(state.resetFilters as Mock).toHaveBeenCalled();
    expect(state.patchFilters as Mock).toHaveBeenCalledWith(route?.filters);
    expect(seo.apply as Mock).toHaveBeenCalledWith(route);
  });

  it('applies item routes as exact query filters', () => {
    const route = findSeoRouteByPath('/items/amber-bow');

    expect(route).toBeTruthy();

    fixture.detectChanges();
    routeData.next({ seoRoute: route });

    expect(state.patchFilters as Mock).toHaveBeenCalledWith({ query: 'Amber Bow' });
    expect(seo.apply as Mock).toHaveBeenCalledWith(route);
  });
});
