import { ItemSortService } from './item-sort.service';
import { TibiaItem } from '../models';

const baseItem = {
  level: 1,
  vocations: ['Knight'],
  weight: 1,
  marketable: true,
  imbuementSlots: 0,
  classification: null,
  maxTier: null,
  bonuses: {},
  protections: {},
  specialEffects: [],
  dropsFrom: { normal: [], boss: [], invasion: [], quest: [], other: [] },
  sources: { primary: 'manual', urls: {}, confidence: 'high' },
  assets: { imagePath: '' },
  metadata: { tags: [], dataQuality: 'complete' }
} satisfies Omit<TibiaItem, 'id' | 'name' | 'kind'>;

describe('ItemSortService', () => {
  it('sorts armor by armor value with shield defense as the fallback armor value', () => {
    const service = new ItemSortService();
    const lowArmor = {
      ...baseItem,
      id: 'low-armor',
      name: 'Low Armor',
      kind: 'armor',
      armor: { slot: 'Armor', arm: 8, def: null, twoHanded: false }
    } satisfies TibiaItem;
    const shield = {
      ...baseItem,
      id: 'shield',
      name: 'Shield',
      kind: 'armor',
      armor: { slot: 'Shield', arm: 0, def: 32, twoHanded: false }
    } satisfies TibiaItem;

    const sorted = service.sortItems([lowArmor, shield], { key: 'armor', direction: 'desc' });

    expect(sorted.map((item) => item.id)).toEqual(['shield', 'low-armor']);
  });
});
