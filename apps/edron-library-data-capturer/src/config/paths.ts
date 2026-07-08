import path from 'node:path';

export const CAPTURER_ROOT = path.resolve(import.meta.dirname, '..', '..');
export const FRONTEND_APP_ROOT = path.resolve(CAPTURER_ROOT, '..', 'edron-library');

export const RAW_PAGES_DIR = path.resolve(CAPTURER_ROOT, 'raw', 'pages');
export const RAW_API_DIR = path.resolve(CAPTURER_ROOT, 'raw', 'api');
export const RAW_IMAGES_DIR = path.resolve(CAPTURER_ROOT, 'raw', 'images');
export const OUTPUT_DIR = path.resolve(CAPTURER_ROOT, 'output');

export const GENERATED_ITEMS_PATH = path.resolve(OUTPUT_DIR, 'items.generated.json');
export const RAW_CAPTURED_ITEMS_PATH = path.resolve(OUTPUT_DIR, 'raw-captured-items.json');
export const CAPTURE_ERRORS_PATH = path.resolve(OUTPUT_DIR, 'capture-errors.json');

export const FRONTEND_ITEMS_PATH = path.resolve(
  CAPTURER_ROOT,
  '..',
  'edron-library',
  'src',
  'assets',
  'data',
  'items.json',
);

export const FRONTEND_ITEM_IMAGES_DIR = path.resolve(
  CAPTURER_ROOT,
  '..',
  'edron-library',
  'src',
  'assets',
  'images',
  'items',
);

export const MANUAL_OVERRIDES_PATH = path.resolve(
  CAPTURER_ROOT,
  'patches',
  'manual-overrides.json',
);

export const IGNORED_PAGES_PATH = path.resolve(
  CAPTURER_ROOT,
  'patches',
  'ignored-pages.json',
);
