import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { Element, SkillBonus, TibiaItem } from '../../models';

@Component({
  selector: 'app-item-card',
  standalone: true,
  imports: [MatIconModule, TranslocoPipe],
  templateUrl: './item-card.component.html',
  styleUrl: './item-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemCardComponent {
  readonly item = input.required<TibiaItem>();
  private readonly transloco = inject(TranslocoService);
  private readonly activeLang = this.transloco.activeLang;

  statRows(item: TibiaItem): string[] {
    const lang = this.activeLang();
    const rows = [
      `${this.translate('itemCard.level', lang)}: ${item.level ?? this.translate('itemCard.unrestricted', lang)}`,
      `${this.translate('itemCard.weight', lang)}: ${item.weight} oz`,
      `${this.translate('itemCard.imbuementSlots', lang)}: ${item.imbuementSlots}`
    ];

    if (item.classification !== null) {
      rows.push(`${this.translate('itemCard.classification', lang)}: ${item.classification}`);
    }

    if (item.maxTier !== null) {
      rows.push(`${this.translate('itemCard.maxTier', lang)}: ${item.maxTier}`);
    }

    if (item.kind === 'armor') {
      rows.push(item.armor.slot);
      this.pushNumber(rows, 'itemCard.armor', item.armor.arm, lang);
      this.pushNumber(rows, 'itemCard.defense', item.armor.def, lang);
    }

    if (item.kind === 'weapon') {
      rows.push(item.weapon.group);
      this.pushNumber(rows, 'itemCard.attack', item.weapon.attack, lang);
      this.pushNumber(rows, 'itemCard.defense', item.weapon.defense, lang);
      this.pushNumber(rows, 'itemCard.range', item.weapon.range, lang);
    }

    if (item.kind === 'quiver') {
      rows.push(`${this.translate('itemCard.slots', lang)}: ${item.quiver.volume}`, item.quiver.acceptedAmmoTypes.join('/'));
    }

    if (item.kind === 'extra-slot') {
      rows.push(item.extraSlot.subtype);
      this.pushNumber(rows, 'itemCard.attack', item.extraSlot.attack ?? null, lang);
    }

    return rows;
  }

  bonusEntries(item: TibiaItem): Array<[string, number]> {
    return Object.entries(item.bonuses).filter((entry): entry is [SkillBonus, number] => entry[1] !== undefined);
  }

  protectionEntries(item: TibiaItem): Array<[string, number]> {
    return Object.entries(item.protections).filter((entry): entry is [Element, number] => entry[1] !== undefined);
  }

  vocationText(item: TibiaItem): string {
    const lang = this.activeLang();
    return item.vocations.includes('None')
      ? this.translate('itemCard.unrestricted', lang)
      : item.vocations.join(', ');
  }

  private pushNumber(rows: string[], labelKey: string, value: number | null, lang: string): void {
    if (value !== null) {
      rows.push(`${this.translate(labelKey, lang)}: ${value}`);
    }
  }

  private translate(key: string, lang: string): string {
    return this.transloco.translate(key, {}, lang);
  }
}
