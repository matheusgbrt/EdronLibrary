import { DatasetSourceSummary } from './dataset-source-summary.model';
import { TibiaItem } from './tibia-item.model';

export interface ItemDataset {
  schemaVersion: number;
  generatedAt: string;
  sourceSummary: DatasetSourceSummary;
  items: TibiaItem[];
}
