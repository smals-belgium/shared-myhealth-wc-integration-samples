import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules, withComponentInputBinding } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { APP_INITIALIZER } from '@angular/core';
import { OfflineStoreDriver, OfflineStoreService } from './app/services/offline-store/offline-store.service';
import { OfflineStoreIndexDBDriver } from './app/services/offline-store/offline-store-driver-indexdb';

import "@smals-belgium/myhealth-sample-webcomponents"


function initOfflineStoreService(offlineStore: OfflineStoreService, driver: OfflineStoreDriver) {
  return async () => {
    await driver.init();
    await offlineStore.init(driver)
  }
}

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withComponentInputBinding(), withPreloading(PreloadAllModules)),
    { provide: APP_INITIALIZER, useFactory: initOfflineStoreService, deps:[OfflineStoreService, OfflineStoreIndexDBDriver], multi:true },
  ],
});
