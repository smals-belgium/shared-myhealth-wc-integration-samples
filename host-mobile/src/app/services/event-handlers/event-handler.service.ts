import { Injectable, inject } from '@angular/core';
import { NavController } from '@ionic/angular';
import { WebComponentFamily } from 'src/app/models/wc-family.model';

type EventHandler = (event:any) => void
type WebComponentOutputs = Record<string, EventHandler>


@Injectable({
  providedIn: 'root'
})
export class EventHandlerService {
  private navCtrl: NavController = inject(NavController)

  private outputs:Record<WebComponentFamily, WebComponentOutputs> = {
    [WebComponentFamily.SamplePrescriptions]: {
      "onSelectedPrescription": (pid) => {
        this.navCtrl.navigateForward(`/prescriptions/${pid}`)
      }
    },
    [WebComponentFamily.Family1]: {},
    [WebComponentFamily.Family2]: {}
  }


  getOutputs(family:WebComponentFamily):WebComponentOutputs {
    return this.outputs[family]
  }
}
