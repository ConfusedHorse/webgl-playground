import { bootstrapApplication } from '@angular/platform-browser';
import { APP_CONFIG } from './app/config';
import { AppComponent } from './app/component';

bootstrapApplication(AppComponent, APP_CONFIG)
  .catch((err) => console.error(err));
