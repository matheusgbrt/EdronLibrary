import { TestBed } from '@angular/core/testing';

import { ItemExternalLinkService } from './item-external-link.service';

describe('ItemExternalLinkService', () => {
  let service: ItemExternalLinkService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ItemExternalLinkService);
  });

  it('builds TibiaWiki and Tibia Fandom links from the item name', () => {
    const links = service.linksFor('Amber Greataxe');

    expect(links).toEqual({
      tibiaWiki: 'https://www.tibiawiki.com.br/wiki/Amber_Greataxe',
      tibiaFandom: 'https://tibia.fandom.com/wiki/Amber_Greataxe'
    });
  });

  it('URI-encodes item page slugs after replacing spaces with underscores', () => {
    const links = service.linksFor('Yalahari Mask +1');

    expect(links.tibiaWiki).toBe('https://www.tibiawiki.com.br/wiki/Yalahari_Mask_%2B1');
    expect(links.tibiaFandom).toBe('https://tibia.fandom.com/wiki/Yalahari_Mask_%2B1');
  });
});
