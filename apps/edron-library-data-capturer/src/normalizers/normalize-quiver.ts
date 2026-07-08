import path from 'node:path';
import { CaptureCategory } from '../config/categories.js';
import { DOWNLOAD_IMAGES } from '../config/sources.js';
import { parseBonuses, parseProtections } from '../parsers/attributes-parser.js';
import { parseDrops } from '../parsers/drops-parser.js';
import { RawCapturedItem } from '../parsers/item-page-parser.js';
import { parseInteger, parseWeightOz } from '../utils/numbers.js';
import { slugifyItemName } from '../utils/slugify.js';
import { normalizeWhitespace, stripWikiMarkup } from '../utils/strings.js';
import { QuiverItem, Vocation } from '../validation/tibia-item.schema.js';

const LEVEL_KEYS = ['level', 'requiredlevel', 'required level', 'levelrequired', 'level required', 'lvl'];
const VOCATION_KEYS = ['vocation', 'vocations', 'profession', 'vocrequired', 'voc required', 'vocationrequired', 'vocation required'];
const WEIGHT_KEYS = ['weight', 'weight oz'];
const MARKETABLE_KEYS = ['marketable', 'tradeable', 'tradable'];
const CLASSIFICATION_KEYS = ['classification', 'tier', 'class', 'upgradeclass'];
const MAX_TIER_KEYS = ['maxtier', 'max tier'];
const VOLUME_KEYS = ['volume', 'capacity'];

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

export function normalizeQuiverItem(
  raw: RawCapturedItem,
  _category: CaptureCategory,
  importedAt: string,
): QuiverItem {
  const id = slugifyItemName(raw.title);
  const imageExtension = getImageExtension(raw.imageFileName, raw.imageUrl);
  const imagePath =
    DOWNLOAD_IMAGES && imageExtension ? `/assets/images/items/${id}.${imageExtension}` : '';

  return {
    id,
    name: normalizeWhitespace(raw.title),
    kind: 'quiver',
    level: parseInteger(getField(raw.rawFields, LEVEL_KEYS)),
    vocations: parseVocations(getField(raw.rawFields, VOCATION_KEYS)),
    weight: parseWeightOz(getField(raw.rawFields, WEIGHT_KEYS)),
    marketable: parseMarketable(getField(raw.rawFields, MARKETABLE_KEYS)),
    imbuementSlots: 0,
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
      tags: ['quiver', ...id.split('-')],
      dataQuality: imagePath ? 'complete' : 'partial',
    },
    quiver: {
      volume: parseInteger(getField(raw.rawFields, VOLUME_KEYS)) ?? 0,
      acceptedAmmoTypes: ['Arrow', 'Bolt'],
      equipSlots: ['ShieldHand', 'ExtraSlot'],
      canUseWithTwoHandedDistanceWeapon: true,
      containerOnlyForAmmunition: true,
    },
  };
}
