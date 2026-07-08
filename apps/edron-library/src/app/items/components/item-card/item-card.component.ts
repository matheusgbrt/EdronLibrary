import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { TibiaItem } from '../../models';
import { ItemExternalLinkService, ItemExternalLinks } from '../../services/item-external-link.service';
import { buildRankedItemCardModel, RankedItemCardModel, RankedItemFact } from './item-card-rank';

interface DisplayItemFact extends RankedItemFact {
  displayLabel: string;
  displayValue: string;
}

interface ItemCardDisplayModel {
  primary: DisplayItemFact[];
  secondary: DisplayItemFact[];
  meta: DisplayItemFact[];
  bonuses: DisplayItemFact[];
  protections: DisplayItemFact[];
}

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
  private readonly externalLinkService = inject(ItemExternalLinkService);
  private readonly activeLang = this.transloco.activeLang;

  cardModel(item: TibiaItem): ItemCardDisplayModel {
    return this.toDisplayModel(buildRankedItemCardModel(item));
  }

  vocationText(item: TibiaItem): string {
    const lang = this.activeLang();
    return item.vocations.includes('None')
      ? this.translate('itemCard.unrestricted', lang)
      : item.vocations.join(', ');
  }

  secondaryText(fact: DisplayItemFact): string {
    return fact.displayLabel === fact.key ? fact.displayValue : `${fact.displayLabel} ${fact.displayValue}`;
  }

  externalLinks(item: TibiaItem): ItemExternalLinks {
    return this.externalLinkService.linksFor(item.name);
  }

  private toDisplayModel(model: RankedItemCardModel): ItemCardDisplayModel {
    return {
      primary: model.primary.map((fact) => this.toDisplayFact(fact)),
      secondary: model.secondary.map((fact) => this.toDisplayFact(fact)),
      meta: model.meta.map((fact) => this.toDisplayFact(fact)),
      bonuses: model.bonuses.map((fact) => this.toDisplayFact(fact)),
      protections: model.protections.map((fact) => this.toDisplayFact(fact))
    };
  }

  private toDisplayFact(fact: RankedItemFact): DisplayItemFact {
    const lang = this.activeLang();
    const displayLabel = fact.labelKey === null ? fact.label ?? fact.key : this.translate(fact.labelKey, lang);
    const displayValue = fact.value.startsWith('itemCard.') ? this.translate(fact.value, lang) : fact.value;

    return { ...fact, displayLabel, displayValue };
  }

  private translate(key: string, lang: string): string {
    return this.transloco.translate(key, {}, lang);
  }
}
