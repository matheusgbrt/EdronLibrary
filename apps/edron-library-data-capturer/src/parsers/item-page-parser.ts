import { CapturedPage } from '../fetchers/page-fetcher.js';
import { extractTemplateBlock, parseTemplateFields } from './infobox-parser.js';
import { chooseBestItemImage } from './image-parser.js';

const ITEM_TEMPLATE_NAMES = [
  'Infobox Item',
  'Infobox_Object',
  'Infobox Object',
  'Item',
  'Object',
];

export interface RawCapturedItem {
  source: 'tibiafandom';
  sourceUrl: string;
  title: string;
  pageId?: number;
  revisionId?: number | null;
  imageFileName?: string;
  imageUrl?: string;
  rawFields: Record<string, string>;
  rawTextSections: Record<string, string>;
  categories: string[];
}

export interface CapturedItemRecord {
  categoryKey: string;
  item: RawCapturedItem;
}

export function parseItemPage(page: CapturedPage): RawCapturedItem {
  const template = extractTemplateBlock(page.wikitext, ITEM_TEMPLATE_NAMES);
  const rawFields = template ? parseTemplateFields(template) : {};
  const imageFileName = chooseBestItemImage(page.images, page.title);
  const rawItem: RawCapturedItem = {
    source: 'tibiafandom',
    sourceUrl: page.sourceUrl,
    title: page.title,
    pageId: page.pageId,
    revisionId: page.revisionId,
    rawFields,
    rawTextSections: {},
    categories: [],
  };

  if (imageFileName) {
    rawItem.imageFileName = imageFileName;
  }

  return rawItem;
}
