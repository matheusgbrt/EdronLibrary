import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

import {
  ArmorSlot,
  Element,
  ExtraSlotSubtype,
  ItemKind,
  SkillBonus,
  Vocation,
  WeaponGroup
} from '../../models';
import { ItemBrowserStateService } from '../../services/item-browser-state.service';
import { FilterSectionComponent } from '../filter-section/filter-section.component';
import { MultiSelectChipsFilterComponent } from '../multi-select-chips-filter/multi-select-chips-filter.component';
import { NumberRangeFilterComponent } from '../number-range-filter/number-range-filter.component';

@Component({
  selector: 'app-item-filter-drawer',
  standalone: true,
  imports: [
    FilterSectionComponent,
    FormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    MultiSelectChipsFilterComponent,
    NumberRangeFilterComponent
  ],
  templateUrl: './item-filter-drawer.component.html',
  styleUrl: './item-filter-drawer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemFilterDrawerComponent {
  protected readonly state = inject(ItemBrowserStateService);

  readonly closeClicked = output<void>();

  protected readonly kinds: ItemKind[] = ['armor', 'weapon', 'quiver', 'extra-slot'];
  protected readonly vocations: Vocation[] = ['Knight', 'Paladin', 'Sorcerer', 'Druid', 'Monk'];
  protected readonly armorSlots: ArmorSlot[] = ['Helmet', 'Armor', 'Legs', 'Boots', 'Shield', 'Spellbook'];
  protected readonly weaponGroups: WeaponGroup[] = [
    'Sword',
    'Axe',
    'Club',
    'Bow',
    'Crossbow',
    'Wand',
    'Rod',
    'Throwing',
    'Ammunition'
  ];
  protected readonly extraSlotSubtypes: ExtraSlotSubtype[] = ['Trinket', 'LightSource', 'Tool', 'Other'];
  protected readonly skills: SkillBonus[] = ['Sword', 'Axe', 'Club', 'Distance', 'Shielding', 'MagicLevel', 'Fist'];
  protected readonly elements: Element[] = ['Physical', 'Fire', 'Earth', 'Energy', 'Ice', 'Holy', 'Death'];
  protected readonly damageElements: Element[] = ['Fire', 'Earth', 'Energy', 'Ice', 'Holy', 'Death'];
  protected readonly classifications = [1, 2, 3, 4];

  patchQuery(query: string): void {
    this.state.patchFilters({ query });
  }

  patchKinds(kinds: string[]): void {
    this.state.patchFilters({ kinds: kinds as ItemKind[] });
  }

  patchVocations(vocations: string[]): void {
    this.state.patchFilters({ vocations: vocations as Vocation[] });
  }

  patchArmorSlots(armorSlots: string[]): void {
    this.state.patchFilters({ armorSlots: armorSlots as ArmorSlot[] });
  }

  patchWeaponGroups(weaponGroups: string[]): void {
    this.state.patchFilters({ weaponGroups: weaponGroups as WeaponGroup[] });
  }

  patchExtraSlotSubtypes(extraSlotSubtypes: string[]): void {
    this.state.patchFilters({ extraSlotSubtypes: extraSlotSubtypes as ExtraSlotSubtype[] });
  }

  patchLevel(range: { min: number | null; max: number | null }): void {
    this.state.patchFilters({ minLevel: range.min, maxLevel: range.max });
  }

  patchWeight(range: { min: number | null; max: number | null }): void {
    this.state.patchFilters({ minWeight: range.min, maxWeight: range.max });
  }

  patchNumberFilter(key: 'minImbuementSlots' | 'classification' | 'minMaxTier', value: unknown): void {
    this.state.patchFilters({ [key]: this.parseValue(value) });
  }

  patchDropSource(value: string): void {
    const dropsFrom = value
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);

    this.state.patchFilters({ dropsFrom });
  }

  setBonus(skill: SkillBonus, value: unknown): void {
    this.state.setBonusThreshold(skill, this.parseValue(value));
  }

  setProtection(element: Element, value: unknown): void {
    this.state.setProtectionThreshold(element, this.parseValue(value));
  }

  setElementalDamage(element: Element, value: unknown): void {
    this.state.setElementalDamageThreshold(element, this.parseValue(value));
  }

  bonusValue(skill: SkillBonus): number | null {
    return this.state.filters().bonuses[skill] ?? null;
  }

  protectionValue(element: Element): number | null {
    return this.state.filters().protections[element] ?? null;
  }

  elementalDamageValue(element: Element): number | null {
    return this.state.filters().elementalDamages[element] ?? null;
  }

  dropSourceText(): string {
    return this.state.filters().dropsFrom.join(', ');
  }

  private parseValue(value: unknown): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
}
