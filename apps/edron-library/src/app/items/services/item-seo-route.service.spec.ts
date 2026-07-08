import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';

import {
  findSeoRouteByPath,
  ITEM_SEO_ROUTE_DEFINITIONS,
  ItemSeoRouteService,
  ROOT_SEO_ROUTE
} from './item-seo-route.service';

describe('item SEO route catalog', () => {
  it('defines category routes with route filters and metadata', () => {
    const bows = findSeoRouteByPath('/weapons/bows');

    expect(bows).toEqual(
      expect.objectContaining({
        path: '/weapons/bows',
        title: 'Tibia Bows - Edron Library',
        filters: expect.objectContaining({
          kinds: ['weapon'],
          weaponGroups: ['Bow']
        })
      })
    );
    expect(bows?.description).toContain('attack, range, hit%');
  });

  it('defines pilot item routes as exact item search filters', () => {
    const amberBow = findSeoRouteByPath('/items/amber-bow');

    expect(amberBow).toEqual(
      expect.objectContaining({
        path: '/items/amber-bow',
        title: 'Amber Bow - Tibia Item Stats - Edron Library',
        filters: expect.objectContaining({ query: 'Amber Bow' })
      })
    );
    expect(amberBow?.description).toContain('Amber Bow stats');
  });

  it('normalizes trailing slashes when finding routes', () => {
    expect(findSeoRouteByPath('/armor/helmets/')).toBe(findSeoRouteByPath('/armor/helmets'));
  });

  it('keeps the first SEO slice intentionally small', () => {
    expect(ITEM_SEO_ROUTE_DEFINITIONS.map((route) => route.path)).toEqual([
      '/weapons/bows',
      '/weapons/crossbows',
      '/weapons/axes',
      '/weapons/swords',
      '/armor/helmets',
      '/armor/shields',
      '/armor/boots',
      '/extra-slot/trinkets',
      '/extra-slot/quivers',
      '/items/amber-bow',
      '/items/amber-greataxe',
      '/items/alicorn-headguard',
      '/items/alicorn-ring',
      '/items/amethyst-necklace'
    ]);
  });
});

describe('ItemSeoRouteService', () => {
  it('updates document title, meta tags, and canonical URL', () => {
    const service = TestBed.inject(ItemSeoRouteService);
    const title = TestBed.inject(Title);
    const meta = TestBed.inject(Meta);
    const document = TestBed.inject(DOCUMENT);
    const route = findSeoRouteByPath('/items/amber-bow');

    expect(route).toBeTruthy();

    service.apply(route ?? ROOT_SEO_ROUTE);

    expect(title.getTitle()).toBe('Amber Bow - Tibia Item Stats - Edron Library');
    expect(meta.getTag('name="description"')?.content).toContain('Amber Bow stats');
    expect(meta.getTag('property="og:url"')?.content).toBe('https://edronlibrary.com/items/amber-bow');
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      'https://edronlibrary.com/items/amber-bow'
    );
  });
});
