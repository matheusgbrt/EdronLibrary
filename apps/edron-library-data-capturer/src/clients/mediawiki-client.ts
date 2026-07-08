import { WikiSourceConfig } from '../config/sources.js';

export class MediaWikiClient {
  constructor(private readonly source: WikiSourceConfig) {}

  async get<T>(
    params: Record<string, string | number | boolean | undefined>,
  ): Promise<T> {
    const url = new URL(this.source.apiUrl);

    for (const [key, value] of Object.entries(params)) {
      if (value === undefined) {
        continue;
      }

      url.searchParams.set(key, String(value));
    }

    url.searchParams.set('format', 'json');

    const response = await fetch(url, {
      headers: {
        'User-Agent': this.source.userAgent,
      },
    });

    if (!response.ok) {
      throw new Error(
        `MediaWiki request failed (${response.status} ${response.statusText}) for ${url.toString()}`,
      );
    }

    return (await response.json()) as T;
  }

  getPageUrl(title: string): string {
    return `${this.source.pageBaseUrl}${encodeURIComponent(title.replaceAll(' ', '_'))}`;
  }
}
