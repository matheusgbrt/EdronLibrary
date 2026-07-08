import path from 'node:path';
import { CaptureCategory } from '../config/categories.js';
import { DOWNLOAD_IMAGES } from '../config/sources.js';
import { parseBonuses, parseProtections } from '../parsers/attributes-parser.js';
import { parseDrops } from '../parsers/drops-parser.js';
import { RawCapturedItem } from '../parsers/item-page-parser.js';
import { parseInteger, parseNullableNumber, parseWeightOz } from '../utils/numbers.js';
import { slugifyItemName } from '../utils/slugify.js';
import { normalizeWhitespace, stripWikiMarkup } from '../utils/strings.js';
import { WeaponItem, Vocation } from '../validation/tibia-item.schema.js';

const LEVEL_KEYS = [
  'level',
  'requiredlevel',
  'required level',
  'levelrequired',
  'level required',
  'lvl',
];
const VOCATION_KEYS = [
  'vocation',
  'vocations',
  'profession',
  'vocrequired',
  'voc required',
  'vocationrequired',
  'vocation required',
];
const WEIGHT_KEYS = ['weight', 'weight oz'];
const MARKETABLE_KEYS = ['marketable', 'tradeable', 'tradable'];
const IMBUEMENT_KEYS = ['imbueslots', 'imbuements', 'imbuement slots', 'slots'];
const CLASSIFICATION_KEYS = ['classification', 'tier', 'class', 'upgradeclass'];
const MAX_TIER_KEYS = ['maxtier', 'max tier'];
const ATTACK_KEYS = ['attack', 'atk', 'attackvalue'];
const RANGED_ATTACK_MODIFIER_KEYS = ['atk_mod'];
const DEFENSE_KEYS = ['defense', 'def'];
const DEFENSE_MODIFIER_KEYS = ['defensemod', 'defense modifier', 'defense_mod', 'def_mod', 'atk_mod'];
const RANGE_KEYS = ['range'];
const HIT_PERCENT_KEYS = ['hit_mod', 'hit percent', 'hitchance', 'hit chance'];
const CHARGE_KEYS = ['charges'];
const DAMAGE_TYPE_KEYS = ['damagetype', 'damage type'];
const DAMAGE_RANGE_KEYS = ['damagerange', 'damage range'];
const DAMAGE_FIELD_MAP = {
  Energy: ['energy_attack'],
  Fire: ['fire_attack'],
  Earth: ['earth_attack', 'poison_attack'],
  Ice: ['ice_attack'],
  Holy: ['holy_attack'],
  Death: ['death_attack'],
} as const;

function getField(rawFields: Record<string, string>, keys: readonly string[]): string | undefined {
  const normalizedEntries = Object.entries(rawFields).map(([key, value]) => [
    key.trim().toLowerCase(),
    value,
  ] as const);

  for (const targetKey of keys) {
    const match = normalizedEntries.find(([key]) => key === targetKey);
    if (match) {
      return match[1];
    }
  }

  return undefined;
}

function parseMarketable(value: string | undefined): boolean | null {
  if (!value) {
    return null;
  }

  const normalized = stripWikiMarkup(value).toLowerCase();
  if (['yes', 'true', 'y'].includes(normalized)) {
    return true;
  }

  if (['no', 'false', 'n'].includes(normalized)) {
    return false;
  }

  return null;
}

function parseImbuementSlots(value: string | undefined): number {
  return parseInteger(value) ?? 0;
}

function parseVocations(value: string | undefined): Vocation[] {
  if (!value) {
    return ['None'];
  }

  const normalized = stripWikiMarkup(value).toLowerCase();
  if (!normalized || normalized.includes('all vocation') || normalized === 'all') {
    return ['None'];
  }

  const matches: Vocation[] = [];
  const map: Array<[Vocation, RegExp]> = [
    ['Knight', /\bknights?\b/i],
    ['Paladin', /\bpaladins?\b/i],
    ['Sorcerer', /\bsorcerers?\b/i],
    ['Druid', /\bdruids?\b/i],
    ['Monk', /\bmonks?\b/i],
  ];

  for (const [vocation, pattern] of map) {
    if (pattern.test(normalized)) {
      matches.push(vocation);
    }
  }

  return matches.length > 0 ? matches : ['None'];
}

function getImageExtension(fileName: string | undefined, imageUrl: string | undefined): string | null {
  const candidate = fileName ?? imageUrl;
  if (!candidate) {
    return null;
  }

  const extension = path.extname(candidate).replace('.', '').toLowerCase();
  return extension || null;
}

function parseHands(value: string | undefined): 'OneHanded' | 'TwoHanded' {
  const normalized = stripWikiMarkup(value ?? '').toLowerCase();
  return normalized.includes('two') ? 'TwoHanded' : 'OneHanded';
}

function parseDamageType(value: string | undefined): WeaponItem['weapon']['damageType'] | null {
  const normalized = stripWikiMarkup(value ?? '').toLowerCase();
  const damageTypes: WeaponItem['weapon']['damageType'][] = [
    'Physical',
    'Fire',
    'Earth',
    'Energy',
    'Ice',
    'Holy',
    'Death',
    'Healing',
    'Mixed',
  ];

  return damageTypes.find((type) => normalized.includes(type.toLowerCase())) ?? null;
}

function parseDamageRange(value: string | undefined): WeaponItem['weapon']['damageRange'] | undefined {
  const raw = stripWikiMarkup(value ?? '').trim();
  if (!raw) {
    return undefined;
  }

  const averageRangeMatch = raw.match(/^(\d+(?:\.\d+)?)\s*\(\s*(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*\)$/);
  if (averageRangeMatch?.[1] && averageRangeMatch[2] && averageRangeMatch[3]) {
    return {
      average: Number.parseFloat(averageRangeMatch[1]),
      min: Number.parseFloat(averageRangeMatch[2]),
      max: Number.parseFloat(averageRangeMatch[3]),
      raw,
    };
  }

  const minMaxMatch = raw.match(/^(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)$/);
  if (!minMaxMatch?.[1] || !minMaxMatch[2]) {
    return undefined;
  }

  const min = Number.parseFloat(minMaxMatch[1]);
  const max = Number.parseFloat(minMaxMatch[2]);

  return {
    average: (min + max) / 2,
    min,
    max,
    raw,
  };
}

function inferWeaponDamageType(
  rawFields: Record<string, string>,
): {
  damageType: WeaponItem['weapon']['damageType'];
  elementDamage?: Partial<Record<'Physical' | 'Fire' | 'Earth' | 'Energy' | 'Ice' | 'Holy' | 'Death', number>>;
} {
  const elementDamage: Partial<Record<'Physical' | 'Fire' | 'Earth' | 'Energy' | 'Ice' | 'Holy' | 'Death', number>> = {};

  for (const [element, keys] of Object.entries(DAMAGE_FIELD_MAP) as Array<
    [keyof typeof DAMAGE_FIELD_MAP, readonly string[]]
  >) {
    const value = parseInteger(getField(rawFields, keys));
    if (value !== null) {
      elementDamage[element] = value;
    }
  }

  const firstElement = Object.keys(elementDamage)[0] as keyof typeof elementDamage | undefined;
  if (firstElement) {
    return {
      damageType: firstElement,
      elementDamage,
    };
  }

  const explicitDamageType = parseDamageType(getField(rawFields, DAMAGE_TYPE_KEYS));
  if (explicitDamageType) {
    return {
      damageType: explicitDamageType,
    };
  }

  return {
    damageType: 'Physical',
  };
}

function inferRequiredAmmoType(
  group: NonNullable<CaptureCategory['weaponGroup']>,
): 'Arrow' | 'Bolt' | null | undefined {
  if (group === 'Bow') {
    return 'Arrow';
  }

  if (group === 'Crossbow') {
    return 'Bolt';
  }

  return undefined;
}

function inferConsumesAmmo(group: NonNullable<CaptureCategory['weaponGroup']>): boolean {
  return group === 'Bow' || group === 'Crossbow' || group === 'Throwing';
}

function isRangedAttackModifierGroup(group: NonNullable<CaptureCategory['weaponGroup']>): boolean {
  return group === 'Bow' || group === 'Crossbow' || group === 'Throwing';
}

function inferWeaponDataQuality(item: WeaponItem, hasTemplate: boolean): WeaponItem['metadata']['dataQuality'] {
  const criticalMissing =
    !hasTemplate ||
    item.sources.urls.tibiaFandom === undefined ||
    (item.weapon.attack === null && item.weapon.defense === null);

  if (criticalMissing) {
    return 'needs-review';
  }

  if (item.assets.imagePath && (item.weapon.attack !== null || item.weapon.defense !== null)) {
    return 'complete';
  }

  return 'partial';
}

export function normalizeWeaponItem(
  raw: RawCapturedItem,
  category: CaptureCategory,
  importedAt: string,
): WeaponItem {
  const group = category.weaponGroup;
  if (!group) {
    throw new Error(`Unsupported weapon category: ${category.key}`);
  }

  const id = slugifyItemName(raw.title);
  const level = parseInteger(getField(raw.rawFields, LEVEL_KEYS));
  const weight = parseWeightOz(getField(raw.rawFields, WEIGHT_KEYS));
  const imageExtension = getImageExtension(raw.imageFileName, raw.imageUrl);
  const imagePath =
    DOWNLOAD_IMAGES && imageExtension ? `/assets/images/items/${id}.${imageExtension}` : '';
  const damageInfo = inferWeaponDamageType(raw.rawFields);
  const damageRange = parseDamageRange(getField(raw.rawFields, DAMAGE_RANGE_KEYS));
  const attack =
    parseInteger(getField(raw.rawFields, ATTACK_KEYS)) ??
    (isRangedAttackModifierGroup(group)
      ? parseInteger(getField(raw.rawFields, RANGED_ATTACK_MODIFIER_KEYS))
      : null);
  const defenseModifier = isRangedAttackModifierGroup(group)
    ? null
    : parseInteger(getField(raw.rawFields, DEFENSE_MODIFIER_KEYS));

  const item: WeaponItem = {
    id,
    name: normalizeWhitespace(raw.title),
    kind: 'weapon',
    level,
    vocations: parseVocations(getField(raw.rawFields, VOCATION_KEYS)),
    weight,
    marketable: parseMarketable(getField(raw.rawFields, MARKETABLE_KEYS)),
    imbuementSlots: parseImbuementSlots(getField(raw.rawFields, IMBUEMENT_KEYS)),
    classification: parseInteger(getField(raw.rawFields, CLASSIFICATION_KEYS)),
    maxTier: parseInteger(getField(raw.rawFields, MAX_TIER_KEYS)),
    bonuses: parseBonuses(raw.rawFields),
    protections: parseProtections(raw.rawFields),
    specialEffects: [],
    dropsFrom: parseDrops(raw.rawFields),
    sources: {
      primary: 'tibiafandom',
      urls: {
        tibiaFandom: raw.sourceUrl,
        image: raw.imageUrl,
      },
      lastImportedAt: importedAt,
      sourceRevision: raw.revisionId !== undefined ? String(raw.revisionId) : null,
      confidence: 'medium',
    },
    assets: {
      imagePath,
    },
    metadata: {
      tags: [category.key, 'weapon', group.toLowerCase(), ...id.split('-')],
      dataQuality: 'partial',
    },
    weapon: {
      group,
      hands: parseHands(getField(raw.rawFields, ['hands'])),
      attack,
      defense: parseInteger(getField(raw.rawFields, DEFENSE_KEYS)),
      defenseModifier,
      range: parseInteger(getField(raw.rawFields, RANGE_KEYS)),
      hitPercent: parseNullableNumber(getField(raw.rawFields, HIT_PERCENT_KEYS)),
      damageType: damageInfo.damageType,
      ...(damageInfo.elementDamage ? { elementDamage: damageInfo.elementDamage } : {}),
      ...(damageRange ? { damageRange } : {}),
      ...(inferRequiredAmmoType(group) !== undefined
        ? { requiredAmmoType: inferRequiredAmmoType(group) }
        : {}),
      consumesAmmo: inferConsumesAmmo(group),
      charges: parseInteger(getField(raw.rawFields, CHARGE_KEYS)),
    },
  };

  item.metadata.dataQuality = inferWeaponDataQuality(item, Object.keys(raw.rawFields).length > 0);
  return item;
}
