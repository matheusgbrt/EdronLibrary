import { ArmorItem } from './armor-item.model';
import { WeaponItem } from './weapon-item.model';
import { QuiverItem } from './quiver-item.model';
import { ExtraSlotItem } from './extra-slot-item.model';

export type TibiaItem =
  | ArmorItem
  | WeaponItem
  | QuiverItem
  | ExtraSlotItem;
