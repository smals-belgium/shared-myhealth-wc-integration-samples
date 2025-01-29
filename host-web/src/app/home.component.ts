import { Component, inject } from "@angular/core";
import { Router } from "@angular/router";

@Component({
  standalone: true,
  imports: [],
  template: `
    <h1>Sample Host Web</h1>
    <br/>
    <div>
      <button (click)="samplePrescriptions()">Sample Prescriptions</button>
    </div>
    <br/><br/>
    `,
})
export class HomeComponent {
  private router: Router = inject(Router)

  samplePrescriptions() {
    this.router.navigateByUrl(`/prescriptions`);
  }
}
