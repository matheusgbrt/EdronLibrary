import { Injectable, inject } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';

const STORAGE_KEY = 'app.language';

type SupportedLanguage = 'en' | 'pt-BR';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly transloco = inject(TranslocoService);

  readonly languages = [
    { code: 'en', label: 'English' },
    { code: 'pt-BR', label: 'Português' }
  ] as const;

  init(): void {
    const saved = this.getSavedLanguage();
    this.transloco.setActiveLang(saved);
  }

  setLanguage(lang: string): void {
    if (!this.isSupportedLanguage(lang)) {
      return;
    }

    this.transloco.setActiveLang(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  }

  getActiveLang(): SupportedLanguage {
    const current = this.transloco.getActiveLang();
    return this.isSupportedLanguage(current) ? current : 'en';
  }

  private getSavedLanguage(): SupportedLanguage {
    const saved = localStorage.getItem(STORAGE_KEY);
    return this.isSupportedLanguage(saved) ? saved : 'en';
  }

  private isSupportedLanguage(lang: string | null): lang is SupportedLanguage {
    return lang === 'en' || lang === 'pt-BR';
  }
}
