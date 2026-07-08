import { ItemBase } from './item-base.model';
import { AmmoType } from './ammo-type.model';

export type QuiverEquipSlot =
  | 'ShieldHand'
  | 'ExtraSlot';

export interface QuiverStats {
  volume: number;
  acceptedAmmoTypes: AmmoType[];

  equipSlots: QuiverEquipSlot[];

  canUseWithTwoHandedDistanceWeapon: boolean;

  containerOnlyForAmmunition: boolean;
}

export interface QuiverItem extends ItemBase {
  kind: 'quiver';
  quiver: QuiverStats;
}
