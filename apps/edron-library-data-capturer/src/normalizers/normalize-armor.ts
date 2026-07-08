import path from 'node:path';
import { CaptureCategory } from '../config/categories.js';
import { DOWNLOAD_IMAGES } from '../config/sources.js';
import { parseBonuses, parseProtections } from '../parsers/attributes-parser.js';
import { parseDrops } from '../parsers/drops-parser.js';
import { RawCapturedItem } from '../parsers/item-page-parser.js';
import { parseInteger, parseWeightOz } from '../utils/numbers.js';
import { slugifyItemName } from '../utils/slugify.js';
import { normalizeWhitespace, stripWikiMarkup } from '../utils/strings.js';
import { ArmorItem, Vocation } from '../validation/tibia-item.schema.js';

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
const ARMOR_KEYS = ['armor', 'arm'];
const DEFENSE_KEYS = ['defense', 'def'];

type DataQuality = ArmorItem['metadata']['dataQuality'];

function getField(rawFields: Record<string, string>, keys: string[]): string | undefined {
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

function inferDataQuality(
  item: ArmorItem,
  hasTemplate: boolean,
  category: CaptureCategory,
): DataQuality {
  const criticalMissing =
    !hasTemplate ||
    item.sources.urls.tibiaFandom === undefined ||
    item.vocations.length === 0;

  if (criticalMissing) {
    return 'needs-review';
  }

  if (category.subtype === 'Helmet') {
    if (item.assets.imagePath && item.armor.arm !== null) {
      return 'complete';
    }

    return 'partial';
  }

  if (item.assets.imagePath && item.level !== null && item.armor.def !== null) {
    return 'complete';
  }

  return 'partial';
}

function getImageExtension(fileName: string | undefined, imageUrl: string | undefined): string | null {
  const candidate = fileName ?? imageUrl;
  if (!candidate) {
    return null;
  }

  const extension = path.extname(candidate).replace('.', '').toLowerCase();
  return extension || null;
}

export function normalizeArmorItem(
  raw: RawCapturedItem,
  category: CaptureCategory,
  importedAt: string,
): ArmorItem {
  const armorSlot = category.armorSlot;
  if (!armorSlot) {
    throw new Error(`Unsupported armor subtype: ${category.subtype ?? 'unknown'}`);
  }

  const id = slugifyItemName(raw.title);
  const level = parseInteger(getField(raw.rawFields, LEVEL_KEYS));
  const weight = parseWeightOz(getField(raw.rawFields, WEIGHT_KEYS));
  const arm = parseInteger(getField(raw.rawFields, ARMOR_KEYS)) ?? 0;
  const def = parseInteger(getField(raw.rawFields, DEFENSE_KEYS));
  const imageExtension = getImageExtension(raw.imageFileName, raw.imageUrl);
  const imagePath =
    DOWNLOAD_IMAGES && imageExtension ? `/assets/images/items/${id}.${imageExtension}` : '';

  const item: ArmorItem = {
    id,
    name: normalizeWhitespace(raw.title),
    kind: 'armor',
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
      tags: ['armor', armorSlot.toLowerCase(), category.key, ...id.split('-')],
      dataQuality: 'partial',
    },
    armor: {
      slot: armorSlot,
      arm,
      def,
      twoHanded: false,
    },
  };

  item.metadata.dataQuality = inferDataQuality(
    item,
    Object.keys(raw.rawFields).length > 0,
    category,
  );
  return item;
}
