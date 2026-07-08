import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-number-range-filter',
  standalone: true,
  imports: [FormsModule, MatFormFieldModule, MatInputModule],
  templateUrl: './number-range-filter.component.html',
  styleUrl: './number-range-filter.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NumberRangeFilterComponent {
  readonly min = input<number | null>(null);
  readonly max = input<number | null>(null);
  readonly minLabel = input('Min');
  readonly maxLabel = input('Max');
  readonly rangeChanged = output<{ min: number | null; max: number | null }>();

  setMin(value: unknown): void {
    this.rangeChanged.emit({ min: this.parseValue(value), max: this.max() });
  }

  setMax(value: unknown): void {
    this.rangeChanged.emit({ min: this.min(), max: this.parseValue(value) });
  }

  private parseValue(value: unknown): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
}
