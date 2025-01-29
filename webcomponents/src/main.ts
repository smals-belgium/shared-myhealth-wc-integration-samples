import { createCustomElement } from '@angular/elements';
import { createApplication } from '@angular/platform-browser';
import { PrescriptionsListComponent } from './app/prescriptions/prescriptions-list.component';
import { PrescriptionsDetailsComponent } from './app/prescriptions/prescriptions-details.component';
import { ErrorHandler } from '@angular/core';

const wcs:any = [
  ['sample-prescriptions-list',    PrescriptionsListComponent],
  ['sample-prescriptions-details', PrescriptionsDetailsComponent],
]

class WebComponentErrorHandler implements ErrorHandler {
  handleError(error:any) {
    throw new Error(error)
  }
}

// A custom ErrorHandler is required in order to catch any exception and rethrow them
// so that the host can catch them (and e.g. send them to a monitoring platform)
createApplication({
  providers: [
    { provide: ErrorHandler, useClass: WebComponentErrorHandler },
  ]
})
.then((app) => {
  for(const wc of wcs) {
    const ce = createCustomElement(wc[1], { injector: app.injector });
    customElements.define(wc[0], ce);
  }
})
.catch((err) => console.error(err));
