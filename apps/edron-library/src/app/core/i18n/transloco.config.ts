import { EnvironmentProviders, isDevMode } from '@angular/core';
import { provideTransloco } from '@jsverse/transloco';

import { TranslocoHttpLoader } from './transloco-loader';

export function provideAppTransloco(): EnvironmentProviders[] {
  return provideTransloco({
    config: {
      availableLangs: ['en', 'pt-BR'],
      defaultLang: 'en',
      fallbackLang: 'en',
      reRenderOnLangChange: true,
      prodMode: !isDevMode()
    },
    loader: TranslocoHttpLoader
  });
}
