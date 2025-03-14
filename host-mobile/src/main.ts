import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules, withComponentInputBinding } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { OfflineStoreService } from './app/services/offline-store/offline-store.service';
import { OfflineStoreIndexDBDriver } from './app/services/offline-store/offline-store-driver-indexdb';

import "@smals-belgium/myhealth-sample-webcomponents"
import { inject, provideAppInitializer } from '@angular/core';


function initializeServices() {
  return async () => {
    const offlineStore = inject(OfflineStoreService)
    const driver = inject(OfflineStoreIndexDBDriver)

    await driver.init();
    await offlineStore.init(driver)
  }
}

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withComponentInputBinding(), withPreloading(PreloadAllModules)),
    provideAppInitializer(initializeServices())
  ],
});
