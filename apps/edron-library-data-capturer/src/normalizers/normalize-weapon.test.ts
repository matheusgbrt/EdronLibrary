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

test('normalizeWeaponItem keeps wand damage type and damage range estimate', () => {
  const category: CaptureCategory = {
    key: 'wands',
    kind: 'weapon',
    weaponGroup: 'Wand',
    wikiCategoryTitles: ['Category:Wands'],
  };

  const item = normalizeWeaponItem(
    {
      ...rawWeapon({
        levelrequired: '13',
        vocrequired: 'sorcerers',
        weight: '21.00',
        imbueslots: '2',
        upgradeclass: '1',
        range: '4',
        manacost: '+3 mana per attack',
        damagetype: 'Fire',
        damagerange: '19 (13-25)',
      }),
      title: 'Wand of Dragonbreath',
      sourceUrl: 'https://tibia.fandom.com/wiki/Wand_of_Dragonbreath',
      revisionId: 1190963,
    },
    category,
    importedAt,
  );

  assert.equal(item.weapon.damageType, 'Fire');
  assert.deepEqual(item.weapon.damageRange, {
    average: 19,
    min: 13,
    max: 25,
    raw: '19 (13-25)',
  });
});
