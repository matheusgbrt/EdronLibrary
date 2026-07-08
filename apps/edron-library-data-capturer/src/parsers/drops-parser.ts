import { DropsFrom } from '../validation/tibia-item.schema.js';
import { splitCommaList, stripWikiMarkup } from '../utils/strings.js';

const DROP_KEYS = ['droppedby', 'dropped by', 'dropped', 'loot', 'looted from'];

function extractDroppedByTemplateValues(value: string): string[] {
  const match = value.match(/\{\{\s*Dropped By\s*\|([\s\S]*?)\}\}/i);
  if (!match?.[1]) {
    return [];
  }

  return match[1]
    .split('|')
    .map((part) => stripWikiMarkup(part))
    .map((part) => part.trim())
    .filter(Boolean);
}

export function parseDrops(rawFields: Record<string, string>): DropsFrom {
  const drops: string[] = [];

  for (const [key, value] of Object.entries(rawFields)) {
    if (!DROP_KEYS.includes(key.trim().toLowerCase())) {
      continue;
    }

    const templateValues = extractDroppedByTemplateValues(value);
    if (templateValues.length > 0) {
      drops.push(...templateValues);
      continue;
    }

    drops.push(...splitCommaList(value));
  }

  return {
    normal: Array.from(new Set(drops)),
    boss: [],
    invasion: [],
    quest: [],
    other: [],
  };
}
