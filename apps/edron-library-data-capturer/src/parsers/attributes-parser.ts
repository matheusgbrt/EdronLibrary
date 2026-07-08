import { Element, SkillBonus } from '../validation/tibia-item.schema.js';

const ELEMENTS: Array<{ key: Element; pattern: RegExp }> = [
  { key: 'Physical', pattern: /physical/i },
  { key: 'Fire', pattern: /fire/i },
  { key: 'Earth', pattern: /earth|poison/i },
  { key: 'Energy', pattern: /energy/i },
  { key: 'Ice', pattern: /ice/i },
  { key: 'Holy', pattern: /holy/i },
  { key: 'Death', pattern: /death/i },
];

const SKILLS: Array<{ key: SkillBonus; pattern: RegExp }> = [
  { key: 'Axe', pattern: /axe(?:\s+fighting)?/i },
  { key: 'Club', pattern: /club(?:\s+fighting)?/i },
  { key: 'Sword', pattern: /sword(?:\s+fighting)?/i },
  { key: 'Distance', pattern: /distance(?:\s+fighting)?/i },
  { key: 'Shielding', pattern: /shielding/i },
  { key: 'MagicLevel', pattern: /magic\s+level/i },
  { key: 'Fist', pattern: /fist(?:\s+fighting)?/i },
];

function collectValues(rawFields: Record<string, string>): string[] {
  return Object.values(rawFields);
}

function collectBonusValues(rawFields: Record<string, string>): string[] {
  const bonusFieldPattern = /^(attrib|attributes?|bonus|bonuses|skillbonus|skill bonus|augments?)$/i;

  return Object.entries(rawFields)
    .filter(([key]) => bonusFieldPattern.test(key.trim()))
    .map(([, value]) => value);
}

function parseSignedInteger(value: string): number | null {
  const match = value.match(/[+-]?\d+/);
  if (!match) {
    return null;
  }

  return Number.parseInt(match[0], 10);
}

export function parseProtections(
  rawFields: Record<string, string>,
): Partial<Record<Element, number>> {
  const joined = collectValues(rawFields).join('\n');
  const protections: Partial<Record<Element, number>> = {};

  for (const element of ELEMENTS) {
    const source = `(?:${element.pattern.source})`;
    const patterns = [
      new RegExp(`${source}\\s*[:+]?\\s*([+-]?\\d+)\\s*%`, 'i'),
      new RegExp(`([+-]?\\d+)\\s*%\\s*${source}`, 'i'),
    ];

    for (const pattern of patterns) {
      const match = joined.match(pattern);
      if (!match?.[1]) {
        continue;
      }

      protections[element.key] = Number.parseInt(match[1], 10);
      break;
    }
  }

  return protections;
}

export function parseBonuses(
  rawFields: Record<string, string>,
): Partial<Record<SkillBonus, number>> {
  const joined = collectBonusValues(rawFields).join('\n');
  const bonuses: Partial<Record<SkillBonus, number>> = {};

  for (const skill of SKILLS) {
    const source = `(?:${skill.pattern.source})`;
    const patterns = [
      new RegExp(`${source}\\s*[:+]?\\s*([+-]?\\d+)`, 'i'),
      new RegExp(`([+-]?\\d+)\\s*${source}`, 'i'),
    ];

    for (const pattern of patterns) {
      const match = joined.match(pattern);
      const value = match?.[1] ? parseSignedInteger(match[1]) : null;
      if (value === null) {
        continue;
      }

      bonuses[skill.key] = value;
      break;
    }
  }

  return bonuses;
}
