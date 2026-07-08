import { writeFile } from 'node:fs/promises';
import { ensureDirForFile } from '../utils/ensure-dir.js';

export async function writeJsonFile(filePath: string, data: unknown): Promise<void> {
  await ensureDirForFile(filePath);
  await writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}
