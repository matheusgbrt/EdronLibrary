import assert from 'node:assert/strict';
import test from 'node:test';

import { CaptureCategory } from '../config/categories.js';
import { RawCapturedItem } from '../parsers/item-page-parser.js';
import { normalizeWeaponItem } from './normalize-weapon.js';

const importedAt = '2026-07-08T00:00:00.000Z';

function rawWeapon(rawFields: Record<string, string>): RawCapturedItem {
  return {
    source: 'tibiafandom',
    sourceUrl: 'https://tibia.fandom.com/wiki/Amber_Bow',
    title: 'Amber Bow',
    revisionId: 1,
    rawFields,
    rawTextSections: {},
    categories: [],
  };
}

test('normalizeWeaponItem treats ranged atk_mod as attack and keeps hit percent', () => {
  const category: CaptureCategory = {
    key: 'bows',
    kind: 'weapon',
    weaponGroup: 'Bow',
    wikiCategoryTitles: ['Category:Bows'],
  };

  const item = normalizeWeaponItem(
    rawWeapon({
      level: '330',
      vocation: 'Paladins',
      weight: '37.00',
      imbuements: '3',
      classification: '4',
      range: '6',
      atk_mod: '7',
      hit_mod: '6',
      attrib: 'distance fighting +3',
      protection: 'energy +5%',
    }),
    category,
    importedAt,
  );

  assert.equal(item.weapon.attack, 7);
  assert.equal(item.weapon.defenseModifier, null);
  assert.equal(item.weapon.hitPercent, 6);
  assert.equal(item.weapon.range, 6);
});
