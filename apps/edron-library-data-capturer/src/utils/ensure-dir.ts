import path from 'node:path';
import { mkdir } from 'node:fs/promises';

export async function ensureDirForFile(filePath: string): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
}
