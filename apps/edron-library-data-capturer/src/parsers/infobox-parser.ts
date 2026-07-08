function normalizeTemplateName(value: string): string {
  return value.trim().replaceAll('_', ' ').toLowerCase();
}

export function extractTemplateBlock(
  wikitext: string,
  possibleTemplateNames: string[],
): string | null {
  const normalizedNames = new Set(possibleTemplateNames.map(normalizeTemplateName));

  for (let index = 0; index < wikitext.length - 1; index += 1) {
    if (wikitext[index] !== '{' || wikitext[index + 1] !== '{') {
      continue;
    }

    let depth = 0;
    let cursor = index;

    while (cursor < wikitext.length - 1) {
      if (wikitext[cursor] === '{' && wikitext[cursor + 1] === '{') {
        depth += 1;
        cursor += 2;
        continue;
      }

      if (wikitext[cursor] === '}' && wikitext[cursor + 1] === '}') {
        depth -= 1;
        cursor += 2;

        if (depth === 0) {
          const template = wikitext.slice(index, cursor);
          const inner = template.slice(2, -2);
          const header = inner.split('|', 1)[0] ?? '';

          if (normalizedNames.has(normalizeTemplateName(header))) {
            return template;
          }

          break;
        }

        continue;
      }

      cursor += 1;
    }
  }

  return null;
}

function splitTopLevelPipes(value: string): string[] {
  const segments: string[] = [];
  let depthCurly = 0;
  let depthSquare = 0;
  let current = '';

  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    const next = value[index + 1];

    if (char === '{' && next === '{') {
      depthCurly += 1;
      current += '{{';
      index += 1;
      continue;
    }

    if (char === '}' && next === '}') {
      depthCurly = Math.max(0, depthCurly - 1);
      current += '}}';
      index += 1;
      continue;
    }

    if (char === '[' && next === '[') {
      depthSquare += 1;
      current += '[[';
      index += 1;
      continue;
    }

    if (char === ']' && next === ']') {
      depthSquare = Math.max(0, depthSquare - 1);
      current += ']]';
      index += 1;
      continue;
    }

    if (char === '|' && depthCurly === 0 && depthSquare === 0) {
      segments.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  if (current) {
    segments.push(current);
  }

  return segments;
}

export function parseTemplateFields(template: string): Record<string, string> {
  const inner = template.startsWith('{{') && template.endsWith('}}')
    ? template.slice(2, -2)
    : template;
  const segments = splitTopLevelPipes(inner);
  const [, ...fieldSegments] = segments;
  const fields: Record<string, string> = {};

  for (const segment of fieldSegments) {
    const separatorIndex = segment.indexOf('=');
    if (separatorIndex === -1) {
      continue;
    }

    const rawKey = segment.slice(0, separatorIndex).trim();
    const rawValue = segment.slice(separatorIndex + 1).trim();

    if (!rawKey) {
      continue;
    }

    fields[rawKey] = rawValue;
  }

  return fields;
}
