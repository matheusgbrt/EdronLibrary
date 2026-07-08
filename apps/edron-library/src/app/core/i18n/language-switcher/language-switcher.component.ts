import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { TranslocoPipe } from '@jsverse/transloco';

import { LanguageService } from '../language.service';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [MatFormFieldModule, MatSelectModule, TranslocoPipe],
  templateUrl: './language-switcher.component.html',
  styleUrl: './language-switcher.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LanguageSwitcherComponent {
  protected readonly languageService = inject(LanguageService);
  protected readonly languages = this.languageService.languages;

  setLanguage(event: MatSelectChange): void {
    this.languageService.setLanguage(event.value);
  }

  activeLang(): string {
    return this.languageService.getActiveLang();
  }
}
