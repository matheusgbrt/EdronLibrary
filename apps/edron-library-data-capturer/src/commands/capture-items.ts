import { readFile } from 'node:fs/promises';
import pLimit from 'p-limit';
import { MediaWikiClient } from '../clients/mediawiki-client.js';
import {
  CAPTURE_CATEGORIES,
  CaptureCategory,
  isCategoryCaptureEligible,
} from '../config/categories.js';
import {
  CAPTURE_ERRORS_PATH,
  IGNORED_PAGES_PATH,
  RAW_CAPTURED_ITEMS_PATH,
  RAW_PAGES_DIR,
} from '../config/paths.js';
import { REQUEST_CONCURRENCY, TIBIA_FANDOM_SOURCE } from '../config/sources.js';
import { fetchCategoryMembers } from '../fetchers/category-fetcher.js';
import { fetchImageInfo } from '../fetchers/image-fetcher.js';
import { fetchParsedPage } from '../fetchers/page-fetcher.js';
import { CapturedItemRecord, parseItemPage } from '../parsers/item-page-parser.js';
import { slugifyItemName } from '../utils/slugify.js';
import { writeJsonFile } from '../writers/write-json.js';

interface CaptureError {
  title: string;
  stage: 'category' | 'page' | 'parse' | 'image';
  error: string;
}

type IgnoredPages = Array<string | number>;

async function loadIgnoredPages(): Promise<Set<string>> {
  try {
    const content = await readFile(IGNORED_PAGES_PATH, 'utf8');
    const parsed = JSON.parse(content) as IgnoredPages;
    return new Set(parsed.map((value) => String(value)));
  } catch {
    return new Set<string>();
  }
}

async function loadCachedRawPage(title: string): Promise<CapturedItemRecord['item'] | null> {
  const slug = slugifyItemName(title);
  const rawPath = `${RAW_PAGES_DIR}/${slug}.json`;

  try {
    const content = await readFile(rawPath, 'utf8');
    return JSON.parse(content) as CapturedItemRecord['item'];
  } catch {
    return null;
  }
}

async function saveRawPage(rawItem: CapturedItemRecord['item']): Promise<void> {
  const slug = slugifyItemName(rawItem.title);
  const rawPath = `${RAW_PAGES_DIR}/${slug}.json`;
  await writeJsonFile(rawPath, rawItem);
}

function isEligibleCapturedItem(
  category: CaptureCategory,
  item: CapturedItemRecord['item'],
): boolean {
  return isCategoryCaptureEligible(category, {
    title: item.title,
    rawFields: item.rawFields,
  });
}

async function fetchCategoryTitles(
  client: MediaWikiClient,
  category: CaptureCategory,
  errors: CaptureError[],
): Promise<string[]> {
  const titles = new Set<string>();

  for (const wikiCategoryTitle of category.wikiCategoryTitles) {
    try {
      const members = await fetchCategoryMembers(client, wikiCategoryTitle);
      for (const member of members) {
        titles.add(member);
      }
    } catch (error) {
      errors.push({
        title: wikiCategoryTitle,
        stage: 'category',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return Array.from(titles);
}

function categoryLandingTitles(category: CaptureCategory): Set<string> {
  return new Set(
    category.wikiCategoryTitles
      .map((title) => title.replace(/^Category:/i, '').trim())
      .filter(Boolean),
  );
}

async function main(): Promise<void> {
  const importedAt = new Date().toISOString();
  const client = new MediaWikiClient(TIBIA_FANDOM_SOURCE);
  const ignoredPages = await loadIgnoredPages();
  const limit = pLimit(REQUEST_CONCURRENCY);
  const captureErrors: CaptureError[] = [];
  const capturedItems: CapturedItemRecord[] = [];

  for (const category of CAPTURE_CATEGORIES) {
    const titles = await fetchCategoryTitles(client, category, captureErrors);
    const landingTitles = categoryLandingTitles(category);
    const filteredTitles = titles.filter(
      (title) => !ignoredPages.has(title) && !landingTitles.has(title),
    );
    console.log(`[capture] category=${category.key} members=${filteredTitles.length}`);

    const results = await Promise.all(
      filteredTitles.map((title) =>
        limit(async () => {
          try {
            const cached = await loadCachedRawPage(title);
            if (cached) {
              if (!isEligibleCapturedItem(category, cached)) {
                return null;
              }
              return { categoryKey: category.key, item: cached } satisfies CapturedItemRecord;
            }

            const page = await fetchParsedPage(client, title);
            const rawItem = parseItemPage(page);

            if (!isEligibleCapturedItem(category, rawItem)) {
              return null;
            }

            if (rawItem.imageFileName) {
              try {
                const imageInfo = await fetchImageInfo(client, rawItem.imageFileName);
                if (imageInfo?.url) {
                  rawItem.imageUrl = imageInfo.url;
                }
              } catch (error) {
                captureErrors.push({
                  title,
                  stage: 'image',
                  error: error instanceof Error ? error.message : String(error),
                });
              }
            }

            await saveRawPage(rawItem);
            return { categoryKey: category.key, item: rawItem } satisfies CapturedItemRecord;
          } catch (error) {
            captureErrors.push({
              title,
              stage: 'page',
              error: error instanceof Error ? error.message : String(error),
            });
            return null;
          }
        }),
      ),
    );

    for (const result of results) {
      if (result) {
        capturedItems.push(result);
      }
    }

    await writeJsonFile(RAW_CAPTURED_ITEMS_PATH, {
      importedAt,
      items: capturedItems,
    });
    await writeJsonFile(CAPTURE_ERRORS_PATH, captureErrors);
  }

  console.log(`[capture] pages-fetched=${capturedItems.length}`);
  console.log(`[capture] pages-parsed=${capturedItems.length}`);

  await writeJsonFile(RAW_CAPTURED_ITEMS_PATH, {
    importedAt,
    items: capturedItems,
  });
  await writeJsonFile(CAPTURE_ERRORS_PATH, captureErrors);

  console.log(`[capture] wrote=${RAW_CAPTURED_ITEMS_PATH}`);
  console.log(`[capture] wrote=${CAPTURE_ERRORS_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
