import { slugifyItemName } from '../utils/slugify.js';

const IMAGE_EXTENSIONS = ['.gif', '.png', '.jpg', '.jpeg', '.webp'];
const NOISE_PATTERNS = ['icon', 'gif-button', 'navbar', 'wiki', 'logo', 'flag', 'map'];

function hasImageExtension(value: string): boolean {
  const lower = value.toLowerCase();
  return IMAGE_EXTENSIONS.some((extension) => lower.endsWith(extension));
}

export function chooseBestItemImage(
  images: string[],
  itemTitle: string,
): string | undefined {
  const titleSlug = slugifyItemName(itemTitle);
  const plausible = images.filter((image) => {
    const lower = image.toLowerCase();
    return hasImageExtension(lower) && !NOISE_PATTERNS.some((pattern) => lower.includes(pattern));
  });

  const bestMatch = plausible.find((image) =>
    slugifyItemName(image.replace(/^File:/, '').replace(/\.[^.]+$/, '')).includes(titleSlug),
  );

  return bestMatch ?? plausible[0];
}
