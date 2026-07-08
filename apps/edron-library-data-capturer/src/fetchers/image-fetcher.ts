import { MediaWikiClient } from '../clients/mediawiki-client.js';

interface ImageInfoResponse {
  query?: {
    pages?: Record<
      string,
      {
        title?: string;
        imageinfo?: Array<{
          url?: string;
        }>;
        missing?: boolean;
      }
    >;
  };
}

function normalizeFileTitle(fileName: string): string {
  return fileName.startsWith('File:') ? fileName : `File:${fileName}`;
}

export async function fetchImageInfo(
  client: MediaWikiClient,
  fileName: string,
): Promise<{ fileName: string; url: string } | null> {
  const response = await client.get<ImageInfoResponse>({
    action: 'query',
    titles: normalizeFileTitle(fileName),
    prop: 'imageinfo',
    iiprop: 'url',
  });

  const page = Object.values(response.query?.pages ?? {})[0];
  const url = page?.imageinfo?.[0]?.url;

  if (!url) {
    return null;
  }

  return {
    fileName: page.title?.replace(/^File:/, '') ?? fileName.replace(/^File:/, ''),
    url,
  };
}
