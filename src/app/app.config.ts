import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import {DevTools, FormatSimple, Tolgee, TOLGEE_INSTANCE} from '@tolgee/ngx';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    {
      provide: TOLGEE_INSTANCE,
      useFactory: () => {
        return Tolgee()
          .use(DevTools())
          .use(FormatSimple())
          .init({
            defaultLanguage: 'pl',
            fallbackLanguage: 'en',
            // for development
            apiUrl: 'http://77.237.246.171:8085',
            apiKey: 'tgpak_gm2v6nrrha4dazlfgu3xa4tmnrwhg3legm3wk3dtne3gu4y',
            availableLanguages: ['pl', 'en'],
            // for production
            staticData: {
              en: () => import('../i18n/en.json'),
              pl: () => import('../i18n/pl.json'),
            },
          });
      },
    },
  ]
};
