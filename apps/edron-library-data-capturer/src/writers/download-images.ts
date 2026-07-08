import { access, writeFile } from 'node:fs/promises';
import { ensureDirForFile } from '../utils/ensure-dir.js';

export async function downloadItemImage(
  url: string,
  outputPath: string,
  overwrite = false,
): Promise<void> {
  if (!overwrite) {
    try {
      await access(outputPath);
      return;
    } catch {
      // File does not exist, continue.
    }
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  await ensureDirForFile(outputPath);
  await writeFile(outputPath, buffer);
}
