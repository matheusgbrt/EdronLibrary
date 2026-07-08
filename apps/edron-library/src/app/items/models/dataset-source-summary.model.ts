import { ItemDataSource } from './source-confidence.model';

export interface DatasetSourceSummary {
  primary: ItemDataSource;
  itemCount: number;
  generatedBy?: string;
  sourceUrls?: string[];
}
