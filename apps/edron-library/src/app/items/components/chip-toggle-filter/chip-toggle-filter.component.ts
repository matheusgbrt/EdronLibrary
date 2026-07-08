import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-chip-toggle-filter',
  standalone: true,
  imports: [MatChipsModule],
  templateUrl: './chip-toggle-filter.component.html',
  styleUrl: './chip-toggle-filter.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChipToggleFilterComponent {
  readonly options = input.required<readonly string[]>();
  readonly selected = input<readonly string[]>([]);
  readonly selectionChanged = output<string[]>();

  toggle(option: string): void {
    const current = this.selected();
    const next = current.includes(option)
      ? current.filter((value) => value !== option)
      : [...current, option];

    this.selectionChanged.emit(next);
  }
}
