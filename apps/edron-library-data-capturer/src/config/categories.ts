export interface CaptureCategory {
  key: string;
  kind: 'armor' | 'weapon' | 'quiver' | 'extra-slot';
  subtype?: string;
  armorSlot?: 'Helmet' | 'Armor' | 'Legs' | 'Boots' | 'Shield' | 'Spellbook';
  weaponGroup?:
    | 'Sword'
    | 'Axe'
    | 'Club'
    | 'Bow'
    | 'Crossbow'
    | 'Wand'
    | 'Rod'
    | 'Throwing'
    | 'Ammunition';
  extraSlotSubtype?: 'Trinket' | 'LightSource' | 'Tool' | 'Other';
  wikiCategoryTitles: string[];
  wikiListPages?: string[];
}

export interface CategoryEligibilityContext {
  title: string;
  rawFields: Record<string, string>;
}

function getField(rawFields: Record<string, string>, key: string): string {
  return rawFields[key]?.trim() ?? '';
}

function normalized(value: string): string {
  return value.trim().toLowerCase();
}

function matchesAny(value: string, expected: string[]): boolean {
  const current = normalized(value);
  return expected.map(normalized).includes(current);
}

function hasWeaponStats(rawFields: Record<string, string>): boolean {
  return (
    getField(rawFields, 'attack') !== '' ||
    getField(rawFields, 'energy_attack') !== '' ||
    getField(rawFields, 'fire_attack') !== '' ||
    getField(rawFields, 'earth_attack') !== '' ||
    getField(rawFields, 'ice_attack') !== '' ||
    getField(rawFields, 'death_attack') !== '' ||
    getField(rawFields, 'holy_attack') !== ''
  );
}

function isArmorCandidate(
  category: CaptureCategory,
  { rawFields }: CategoryEligibilityContext,
): boolean {
  const objectClass = getField(rawFields, 'objectclass');
  const primaryType = getField(rawFields, 'primarytype');
  const slot = getField(rawFields, 'slot');

  const categoryTypeMap: Record<NonNullable<CaptureCategory['armorSlot']>, string[]> = {
    Helmet: ['Helmets'],
    Armor: ['Armors'],
    Legs: ['Legs'],
    Boots: ['Boots'],
    Shield: ['Shields'],
    Spellbook: ['Spellbooks'],
  };

  const slotMap: Record<NonNullable<CaptureCategory['armorSlot']>, string[]> = {
    Helmet: ['Head'],
    Armor: ['Body'],
    Legs: ['Leg', 'Legs'],
    Boots: ['Feet'],
    Shield: ['Shield', 'Shield Hand'],
    Spellbook: ['Shield', 'Shield Hand'],
  };

  const armorSlot = category.armorSlot;
  if (!armorSlot) {
    return false;
  }

  return (
    normalized(objectClass) === 'body equipment' &&
    matchesAny(primaryType, categoryTypeMap[armorSlot]) &&
    matchesAny(slot, slotMap[armorSlot])
  );
}

function isWeaponCandidate(
  category: CaptureCategory,
  { title, rawFields }: CategoryEligibilityContext,
): boolean {
  const objectClass = getField(rawFields, 'objectclass');
  const primaryType = getField(rawFields, 'primarytype');
  const slot = getField(rawFields, 'slot');
  const weaponType = getField(rawFields, 'weapontype');
  const group = category.weaponGroup;

  if (!group || title.includes('User:')) {
    return false;
  }

  const primaryTypeMap: Record<NonNullable<CaptureCategory['weaponGroup']>, string[]> = {
    Sword: ['Sword Weapons'],
    Axe: ['Axe Weapons'],
    Club: ['Club Weapons'],
    Bow: ['Distance Weapons'],
    Crossbow: ['Distance Weapons'],
    Wand: ['Wands'],
    Rod: ['Rods'],
    Throwing: ['Distance Weapons'],
    Ammunition: ['Ammunition'],
  };

  const weaponTypeMap: Partial<Record<NonNullable<CaptureCategory['weaponGroup']>, string[]>> = {
    Sword: ['Sword'],
    Axe: ['Axe'],
    Club: ['Club'],
  };

  const slotOk =
    group === 'Ammunition'
      ? slot === '' || matchesAny(slot, ['Ammo', 'Extra Slot', 'Shield Hand'])
      : matchesAny(slot, ['Weapon Hand', 'Two-Handed', 'Both Hands', 'Shield Hand']);

  const primaryTypeOk = matchesAny(primaryType, primaryTypeMap[group]);
  const weaponTypeOk =
    group === 'Bow' || group === 'Crossbow' || group === 'Throwing' || group === 'Ammunition'
      ? true
      : weaponTypeMap[group] !== undefined
        ? matchesAny(weaponType, weaponTypeMap[group] ?? [])
        : true;

  const objectClassOk = matchesAny(objectClass, ['Weapons', 'Body Equipment']);

  return objectClassOk && primaryTypeOk && slotOk && (weaponTypeOk || hasWeaponStats(rawFields));
}

function isQuiverCandidate({ rawFields }: CategoryEligibilityContext): boolean {
  return (
    normalized(getField(rawFields, 'objectclass')) === 'body equipment' &&
    matchesAny(getField(rawFields, 'primarytype'), ['Quivers']) &&
    matchesAny(getField(rawFields, 'slot'), ['Shield Hand'])
  );
}

function isExtraSlotCandidate(
  category: CaptureCategory,
  { rawFields }: CategoryEligibilityContext,
): boolean {
  const objectClass = getField(rawFields, 'objectclass');
  const primaryType = getField(rawFields, 'primarytype');
  const slot = getField(rawFields, 'slot');
  const subtype = category.extraSlotSubtype;

  if (!subtype) {
    return false;
  }

  if (subtype === 'LightSource') {
    return (
      matchesAny(objectClass, ['Tools and other Equipment', 'Body Equipment']) &&
      matchesAny(primaryType, ['Light Sources']) &&
      matchesAny(slot, ['Extra Slot'])
    );
  }

  if (subtype === 'Tool') {
    return (
      matchesAny(objectClass, ['Tools and other Equipment', 'Body Equipment']) &&
      matchesAny(primaryType, ['Tools']) &&
      (slot === '' || matchesAny(slot, ['Extra Slot', 'Hand']))
    );
  }

  if (subtype === 'Trinket') {
    return (
      normalized(objectClass) === 'body equipment' &&
      matchesAny(primaryType, ['Rings', 'Amulets and Necklaces']) &&
      matchesAny(slot, ['Finger', 'Neck'])
    );
  }

  return (
    normalized(objectClass) === 'body equipment' &&
    matchesAny(slot, ['Extra Slot']) &&
    matchesAny(primaryType, ['Others', 'Decorations', 'Decoration'])
  );
}

export function isCategoryCaptureEligible(
  category: CaptureCategory,
  context: CategoryEligibilityContext,
): boolean {
  if (category.kind === 'armor') {
    return isArmorCandidate(category, context);
  }

  if (category.kind === 'weapon') {
    return isWeaponCandidate(category, context);
  }

  if (category.kind === 'quiver') {
    return isQuiverCandidate(context);
  }

  if (category.kind === 'extra-slot') {
    return isExtraSlotCandidate(category, context);
  }

  return true;
}

export const CAPTURE_CATEGORIES: CaptureCategory[] = [
  {
    key: 'helmets',
    kind: 'armor',
    subtype: 'Helmet',
    armorSlot: 'Helmet',
    wikiCategoryTitles: ['Category:Helmets'],
  },
  {
    key: 'armors',
    kind: 'armor',
    subtype: 'Armor',
    armorSlot: 'Armor',
    wikiCategoryTitles: ['Category:Armors'],
  },
  {
    key: 'legs',
    kind: 'armor',
    subtype: 'Legs',
    armorSlot: 'Legs',
    wikiCategoryTitles: ['Category:Legs'],
  },
  {
    key: 'boots',
    kind: 'armor',
    subtype: 'Boots',
    armorSlot: 'Boots',
    wikiCategoryTitles: ['Category:Boots'],
  },
  {
    key: 'shields',
    kind: 'armor',
    subtype: 'Shield',
    armorSlot: 'Shield',
    wikiCategoryTitles: ['Category:Shields'],
  },
  {
    key: 'spellbooks',
    kind: 'armor',
    subtype: 'Spellbook',
    armorSlot: 'Spellbook',
    wikiCategoryTitles: ['Category:Spellbooks'],
  },
  {
    key: 'swords',
    kind: 'weapon',
    weaponGroup: 'Sword',
    wikiCategoryTitles: ['Category:Sword Weapons'],
  },
  {
    key: 'axes',
    kind: 'weapon',
    weaponGroup: 'Axe',
    wikiCategoryTitles: ['Category:Axe Weapons'],
  },
  {
    key: 'clubs',
    kind: 'weapon',
    weaponGroup: 'Club',
    wikiCategoryTitles: ['Category:Club Weapons'],
  },
  {
    key: 'bows',
    kind: 'weapon',
    weaponGroup: 'Bow',
    wikiCategoryTitles: ['Category:Bows'],
  },
  {
    key: 'crossbows',
    kind: 'weapon',
    weaponGroup: 'Crossbow',
    wikiCategoryTitles: ['Category:Crossbows'],
  },
  {
    key: 'wands',
    kind: 'weapon',
    weaponGroup: 'Wand',
    wikiCategoryTitles: ['Category:Wands'],
  },
  {
    key: 'rods',
    kind: 'weapon',
    weaponGroup: 'Rod',
    wikiCategoryTitles: ['Category:Rods'],
  },
  {
    key: 'throwing',
    kind: 'weapon',
    weaponGroup: 'Throwing',
    wikiCategoryTitles: ['Category:Throwing Weapons'],
  },
  {
    key: 'ammunition',
    kind: 'weapon',
    weaponGroup: 'Ammunition',
    wikiCategoryTitles: ['Category:Ammunition'],
  },
  {
    key: 'quivers',
    kind: 'quiver',
    wikiCategoryTitles: ['Category:Quivers'],
  },
  {
    key: 'trinkets',
    kind: 'extra-slot',
    extraSlotSubtype: 'Trinket',
    wikiCategoryTitles: ['Category:Rings', 'Category:Amulets and Necklaces'],
  },
  {
    key: 'light-sources',
    kind: 'extra-slot',
    extraSlotSubtype: 'LightSource',
    wikiCategoryTitles: ['Category:Light Sources'],
  },
  {
    key: 'tools',
    kind: 'extra-slot',
    extraSlotSubtype: 'Tool',
    wikiCategoryTitles: ['Category:Tools'],
  },
  {
    key: 'others',
    kind: 'extra-slot',
    extraSlotSubtype: 'Other',
    wikiCategoryTitles: ['Category:Others'],
  },
];
