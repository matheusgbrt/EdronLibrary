import { z } from 'zod';

export const VocationSchema = z.enum([
  'None',
  'Knight',
  'Paladin',
  'Sorcerer',
  'Druid',
  'Monk',
]);
export type Vocation = z.infer<typeof VocationSchema>;

export const ElementSchema = z.enum([
  'Physical',
  'Fire',
  'Earth',
  'Energy',
  'Ice',
  'Holy',
  'Death',
]);
export type Element = z.infer<typeof ElementSchema>;

export const SkillBonusSchema = z.enum([
  'Axe',
  'Club',
  'Sword',
  'Distance',
  'Shielding',
  'MagicLevel',
  'Fist',
]);
export type SkillBonus = z.infer<typeof SkillBonusSchema>;

export const ItemKindSchema = z.enum(['armor', 'weapon', 'quiver', 'extra-slot']);
export const ItemDataSourceSchema = z.enum([
  'manual',
  'tibiawiki',
  'tibiafandom',
  'tibiadata',
  'client',
  'mixed',
]);
export const SourceConfidenceSchema = z.enum(['high', 'medium', 'low', 'unknown']);
export const DataQualitySchema = z.enum(['complete', 'partial', 'needs-review', 'manual']);

export const SpecialEffectSchema = z.object({
  type: z.enum([
    'PerfectShot',
    'CriticalHitChance',
    'CriticalExtraDamage',
    'ManaLeech',
    'LifeLeech',
    'Capacity',
    'Speed',
    'Light',
    'ParalysisRemoval',
    'DamageReflection',
    'Other',
  ]),
  value: z.union([z.number(), z.string(), z.boolean()]),
  unit: z.enum(['%', 'flat', 'sqm', 'oz', 'seconds', 'description']).optional(),
  condition: z.string().optional(),
  description: z.string().optional(),
});
export type SpecialEffect = z.infer<typeof SpecialEffectSchema>;

export const DropsFromSchema = z.object({
  normal: z.array(z.string()),
  boss: z.array(z.string()),
  invasion: z.array(z.string()),
  quest: z.array(z.string()),
  other: z.array(z.string()),
});
export type DropsFrom = z.infer<typeof DropsFromSchema>;

export const ItemSourceUrlsSchema = z.object({
  tibiaWiki: z.string().optional(),
  tibiaFandom: z.string().optional(),
  tibiaCom: z.string().optional(),
  image: z.string().optional(),
});

export const ItemSourcesSchema = z.object({
  primary: ItemDataSourceSchema,
  urls: ItemSourceUrlsSchema,
  lastImportedAt: z.string().optional(),
  sourceRevision: z.string().nullable().optional(),
  confidence: SourceConfidenceSchema,
});

export const ItemAssetsSchema = z.object({
  imagePath: z.string(),
  spriteId: z.string().optional(),
});

export const ItemMetadataSchema = z.object({
  versionAdded: z.string().optional(),
  dateAdded: z.string().optional(),
  notes: z.array(z.string()).optional(),
  tags: z.array(z.string()),
  dataQuality: DataQualitySchema,
});

const ItemBaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  kind: ItemKindSchema,
  level: z.number().nullable(),
  vocations: z.array(VocationSchema),
  weight: z.number(),
  marketable: z.boolean().nullable(),
  imbuementSlots: z.number(),
  classification: z.number().nullable(),
  maxTier: z.number().nullable(),
  bonuses: z.record(z.string(), z.number()),
  protections: z.record(z.string(), z.number()),
  specialEffects: z.array(SpecialEffectSchema),
  dropsFrom: DropsFromSchema,
  sources: ItemSourcesSchema,
  assets: ItemAssetsSchema,
  metadata: ItemMetadataSchema,
});

export const ArmorItemSchema = ItemBaseSchema.extend({
  kind: z.literal('armor'),
  armor: z.object({
    slot: z.enum(['Helmet', 'Armor', 'Legs', 'Boots', 'Shield', 'Spellbook']),
    arm: z.number().nullable(),
    def: z.number().nullable(),
    twoHanded: z.literal(false),
  }),
});
export type ArmorItem = z.infer<typeof ArmorItemSchema>;

export const WeaponItemSchema = ItemBaseSchema.extend({
  kind: z.literal('weapon'),
  weapon: z.object({
    group: z.enum([
      'Sword',
      'Axe',
      'Club',
      'Bow',
      'Crossbow',
      'Wand',
      'Rod',
      'Throwing',
      'Ammunition',
    ]),
    hands: z.enum(['OneHanded', 'TwoHanded']),
    attack: z.number().nullable(),
    defense: z.number().nullable(),
    defenseModifier: z.number().nullable(),
    range: z.number().nullable(),
    hitPercent: z.number().nullable(),
    damageType: z.enum([
      'Physical',
      'Fire',
      'Earth',
      'Energy',
      'Ice',
      'Holy',
      'Death',
      'Healing',
      'Mixed',
    ]),
    elementDamage: z.record(z.string(), z.number()).optional(),
    damageRange: z.object({
      average: z.number(),
      min: z.number(),
      max: z.number(),
      raw: z.string(),
    }).optional(),
    requiredAmmoType: z.enum(['Arrow', 'Bolt']).nullable().optional(),
    consumesAmmo: z.boolean(),
    charges: z.number().nullable().optional(),
  }),
});
export type WeaponItem = z.infer<typeof WeaponItemSchema>;

export const QuiverItemSchema = ItemBaseSchema.extend({
  kind: z.literal('quiver'),
  quiver: z.object({
    volume: z.number(),
    acceptedAmmoTypes: z.array(z.enum(['Arrow', 'Bolt'])),
    equipSlots: z.array(z.enum(['ShieldHand', 'ExtraSlot'])),
    canUseWithTwoHandedDistanceWeapon: z.boolean(),
    containerOnlyForAmmunition: z.boolean(),
  }),
});
export type QuiverItem = z.infer<typeof QuiverItemSchema>;

export const ExtraSlotItemSchema = ItemBaseSchema.extend({
  kind: z.literal('extra-slot'),
  extraSlot: z.object({
    subtype: z.enum([
      'Trinket',
      'LightSource',
      'Ammunition',
      'Quiver',
      'Tool',
      'Decorative',
      'Other',
    ]),
    providesLight: z.boolean(),
    lightColor: z.string().nullable().optional(),
    lightRadius: z.number().nullable().optional(),
    ammoType: z.enum(['Arrow', 'Bolt']).nullable().optional(),
    attack: z.number().nullable().optional(),
    charges: z.number().nullable().optional(),
    durationSeconds: z.number().nullable().optional(),
    consumable: z.boolean(),
  }),
});
export type ExtraSlotItem = z.infer<typeof ExtraSlotItemSchema>;

export const TibiaItemSchema = z.discriminatedUnion('kind', [
  ArmorItemSchema,
  WeaponItemSchema,
  QuiverItemSchema,
  ExtraSlotItemSchema,
]);
export type TibiaItem = z.infer<typeof TibiaItemSchema>;
