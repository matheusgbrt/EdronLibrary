import { z } from 'zod';
import { TibiaItemSchema } from './tibia-item.schema.js';

export const ItemDatasetSchema = z.object({
  schemaVersion: z.number(),
  generatedAt: z.string(),
  sourceSummary: z.object({
    primary: z.enum(['manual', 'tibiawiki', 'tibiafandom', 'tibiadata', 'client', 'mixed']),
    itemCount: z.number(),
    generatedBy: z.string().optional(),
    sourceUrls: z.array(z.string()).optional(),
  }),
  items: z.array(TibiaItemSchema),
});

export type ItemDataset = z.infer<typeof ItemDatasetSchema>;
