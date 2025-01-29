import { Routes } from '@angular/router';
import { WrapperComponent } from './webcomponents/wrapper.component';
import { WebComponentFamily } from './models/wc-family.model';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'prescriptions',
    component: WrapperComponent,
    data:{
      template: 'sample-prescriptions-list',
      title: 'Prescriptions',
      family: WebComponentFamily.SamplePrescriptions,
      backButtonText: 'Home'
    }
  },
  {
    path: 'prescriptions/:pid',
    component: WrapperComponent,
    data:{
      template: 'sample-prescriptions-details',
      title: 'Prescriptions Details',
      family: WebComponentFamily.SamplePrescriptions,
      backButtonText: 'Back'
    }
  },
];
