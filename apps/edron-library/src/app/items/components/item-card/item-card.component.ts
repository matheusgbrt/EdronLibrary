import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

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
  imports: [MatIconModule],
  templateUrl: './item-card.component.html',
  styleUrl: './item-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemCardComponent {
  readonly item = input.required<TibiaItem>();
  private readonly externalLinkService = inject(ItemExternalLinkService);

  cardModel(item: TibiaItem): ItemCardDisplayModel {
    return this.toDisplayModel(buildRankedItemCardModel(item));
  }

  vocationText(item: TibiaItem): string {
    return item.vocations.includes('None') ? 'Unrestricted' : item.vocations.join(', ');
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
    const displayLabel = fact.label ?? fact.key;
    const displayValue = fact.value;

    return { ...fact, displayLabel, displayValue };
  }
}
