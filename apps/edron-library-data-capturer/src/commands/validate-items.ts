import { readFile } from 'node:fs/promises';
import { FRONTEND_ITEMS_PATH } from '../config/paths.js';
import { ItemDatasetSchema } from '../validation/item-dataset.schema.js';

async function main(): Promise<void> {
  const content = await readFile(FRONTEND_ITEMS_PATH, 'utf8');
  const parsed = JSON.parse(content) as unknown;
  const result = ItemDatasetSchema.safeParse(parsed);

  if (!result.success) {
    console.error('[validate] dataset validation failed');
    console.error(JSON.stringify(result.error.format(), null, 2));
    process.exitCode = 1;
    return;
  }

  console.log(`[validate] ok items=${result.data.items.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
