export function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

export function stripWikiMarkup(value: string): string {
  return normalizeWhitespace(
    value
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/\[\[(?:[^|\]]*\|)?([^\]]+)\]\]/g, '$1')
      .replace(/\{\{[^{}]*\|([^{}|]+)\}\}/g, '$1')
      .replace(/\{\{[^{}]+\}\}/g, ' ')
      .replace(/'''?/g, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/gi, ' '),
  );
}

export function splitCommaList(value: string | undefined): string[] {
  if (!value) {
    return [];
  }

  return stripWikiMarkup(value)
    .split(/,|;|\/|\n/)
    .map((part) => normalizeWhitespace(part))
    .filter(Boolean);
}
