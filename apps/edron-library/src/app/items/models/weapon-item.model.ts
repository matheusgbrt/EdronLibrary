import { ItemBase } from './item-base.model';
import { Element } from './element.model';
import { DamageType } from './damage-type.model';
import { AmmoType } from './ammo-type.model';

export type WeaponGroup =
  | 'Sword'
  | 'Axe'
  | 'Club'
  | 'Bow'
  | 'Crossbow'
  | 'Wand'
  | 'Rod'
  | 'Throwing'
  | 'Ammunition';

export type WeaponHands =
  | 'OneHanded'
  | 'TwoHanded';

export interface WeaponDamageRange {
  average: number;
  min: number;
  max: number;
  raw: string;
}

export interface WeaponStats {
  group: WeaponGroup;
  hands: WeaponHands;

  attack: number | null;
  defense: number | null;
  defenseModifier: number | null;

  range: number | null;
  hitPercent: number | null;

  damageType: DamageType;
  elementDamage?: Partial<Record<Element, number>>;
  damageRange?: WeaponDamageRange;

  requiredAmmoType?: AmmoType | null;
  consumesAmmo: boolean;

  charges?: number | null;
}

export interface WeaponItem extends ItemBase {
  kind: 'weapon';
  weapon: WeaponStats;
}
