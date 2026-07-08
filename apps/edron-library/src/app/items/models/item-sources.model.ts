import { ItemDataSource, SourceConfidence } from './source-confidence.model';

export interface ItemSourceUrls {
  tibiaWiki?: string;
  tibiaFandom?: string;
  tibiaCom?: string;
  image?: string;
}

export interface ItemSources {
  primary: ItemDataSource;
  urls: ItemSourceUrls;
  lastImportedAt?: string;
  sourceRevision?: string | null;
  confidence: SourceConfidence;
}
