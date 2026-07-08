import { CaptureCategory } from '../config/categories.js';
import { RawCapturedItem } from '../parsers/item-page-parser.js';
import { normalizeArmorItem } from './normalize-armor.js';
import { normalizeExtraSlotItem } from './normalize-extra-slot.js';
import { normalizeQuiverItem } from './normalize-quiver.js';
import { normalizeWeaponItem } from './normalize-weapon.js';
import { TibiaItem } from '../validation/tibia-item.schema.js';

export function normalizeCapturedItem(
  raw: RawCapturedItem,
  category: CaptureCategory,
  importedAt: string,
): TibiaItem {
  if (category.kind === 'armor') {
    return normalizeArmorItem(raw, category, importedAt);
  }

  if (category.kind === 'weapon') {
    return normalizeWeaponItem(raw, category, importedAt);
  }

  if (category.kind === 'quiver') {
    return normalizeQuiverItem(raw, category, importedAt);
  }

  if (category.kind === 'extra-slot') {
    return normalizeExtraSlotItem(raw, category, importedAt);
  }

  throw new Error(
    `Unsupported capture category: kind="${category.kind}" subtype="${category.subtype ?? 'n/a'}"`,
  );
}
