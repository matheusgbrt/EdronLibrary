export type SpecialEffectType =
  | 'PerfectShot'
  | 'CriticalHitChance'
  | 'CriticalExtraDamage'
  | 'ManaLeech'
  | 'LifeLeech'
  | 'Capacity'
  | 'Speed'
  | 'Light'
  | 'ParalysisRemoval'
  | 'DamageReflection'
  | 'Other';

export type SpecialEffectUnit =
  | '%'
  | 'flat'
  | 'sqm'
  | 'oz'
  | 'seconds'
  | 'description';

export interface SpecialEffect {
  type: SpecialEffectType;
  value: number | string | boolean;
  unit?: SpecialEffectUnit;
  condition?: string;
  description?: string;
}
