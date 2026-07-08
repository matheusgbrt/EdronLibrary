import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

import { ArmorSlot, ExtraSlotSubtype, ItemKind, WeaponGroup } from '../models';
import { ItemFilters } from './item-filter.service';

const SITE_URL = 'https://edronlibrary.com';

export interface ItemSeoRouteDefinition {
  path: string;
  title: string;
  description: string;
  filters: Partial<ItemFilters>;
}

interface CategorySeoRouteInput {
  path: string;
  title: string;
  description: string;
  filters: {
    kinds: ItemKind[];
    armorSlots?: ArmorSlot[];
    weaponGroups?: WeaponGroup[];
    extraSlotSubtypes?: ExtraSlotSubtype[];
  };
}

interface ItemSeoRouteInput {
  slug: string;
  name: string;
}

export const ROOT_SEO_ROUTE: ItemSeoRouteDefinition = {
  path: '/',
  title: 'Edron Library',
  description:
    'Browse, filter, sort, and compare Tibia equipment with item stats, vocations, protections, bonuses, imbuement slots, and wiki links.',
  filters: {}
};

const CATEGORY_ROUTES: CategorySeoRouteInput[] = [
  {
    path: '/weapons/bows',
    title: 'Tibia Bows - Edron Library',
    description:
      'Compare Tibia bows by attack, range, hit%, distance bonus, elemental damage, imbuement slots, vocation, level, and protections.',
    filters: { kinds: ['weapon'], weaponGroups: ['Bow'] }
  },
  {
    path: '/weapons/crossbows',
    title: 'Tibia Crossbows - Edron Library',
    description:
      'Compare Tibia crossbows by attack, range, hit%, distance bonus, elemental damage, imbuement slots, vocation, level, and protections.',
    filters: { kinds: ['weapon'], weaponGroups: ['Crossbow'] }
  },
  {
    path: '/weapons/axes',
    title: 'Tibia Axes - Edron Library',
    description:
      'Compare Tibia axes by attack, elemental damage, armor value, axe fighting bonus, imbuement slots, vocation, level, and protections.',
    filters: { kinds: ['weapon'], weaponGroups: ['Axe'] }
  },
  {
    path: '/weapons/swords',
    title: 'Tibia Swords - Edron Library',
    description:
      'Compare Tibia swords by attack, elemental damage, armor value, sword fighting bonus, imbuement slots, vocation, level, and protections.',
    filters: { kinds: ['weapon'], weaponGroups: ['Sword'] }
  },
  {
    path: '/armor/helmets',
    title: 'Tibia Helmets - Edron Library',
    description:
      'Compare Tibia helmets by armor, vocation, level, weight, imbuement slots, skill bonuses, protections, and wiki links.',
    filters: { kinds: ['armor'], armorSlots: ['Helmet'] }
  },
  {
    path: '/armor/shields',
    title: 'Tibia Shields - Edron Library',
    description:
      'Compare Tibia shields by armor value, vocation, level, weight, imbuement slots, protections, bonuses, and wiki links.',
    filters: { kinds: ['armor'], armorSlots: ['Shield'] }
  },
  {
    path: '/armor/boots',
    title: 'Tibia Boots - Edron Library',
    description:
      'Compare Tibia boots by armor, vocation, level, weight, imbuement slots, speed or skill bonuses, protections, and wiki links.',
    filters: { kinds: ['armor'], armorSlots: ['Boots'] }
  },
  {
    path: '/extra-slot/trinkets',
    title: 'Tibia Trinkets - Edron Library',
    description:
      'Compare Tibia trinkets by bonuses, protections, vocation, level, weight, imbuement slots, and wiki links.',
    filters: { kinds: ['extra-slot'], extraSlotSubtypes: ['Trinket'] }
  },
  {
    path: '/extra-slot/quivers',
    title: 'Tibia Quivers - Edron Library',
    description:
      'Compare Tibia quivers by slot volume, accepted ammo types, bonuses, protections, vocation, level, imbuement slots, and wiki links.',
    filters: { kinds: ['quiver'] }
  }
];

const ITEM_ROUTES: ItemSeoRouteInput[] = [
  { slug: 'amber-bow', name: 'Amber Bow' },
  { slug: 'amber-greataxe', name: 'Amber Greataxe' },
  { slug: 'alicorn-headguard', name: 'Alicorn Headguard' },
  { slug: 'alicorn-ring', name: 'Alicorn Ring' },
  { slug: 'amethyst-necklace', name: 'Amethyst Necklace' }
];

export const ITEM_SEO_ROUTE_DEFINITIONS: ItemSeoRouteDefinition[] = [
  ...CATEGORY_ROUTES.map(toCategoryDefinition),
  ...ITEM_ROUTES.map(toItemDefinition)
];

export function findSeoRouteByPath(path: string): ItemSeoRouteDefinition | undefined {
  const normalizedPath = normalizePath(path);
  return ITEM_SEO_ROUTE_DEFINITIONS.find((route) => route.path === normalizedPath);
}

export function canonicalUrl(path: string): string {
  return `${SITE_URL}${path === '/' ? '/' : path}`;
}

function toCategoryDefinition(route: CategorySeoRouteInput): ItemSeoRouteDefinition {
  return {
    path: route.path,
    title: route.title,
    description: route.description,
    filters: {
      kinds: route.filters.kinds,
      armorSlots: route.filters.armorSlots ?? [],
      weaponGroups: route.filters.weaponGroups ?? [],
      extraSlotSubtypes: route.filters.extraSlotSubtypes ?? []
    }
  };
}

function toItemDefinition(item: ItemSeoRouteInput): ItemSeoRouteDefinition {
  return {
    path: `/items/${item.slug}`,
    title: `${item.name} - Tibia Item Stats - Edron Library`,
    description: `View ${item.name} stats, requirements, attack, range, hit%, bonuses, protections, imbuement slots, and wiki links.`,
    filters: { query: item.name }
  };
}

function normalizePath(path: string): string {
  const withoutQuery = path.split(/[?#]/)[0] || '/';
  const withLeadingSlash = withoutQuery.startsWith('/') ? withoutQuery : `/${withoutQuery}`;
  const withoutTrailingSlash =
    withLeadingSlash.length > 1 ? withLeadingSlash.replace(/\/+$/, '') : withLeadingSlash;

  return withoutTrailingSlash || '/';
}

@Injectable({ providedIn: 'root' })
export class ItemSeoRouteService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  apply(route: ItemSeoRouteDefinition): void {
    const url = canonicalUrl(route.path);

    this.title.setTitle(route.title);
    this.meta.updateTag({ name: 'description', content: route.description });
    this.meta.updateTag({ property: 'og:title', content: route.title });
    this.meta.updateTag({ property: 'og:description', content: route.description });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ name: 'twitter:title', content: route.title });
    this.meta.updateTag({ name: 'twitter:description', content: route.description });
    this.updateCanonical(url);
  }

  private updateCanonical(url: string): void {
    let canonical = this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]');

    if (!canonical) {
      canonical = this.document.createElement('link');
      canonical.rel = 'canonical';
      this.document.head.appendChild(canonical);
    }

    canonical.href = url;
  }
}
