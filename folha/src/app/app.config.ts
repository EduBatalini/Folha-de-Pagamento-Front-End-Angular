import { ApplicationConfig, LOCALE_ID, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';

import { rotas } from './app.routes';

// Registra o locale "pt" para que datas e moedas sejam formatadas em português.
registerLocaleData(localePt);

export const configuracaoApp: ApplicationConfig = {
  providers: [
    provideRouter(rotas),
    provideAnimations(),
    { provide: LOCALE_ID, useValue: 'pt-BR' },
  ],
};
