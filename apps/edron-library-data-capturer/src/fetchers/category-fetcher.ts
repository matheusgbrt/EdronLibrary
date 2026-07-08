import { MediaWikiClient } from '../clients/mediawiki-client.js';

interface CategoryMembersResponse {
  continue?: {
    cmcontinue?: string;
  };
  query?: {
    categorymembers?: Array<{
      title: string;
    }>;
  };
}

export async function fetchCategoryMembers(
  client: MediaWikiClient,
  categoryTitle: string,
): Promise<string[]> {
  const titles: string[] = [];
  let cmcontinue: string | undefined;

  do {
    const response = await client.get<CategoryMembersResponse>({
      action: 'query',
      list: 'categorymembers',
      cmtitle: categoryTitle,
      cmlimit: 500,
      cmtype: 'page',
      cmcontinue,
    });

    for (const member of response.query?.categorymembers ?? []) {
      titles.push(member.title);
    }

    cmcontinue = response.continue?.cmcontinue;
  } while (cmcontinue);

  return titles;
}
