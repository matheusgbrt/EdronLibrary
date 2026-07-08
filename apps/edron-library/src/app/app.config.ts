import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { provideRouter } from '@angular/router';

import { provideAppTransloco } from './core/i18n/transloco.config';
import { TranslocoPaginatorIntl } from './core/i18n/transloco-paginator-intl';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),
    ...provideAppTransloco(),
    { provide: MatPaginatorIntl, useClass: TranslocoPaginatorIntl },
    provideRouter(routes)
  ]
};
