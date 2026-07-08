import { buildRankedItemCardModel } from './item-card-rank';
import { TibiaItem } from '../../models';

const baseItem = {
  id: 'sample',
  name: 'Sample Item',
  level: 400,
  vocations: ['Knight'],
  weight: 12,
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

describe('buildRankedItemCardModel', () => {
  it('prioritizes armor before metadata for helmets', () => {
    const item = {
      ...baseItem,
      kind: 'armor',
      armor: { slot: 'Helmet', arm: 11, def: null, twoHanded: false }
    } satisfies TibiaItem;

    const model = buildRankedItemCardModel(item);

    expect(model.primary[0]).toEqual(
      expect.objectContaining({ key: 'armor', label: 'Armor', value: '11', icon: 'security' })
    );
    expect(model.secondary).toEqual([expect.objectContaining({ key: 'slot', value: 'Helmet', icon: 'checkroom' })]);
    expect(model.meta.map((fact) => fact.key)).toEqual(['level', 'weight', 'imbuementSlots', 'classification']);
  });

  it('prioritizes weapon attack, armor, and range when present', () => {
    const item = {
      ...baseItem,
      kind: 'weapon',
      weapon: {
        group: 'Bow',
        hands: 'TwoHanded',
        attack: 7,
        defense: 2,
        defenseModifier: null,
        range: 6,
        hitPercent: null,
        damageType: 'Physical',
        consumesAmmo: true
      }
    } satisfies TibiaItem;

    const model = buildRankedItemCardModel(item);

    expect(model.primary.map((fact) => fact.key)).toEqual(['attack', 'armor', 'range']);
    expect(model.primary[0]).toEqual(expect.objectContaining({ icon: 'flash_on' }));
    expect(model.primary[1]).toEqual(expect.objectContaining({ label: 'Armor', value: '2' }));
    expect(model.secondary.map((fact) => fact.key)).toEqual(['weaponGroup', 'hands', 'damageType']);
  });

  it('prioritizes elemental weapon damage when physical attack is absent', () => {
    const item = {
      ...baseItem,
      kind: 'weapon',
      bonuses: { Axe: 3 },
      weapon: {
        group: 'Axe',
        hands: 'TwoHanded',
        attack: null,
        defense: 34,
        defenseModifier: null,
        range: null,
        hitPercent: null,
        damageType: 'Earth',
        elementDamage: { Earth: 50 },
        consumesAmmo: false
      }
    } satisfies TibiaItem;

    const model = buildRankedItemCardModel(item);

    expect(model.primary.map((fact) => fact.key)).toEqual(['elementDamage.Earth', 'armor']);
    expect(model.primary[0]).toEqual(
      expect.objectContaining({ label: 'Earth', value: '50', icon: 'terrain' })
    );
    expect(model.bonuses).toEqual([expect.objectContaining({ key: 'Axe', value: '+3 Axe' })]);
  });

  it('prioritizes quiver volume and ammo types', () => {
    const item = {
      ...baseItem,
      kind: 'quiver',
      quiver: {
        volume: 25,
        acceptedAmmoTypes: ['Arrow', 'Bolt'],
        equipSlots: ['ShieldHand'],
        canUseWithTwoHandedDistanceWeapon: true,
        containerOnlyForAmmunition: true
      }
    } satisfies TibiaItem;

    const model = buildRankedItemCardModel(item);

    expect(model.primary).toEqual([
      expect.objectContaining({ key: 'slots', value: '25', icon: 'inventory_2' }),
      expect.objectContaining({ key: 'ammoTypes', value: 'Arrow/Bolt', icon: 'adjust' })
    ]);
  });

  it('prioritizes extra-slot bonuses before subtype metadata', () => {
    const item = {
      ...baseItem,
      kind: 'extra-slot',
      bonuses: { MagicLevel: 2 },
      protections: { Earth: 4, Energy: 4, Fire: 4 },
      extraSlot: {
        subtype: 'Trinket',
        providesLight: false,
        consumable: false
      }
    } satisfies TibiaItem;

    const model = buildRankedItemCardModel(item);

    expect(model.primary).toEqual([
      expect.objectContaining({ key: 'MagicLevel', label: 'MagicLevel', value: '+2', icon: 'auto_awesome' }),
      expect.objectContaining({ key: 'Earth', label: 'Earth', value: '4%', icon: 'health_and_safety' })
    ]);
    expect(model.secondary).toEqual([expect.objectContaining({ key: 'subtype', value: 'Trinket' })]);
    expect(model.bonuses).toEqual([]);
    expect(model.protections.map((fact) => fact.key)).toEqual(['Energy', 'Fire']);
  });

  it('keeps extra-slot subtype out of the primary stat grid when it has no ranked values', () => {
    const item = {
      ...baseItem,
      kind: 'extra-slot',
      extraSlot: {
        subtype: 'Trinket',
        providesLight: false,
        consumable: false
      }
    } satisfies TibiaItem;

    const model = buildRankedItemCardModel(item);

    expect(model.primary).toEqual([]);
    expect(model.secondary).toEqual([expect.objectContaining({ key: 'subtype', value: 'Trinket' })]);
  });

  it('shows shield defense value as armor without a separate defense fact', () => {
    const item = {
      ...baseItem,
      kind: 'armor',
      armor: { slot: 'Shield', arm: 0, def: 32, twoHanded: false }
    } satisfies TibiaItem;

    const model = buildRankedItemCardModel(item);

    expect(model.primary).toEqual([expect.objectContaining({ key: 'armor', value: '32' })]);
    expect(model.primary.map((fact) => fact.label)).not.toContain('Defense');
  });

  it('sorts bonuses and protections by value descending then alphabetically', () => {
    const item = {
      ...baseItem,
      kind: 'armor',
      armor: { slot: 'Armor', arm: 12, def: null, twoHanded: false },
      bonuses: { Sword: 1, Axe: 3, Club: 3 },
      protections: { Fire: 5, Earth: 7, Ice: 7 }
    } satisfies TibiaItem;

    const model = buildRankedItemCardModel(item);

    expect(model.bonuses.map((fact) => fact.key)).toEqual(['Axe', 'Club', 'Sword']);
    expect(model.protections.map((fact) => fact.key)).toEqual(['Earth', 'Ice', 'Fire']);
  });

  it('omits missing optional values from ranked facts', () => {
    const item = {
      ...baseItem,
      kind: 'armor',
      classification: null,
      maxTier: null,
      armor: { slot: 'Shield', arm: null, def: null, twoHanded: false }
    } satisfies TibiaItem;

    const model = buildRankedItemCardModel(item);

    expect(model.primary).toEqual([expect.objectContaining({ key: 'slot', value: 'Shield' })]);
    expect(model.meta.map((fact) => fact.key)).toEqual(['level', 'weight', 'imbuementSlots']);
  });
});
