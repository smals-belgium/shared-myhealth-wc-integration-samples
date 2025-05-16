import { Component, inject, Input, SimpleChanges } from '@angular/core'
import { PrescriptionsService } from '../services/prescriptions.service'
import { BaseWebComponent } from '@smals-belgium/myhealth-wc-integration-angular'
import { Prescription } from '../models/prescription'

@Component({
  imports: [],
  template: `
@if (!isInitialized()) {
  <div class="error">Component not properly initialized!</div>
}
@else if (!!prescription) {
    <div>
      <div>ID: {{prescription.id}}</div>
      <div>Name: {{prescription.name}}</div>
    </div>
}
@else if (!!pid && !loaded) {
    <div style="font-style:italic;">
      Loading prescription...
    </div>
}
@else if (!!pid && loaded) {
    <div>
      The prescription you are trying to view does not exist anymore!
    </div>
}
@else {
    <div>
      No selected prescription!
    </div>
}
  `
})
export class PrescriptionsDetailsComponent extends BaseWebComponent {
  @Input() pid?: string

  private readonly prescriptionsService = inject(PrescriptionsService)
  prescription?:Prescription
  loaded = false

  private async pidChanged() {
    console.log("PrescriptionsDetailsComponent / pidChanged: ", this.pid)
    if (!!this.pid) {
      const pid = parseInt(this.pid||'')
      const prescriptions = await this.prescriptionsService.getPrescriptions("DETAILS", this.services())
      this.prescription = prescriptions.find((item:Prescription) => item.id === pid)
      console.log("Found prescription [%s]: ", this.pid, this.prescription)
      this.loaded = true

      if (this.prescription == null){
        throw new Error(`Unknown prescription with ID [${this.pid}]!`)
      }
    }
  }

  override async onInitialized() {
    this.pidChanged()
  }

  override async onPropsChanged(changes: SimpleChanges) {
    if (!!changes['pid']) {
      await this.pidChanged()
    }
  }
}
