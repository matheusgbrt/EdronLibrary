import { ItemBase } from './item-base.model';
import { AmmoType } from './ammo-type.model';

export type ExtraSlotSubtype =
  | 'Trinket'
  | 'LightSource'
  | 'Ammunition'
  | 'Quiver'
  | 'Tool'
  | 'Decorative'
  | 'Other';

export interface ExtraSlotStats {
  subtype: ExtraSlotSubtype;

  providesLight: boolean;
  lightColor?: string | null;
  lightRadius?: number | null;

  ammoType?: AmmoType | null;
  attack?: number | null;

  charges?: number | null;
  durationSeconds?: number | null;

  consumable: boolean;
}

export interface ExtraSlotItem extends ItemBase {
  kind: 'extra-slot';
  extraSlot: ExtraSlotStats;
}
