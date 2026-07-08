import { ItemBase } from './item-base.model';

export type ArmorSlot =
  | 'Helmet'
  | 'Armor'
  | 'Legs'
  | 'Boots'
  | 'Shield'
  | 'Spellbook';

export interface ArmorStats {
  slot: ArmorSlot;

  arm: number | null;
  def: number | null;

  twoHanded: false;
}

export interface ArmorItem extends ItemBase {
  kind: 'armor';
  armor: ArmorStats;
}
