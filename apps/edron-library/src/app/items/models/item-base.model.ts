import { ItemKind } from './item-kind.model';
import { Vocation } from './vocation.model';
import { SkillBonus } from './skill-bonus.model';
import { Element } from './element.model';
import { SpecialEffect } from './special-effect.model';
import { DropsFrom } from './drops-from.model';
import { ItemSources } from './item-sources.model';
import { ItemAssets } from './item-assets.model';
import { ItemMetadata } from './item-metadata.model';

export interface ItemBase {
  id: string;
  name: string;
  kind: ItemKind;

  level: number | null;
  vocations: Vocation[];

  weight: number;
  marketable: boolean | null;

  imbuementSlots: number;
  classification: number | null;
  maxTier: number | null;

  bonuses: Partial<Record<SkillBonus | string, number>>;
  protections: Partial<Record<Element | string, number>>;

  specialEffects: SpecialEffect[];

  dropsFrom: DropsFrom;

  sources: ItemSources;
  assets: ItemAssets;
  metadata: ItemMetadata;
}
