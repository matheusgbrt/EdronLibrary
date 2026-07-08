import { readFile } from 'node:fs/promises';
import { MANUAL_OVERRIDES_PATH } from '../config/paths.js';
import { deepMerge } from '../utils/deep-merge.js';

export async function loadManualOverrides(): Promise<Record<string, unknown>> {
  try {
    const content = await readFile(MANUAL_OVERRIDES_PATH, 'utf8');
    const parsed = JSON.parse(content) as unknown;
    return typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

export function applyManualOverrides<T extends { id: string }>(
  items: T[],
  overrides: Record<string, unknown>,
): T[] {
  return items.map((item) => {
    const override = overrides[item.id];
    if (override === undefined) {
      return item;
    }

    return deepMerge(item, override);
  });
}
