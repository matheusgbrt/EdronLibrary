import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { ArmorSlot, ExtraSlotSubtype, ItemKind, WeaponGroup } from '../../models';
import { CategoryFilter, ItemBrowserStateService } from '../../services/item-browser-state.service';

interface CategoryEntry extends CategoryFilter {
  label: string;
}

interface CategoryGroup {
  label: string;
  entries: CategoryEntry[];
}

@Component({
  selector: 'app-item-category-sidebar',
  standalone: true,
  imports: [MatIconModule, MatTooltipModule, TranslocoPipe],
  templateUrl: './item-category-sidebar.component.html',
  styleUrl: './item-category-sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemCategorySidebarComponent {
  protected readonly state = inject(ItemBrowserStateService);
  private readonly transloco = inject(TranslocoService);
  protected readonly browserLabel = computed(() => {
    const lang = this.transloco.activeLang();
    return this.transloco.translate('items.browser', {}, lang);
  });

  protected readonly allCategory: CategoryEntry = {
    label: 'All items',
    kinds: [],
    armorSlots: [],
    weaponGroups: [],
    extraSlotSubtypes: []
  };

  protected readonly groups: CategoryGroup[] = [
    {
      label: 'Armor',
      entries: ['Helmet', 'Armor', 'Legs', 'Boots', 'Shield', 'Spellbook'].map((slot) =>
        this.armorEntry(slot as ArmorSlot)
      )
    },
    {
      label: 'Weapons',
      entries: ['Sword', 'Axe', 'Club', 'Bow', 'Crossbow', 'Wand', 'Rod', 'Throwing', 'Ammunition'].map(
        (group) => this.weaponEntry(group as WeaponGroup)
      )
    },
    {
      label: 'Extra Slot',
      entries: [
        {
          label: 'Quivers',
          kinds: ['quiver'],
          armorSlots: [],
          weaponGroups: [],
          extraSlotSubtypes: []
        },
        ...(['Trinket', 'LightSource', 'Tool', 'Other'] as ExtraSlotSubtype[]).map((subtype) =>
          this.extraSlotEntry(subtype)
        )
      ]
    }
  ];

  selectCategory(category: CategoryEntry): void {
    this.state.setCategoryFilter(category);
  }

  isSelected(category: CategoryEntry): boolean {
    const filters = this.state.filters();

    return (
      this.sameValues(filters.kinds, category.kinds) &&
      this.sameValues(filters.armorSlots, category.armorSlots) &&
      this.sameValues(filters.weaponGroups, category.weaponGroups) &&
      this.sameValues(filters.extraSlotSubtypes, category.extraSlotSubtypes)
    );
  }

  private armorEntry(slot: ArmorSlot): CategoryEntry {
    return {
      label: slot === 'Armor' ? 'Armors' : slot,
      kinds: ['armor'],
      armorSlots: [slot],
      weaponGroups: [],
      extraSlotSubtypes: []
    };
  }

  private weaponEntry(group: WeaponGroup): CategoryEntry {
    return {
      label: group,
      kinds: ['weapon'],
      armorSlots: [],
      weaponGroups: [group],
      extraSlotSubtypes: []
    };
  }

  private extraSlotEntry(subtype: ExtraSlotSubtype): CategoryEntry {
    return {
      label: this.extraSlotLabel(subtype),
      kinds: ['extra-slot'],
      armorSlots: [],
      weaponGroups: [],
      extraSlotSubtypes: [subtype]
    };
  }

  private extraSlotLabel(subtype: ExtraSlotSubtype): string {
    return subtype === 'LightSource' ? 'Light Sources' : `${subtype}s`;
  }

  private sameValues<T>(left: T[], right: T[]): boolean {
    return left.length === right.length && left.every((value) => right.includes(value));
  }
}
