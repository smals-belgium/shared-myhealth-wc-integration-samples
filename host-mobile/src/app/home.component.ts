import { Component, inject } from "@angular/core";
import { Router } from "@angular/router";
import { IonButton, IonContent, IonHeader, IonTitle, IonToolbar } from "@ionic/angular/standalone";

@Component({
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButton],
  styles: `
    #container {
      margin-top:48px;
      text-align:center;
    }
  `,
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Sample Host Mobile</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div id="container">
        <div>
          <ion-button (click)="samplePrescriptions()">Sample Prescriptions</ion-button>
          </div>
      </div>
    </ion-content>
  `,
})

export class HomeComponent {
  private router: Router = inject(Router)

  samplePrescriptions() {
    this.router.navigateByUrl(`/prescriptions`);
  }
}
