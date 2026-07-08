import { DataQuality } from './data-quality.model';

export interface ItemMetadata {
  versionAdded?: string;
  dateAdded?: string;
  notes?: string[];
  tags: string[];
  dataQuality: DataQuality;
}
