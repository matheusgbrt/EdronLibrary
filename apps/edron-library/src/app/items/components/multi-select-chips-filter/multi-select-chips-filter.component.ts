import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-multi-select-chips-filter',
  standalone: true,
  imports: [
    FormsModule,
    MatAutocompleteModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule
  ],
  templateUrl: './multi-select-chips-filter.component.html',
  styleUrl: './multi-select-chips-filter.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MultiSelectChipsFilterComponent {
  readonly label = input.required<string>();
  readonly options = input<string[]>([]);
  readonly selected = input<string[]>([]);
  readonly placeholder = input('Select options');

  readonly selectionChanged = output<string[]>();

  readonly query = signal('');
  readonly availableOptions = computed(() => {
    const selected = new Set(this.selected());
    const query = this.query().trim().toLowerCase();

    return this.options().filter((option) => !selected.has(option) && option.toLowerCase().includes(query));
  });

  selectOption(option: string): void {
    if (!option || this.selected().includes(option)) {
      this.query.set('');
      return;
    }

    this.selectionChanged.emit([...this.selected(), option]);
    this.query.set('');
  }

  removeOption(option: string): void {
    this.selectionChanged.emit(this.selected().filter((selectedOption) => selectedOption !== option));
  }

  onOptionSelected(event: MatAutocompleteSelectedEvent): void {
    this.selectOption(event.option.value);
  }

  onQueryChange(value: string): void {
    this.query.set(value);
  }
}
