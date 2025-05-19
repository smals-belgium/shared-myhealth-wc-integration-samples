import {Component, EventEmitter, inject, OnInit, Output} from '@angular/core'
import { PrescriptionsService } from '../services/prescriptions.service'
import { BaseWebComponent, LongPressDirective, isMobileNative } from '@smals-belgium/myhealth-wc-integration-angular'
import { Prescription } from '../models/prescription'
import { version } from '../../version'

class SelectablePrescription {
  prescription:Prescription
  selected:boolean

  constructor(p:Prescription) {
    this.prescription = p
    this.selected = false
  }
}

@Component({
  imports: [LongPressDirective],
  styles:`
    div.prescriptions {
      margin-top:16px;
      margin-left:8px;
    }
    div.prescription {
      margin:4px 0px;
      cursor:pointer
    }
    div.prescription span {
      margin-left:8px;
    }
    div.footer {
      margin-top:24px;
      font-size:8pt;
    }
    div.footer > span {
      padding: 0 4px;
    }
  `,
  template: `
  <div class="prescriptions">
@if (!isInitialized) {
  <div>Loading ...</div>
}
@else if (!!prescriptions) {
  @for(pr of prescriptions; track pr.prescription.id) {
    <div class="prescription">
      <input type="checkbox" [checked]="pr.selected" (change)="pr.selected = !pr.selected"/>
      <span longPress (mouseLongPress)="selectItem(pr)" (mouseClick)="showItemDetail(pr)">
        {{pr.prescription.name}}
      @if (!!pr.prescription.counter){
        ({{pr.prescription.counter}})
      }
      </span>
    </div>
  }
}
    <div class="footer">
      <span>{{getPlatform()}}</span>
      /
      <span>{{this.language()}}</span>
      /
      <span>{{this.configName()}}</span>
      /
      <span>v{{getVersion()}}</span>
    </div>
  </div>
`
})
export class PrescriptionsListComponent extends BaseWebComponent implements OnInit {
  private readonly prescriptionsService = inject(PrescriptionsService)
  prescriptions?: SelectablePrescription[]
  isInitialized: boolean = false;

  @Output() onSelectedPrescription = new EventEmitter<number>()


  async ngOnInit(): Promise<void> {
    await this.updatePrescriptions(false)
    this.services().registerRefreshCallback( (done) => this.onRefreshData(done) )
    this.isInitialized = true
  }

  private onRefreshData(done:()=>void) {
    console.log("Refreshing data...")
    setTimeout( async () => {
      // Fetch the new data
      await this.updatePrescriptions(true)
      console.log("Refreshed!")
      done()
    }, 1000)
  }

  async updatePrescriptions(force:boolean): Promise<void> {
      const prescriptions = await this.prescriptionsService.getPrescriptions("LIST", this.services(), force)
      this.prescriptions = prescriptions.map(p => new SelectablePrescription(p))
  }

  showItemDetail(selPrescription:SelectablePrescription) {
    console.log("Show details: ", selPrescription)
    this.onSelectedPrescription.emit(selPrescription.prescription.id)
  }

  selectItem(selPrescription:SelectablePrescription) {
    selPrescription.selected = !selPrescription.selected
  }

  getPlatform() {
    return isMobileNative() ? 'mobile native' : 'browser'
  }

  getVersion() {
    return version
  }
}
