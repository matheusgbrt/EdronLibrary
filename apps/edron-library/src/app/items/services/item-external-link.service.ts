import { Injectable } from '@angular/core';

export interface ItemExternalLinks {
  tibiaWiki: string;
  tibiaFandom: string;
}

@Injectable({ providedIn: 'root' })
export class ItemExternalLinkService {
  linksFor(itemName: string): ItemExternalLinks {
    const slug = encodeURIComponent(itemName.trim().replace(/\s+/g, '_'));

    return {
      tibiaWiki: `https://www.tibiawiki.com.br/wiki/${slug}`,
      tibiaFandom: `https://tibia.fandom.com/wiki/${slug}`
    };
  }
}
