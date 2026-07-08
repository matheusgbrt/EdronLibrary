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

  it('falls through ordered sorts before the name tie-breaker', () => {
    const service = new ItemSortService();
    const lowAttack = weaponItem('Low Attack', { attack: 6, elementDamage: { Earth: 50 }, level: 330 });
    const highAttack = weaponItem('High Attack', { attack: 8, elementDamage: { Earth: 50 }, level: 600 });
    const lowElement = weaponItem('Low Element', { attack: 10, elementDamage: { Earth: 30 }, level: 100 });

    const sorted = service.sortItems([lowAttack, highAttack, lowElement], [
      { key: 'elementDamage.Earth', direction: 'desc' },
      { key: 'attack', direction: 'desc' },
      { key: 'level', direction: 'asc' }
    ]);

    expect(sorted.map((item) => item.name)).toEqual(['High Attack', 'Low Attack', 'Low Element']);
  });

  it('sorts skill bonuses and protections while sinking missing values', () => {
    const service = new ItemSortService();
    const magicAndFire = armorItem('Magic and Fire', { bonuses: { MagicLevel: 2 }, protections: { Fire: 5 } });
    const betterFire = armorItem('Better Fire', { bonuses: { MagicLevel: 2 }, protections: { Fire: 8 } });
    const noMagic = armorItem('No Magic', { bonuses: {}, protections: { Fire: 10 } });

    const sorted = service.sortItems([noMagic, magicAndFire, betterFire], [
      { key: 'bonus.MagicLevel', direction: 'desc' },
      { key: 'protection.Fire', direction: 'desc' }
    ]);

    expect(sorted.map((item) => item.name)).toEqual(['Better Fire', 'Magic and Fire', 'No Magic']);
  });

  it('sorts weapon damage ranges by average value', () => {
    const service = new ItemSortService();
    const underworldRod = weaponItem('Underworld Rod', {
      attack: null,
      damageType: 'Death',
      damageRange: { average: 65, min: 56, max: 74, raw: '56-74' },
      level: 42
    });
    const wandOfDragonbreath = weaponItem('Wand of Dragonbreath', {
      attack: null,
      damageType: 'Fire',
      damageRange: { average: 19, min: 13, max: 25, raw: '19 (13-25)' },
      level: 13
    });
    const noDamageRange = weaponItem('Plain Wand', {
      attack: null,
      damageType: 'Energy',
      level: 1
    });

    const sorted = service.sortItems([wandOfDragonbreath, noDamageRange, underworldRod], {
      key: 'damageRange',
      direction: 'desc'
    });

    expect(sorted.map((item) => item.name)).toEqual(['Underworld Rod', 'Wand of Dragonbreath', 'Plain Wand']);
  });
});

function armorItem(
  name: string,
  options: {
    bonuses?: TibiaItem['bonuses'];
    protections?: TibiaItem['protections'];
  } = {}
): TibiaItem {
  return {
    ...baseItem,
    id: name.toLowerCase().replaceAll(' ', '-'),
    name,
    kind: 'armor',
    bonuses: options.bonuses ?? {},
    protections: options.protections ?? {},
    armor: { slot: 'Armor', arm: 10, def: null, twoHanded: false }
  };
}

function weaponItem(
  name: string,
  options: {
    attack: number | null;
    elementDamage?: NonNullable<TibiaItem & { kind: 'weapon' }>['weapon']['elementDamage'];
    damageRange?: NonNullable<TibiaItem & { kind: 'weapon' }>['weapon']['damageRange'];
    damageType?: NonNullable<TibiaItem & { kind: 'weapon' }>['weapon']['damageType'];
    level: number | null;
  }
): TibiaItem {
  return {
    ...baseItem,
    id: name.toLowerCase().replaceAll(' ', '-'),
    name,
    level: options.level,
    kind: 'weapon',
    weapon: {
      group: 'Axe',
      hands: 'TwoHanded',
      attack: options.attack,
      defense: 34,
      defenseModifier: null,
      range: null,
      hitPercent: null,
      damageType: options.damageType ?? 'Earth',
      elementDamage: options.elementDamage,
      damageRange: options.damageRange,
      consumesAmmo: false
    }
  };
}
