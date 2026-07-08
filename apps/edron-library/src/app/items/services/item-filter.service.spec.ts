import { TibiaItem } from '../models';
import { DEFAULT_ITEM_FILTERS, ItemFilterService } from './item-filter.service';

const baseItem = {
  id: 'sample',
  name: 'Sample Item',
  level: 330,
  vocations: ['Knight'],
  weight: 50,
  marketable: true,
  imbuementSlots: 2,
  classification: 4,
  maxTier: null,
  bonuses: {},
  protections: {},
  specialEffects: [],
  dropsFrom: { normal: [], boss: [], invasion: [], quest: [], other: [] },
  sources: { primary: 'manual', urls: {}, confidence: 'high' },
  assets: { imagePath: '' },
  metadata: { tags: [], dataQuality: 'complete' }
} satisfies Omit<TibiaItem, 'kind'>;

function weaponItem(
  name: string,
  elementDamage: NonNullable<TibiaItem & { kind: 'weapon' }>['weapon']['elementDamage'],
  damageRange?: NonNullable<TibiaItem & { kind: 'weapon' }>['weapon']['damageRange']
): TibiaItem {
  return {
    ...baseItem,
    id: name.toLowerCase().replaceAll(' ', '-'),
    name,
    kind: 'weapon',
    weapon: {
      group: 'Axe',
      hands: 'TwoHanded',
      attack: null,
      defense: 34,
      defenseModifier: null,
      range: null,
      hitPercent: null,
      damageType: 'Earth',
      elementDamage,
      damageRange,
      consumesAmmo: false
    }
  };
}

describe('ItemFilterService', () => {
  it('filters weapons by minimum elemental damage', () => {
    const service = new ItemFilterService();
    const result = service.applyFilters(
      [
        weaponItem('Amber Greataxe', { Earth: 50 }),
        weaponItem('Low Earth Axe', { Earth: 30 }),
        weaponItem('Plain Axe', undefined)
      ],
      {
        ...DEFAULT_ITEM_FILTERS,
        elementalDamages: { Earth: 50 }
      }
    );

    expect(result.map((item) => item.name)).toEqual(['Amber Greataxe']);
  });

  it('filters weapons by damage range average', () => {
    const service = new ItemFilterService();
    const result = service.applyFilters(
      [
        weaponItem('Underworld Rod', undefined, { average: 65, min: 56, max: 74, raw: '56-74' }),
        weaponItem('Wand of Dragonbreath', undefined, { average: 19, min: 13, max: 25, raw: '19 (13-25)' }),
        weaponItem('Plain Wand', undefined)
      ],
      {
        ...DEFAULT_ITEM_FILTERS,
        minDamageRangeAverage: 50,
        maxDamageRangeAverage: 80
      }
    );

    expect(result.map((item) => item.name)).toEqual(['Underworld Rod']);
  });
});
