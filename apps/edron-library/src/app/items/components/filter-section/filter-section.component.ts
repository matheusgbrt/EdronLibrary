import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-filter-section',
  standalone: true,
  templateUrl: './filter-section.component.html',
  styleUrl: './filter-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterSectionComponent {
  readonly title = input.required<string>();
}
