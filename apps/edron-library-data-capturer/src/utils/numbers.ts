function sanitizeNumeric(value: string): string {
  return value
    .replace(/,/g, '.')
    .replace(/[^0-9.+-]/g, ' ')
    .trim()
    .split(/\s+/)
    .find((token) => /[0-9]/.test(token)) ?? '';
}

export function parseNullableNumber(value: string | undefined): number | null {
  if (!value) {
    return null;
  }

  const sanitized = sanitizeNumeric(value);
  if (!sanitized) {
    return null;
  }

  const parsed = Number.parseFloat(sanitized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function parseInteger(value: string | undefined): number | null {
  const parsed = parseNullableNumber(value);
  if (parsed === null) {
    return null;
  }

  return Number.isInteger(parsed) ? parsed : Math.trunc(parsed);
}

export function parseWeightOz(value: string | undefined): number {
  return parseNullableNumber(value) ?? 0;
}
