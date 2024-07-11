import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { ROUTES } from './routes';

export const APP_CONFIG: ApplicationConfig = {
  providers: [provideRouter(ROUTES)]
};
