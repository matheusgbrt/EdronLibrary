import { MediaWikiClient } from '../clients/mediawiki-client.js';

export interface CapturedPage {
  title: string;
  pageId: number;
  revisionId: number | null;
  wikitext: string;
  images: string[];
  sourceUrl: string;
}

interface ParseResponse {
  parse?: {
    title: string;
    pageid: number;
    revid?: number;
    wikitext?: {
      '*': string;
    };
    images?: string[];
  };
}

export async function fetchParsedPage(
  client: MediaWikiClient,
  title: string,
): Promise<CapturedPage> {
  const response = await client.get<ParseResponse>({
    action: 'parse',
    page: title,
    prop: 'wikitext|images|revid',
  });

  const parsed = response.parse;
  if (!parsed?.title || !parsed.pageid) {
    throw new Error(`Parse response missing page data for "${title}"`);
  }

  return {
    title: parsed.title,
    pageId: parsed.pageid,
    revisionId: parsed.revid ?? null,
    wikitext: parsed.wikitext?.['*'] ?? '',
    images: parsed.images ?? [],
    sourceUrl: client.getPageUrl(parsed.title),
  };
}
