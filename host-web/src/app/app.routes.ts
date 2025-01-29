import { Routes } from '@angular/router';
import { HomeComponent } from './home.component';
import { SamplePrescriptionsComponent } from './webcomponents/sample-prescriptions.component';

export const routes: Routes = [
  {
    path:'',
    pathMatch:'full',
    component: HomeComponent
  },

  {
    path: 'prescriptions',
    component: SamplePrescriptionsComponent,
    data:{
      family: 'sample-prescriptions'
    }
  },

];
