import assert from 'node:assert/strict';
import test from 'node:test';

import { parseBonuses } from './attributes-parser.js';

test('parseBonuses reads skill bonuses from item attributes instead of weapon classification fields', () => {
  const bonuses = parseBonuses({
    name: 'Amber Greataxe',
    actualname: 'amber greataxe',
    primarytype: 'Axe Weapons',
    weapontype: 'Axe',
    attack: '',
    earth_attack: '50',
    attrib: 'axe fighting +3',
  });

  assert.deepEqual(bonuses, { Axe: 3 });
});

test('parseBonuses ignores weapon type when no attribute bonus exists', () => {
  const bonuses = parseBonuses({
    primarytype: 'Axe Weapons',
    weapontype: 'Axe',
    attack: '44',
    defense: '24',
  });

  assert.deepEqual(bonuses, {});
});
