import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { CAPTURE_CATEGORIES } from '../config/categories.js';
import {
  FRONTEND_ITEM_IMAGES_DIR,
  FRONTEND_ITEMS_PATH,
  GENERATED_ITEMS_PATH,
  RAW_CAPTURED_ITEMS_PATH,
} from '../config/paths.js';
import { DOWNLOAD_IMAGES } from '../config/sources.js';
import { normalizeCapturedItem } from '../normalizers/normalize-item.js';
import { loadManualOverrides, applyManualOverrides } from '../overrides/apply-overrides.js';
import { CapturedItemRecord } from '../parsers/item-page-parser.js';
import { ItemDatasetSchema } from '../validation/item-dataset.schema.js';
import { TibiaItemSchema } from '../validation/tibia-item.schema.js';
import { slugifyItemName } from '../utils/slugify.js';
import { downloadItemImage } from '../writers/download-images.js';
import { writeJsonFile } from '../writers/write-json.js';

interface CaptureFile {
  importedAt: string;
  items: CapturedItemRecord[];
}

function fileExtensionFromAssetPath(assetPath: string | undefined): string | null {
  if (!assetPath) {
    return null;
  }

  const extension = path.extname(assetPath).replace('.', '').toLowerCase();
  return extension || null;
}

async function maybeDownloadImages(items: unknown[]): Promise<void> {
  if (!DOWNLOAD_IMAGES) {
    return;
  }

  for (const item of items) {
    const parsed = TibiaItemSchema.parse(item);
    const imageUrl = parsed.sources.urls.image;
    const extension = fileExtensionFromAssetPath(parsed.assets.imagePath);
    if (!imageUrl || !extension) {
      continue;
    }

    const outputPath = path.resolve(FRONTEND_ITEM_IMAGES_DIR, `${slugifyItemName(parsed.name)}.${extension}`);
    await downloadItemImage(imageUrl, outputPath);
  }
}

async function main(): Promise<void> {
  const rawContent = await readFile(RAW_CAPTURED_ITEMS_PATH, 'utf8');
  const rawCapture = JSON.parse(rawContent) as CaptureFile;
  const importedAt = rawCapture.importedAt ?? new Date().toISOString();

  const normalizedItems = rawCapture.items.map((record) => {
    const category = CAPTURE_CATEGORIES.find((entry) => entry.key === record.categoryKey);
    if (!category) {
      throw new Error(`Missing category configuration for "${record.categoryKey}"`);
    }

    return normalizeCapturedItem(record.item, category, importedAt);
  });

  const overrides = await loadManualOverrides();
  const mergedItems = applyManualOverrides(normalizedItems, overrides);

  let validationFailures = 0;
  const validatedItems = mergedItems.flatMap((item) => {
    const result = TibiaItemSchema.safeParse(item);
    if (!result.success) {
      validationFailures += 1;
      console.error(`[generate] validation failed for ${item.id}`, result.error.format());
      return [];
    }

    return [result.data];
  });

  await maybeDownloadImages(validatedItems);

  const dataset = ItemDatasetSchema.parse({
    schemaVersion: 1,
    generatedAt: importedAt,
    sourceSummary: {
      primary: 'tibiafandom',
      itemCount: validatedItems.length,
      generatedBy: 'apps/edron-library-data-capturer',
      sourceUrls: ['https://tibia.fandom.com/wiki/'],
    },
    items: validatedItems,
  });

  console.log(`[generate] items-normalized=${normalizedItems.length}`);
  console.log(`[generate] validation-failures=${validationFailures}`);

  await writeJsonFile(GENERATED_ITEMS_PATH, dataset);
  await writeJsonFile(FRONTEND_ITEMS_PATH, dataset);

  console.log(`[generate] wrote=${GENERATED_ITEMS_PATH}`);
  console.log(`[generate] wrote=${FRONTEND_ITEMS_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
