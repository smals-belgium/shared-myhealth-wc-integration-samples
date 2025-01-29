import { Injectable } from "@angular/core";
import { Prescription } from "../models/prescription";

//
// TODO
// Dummy implementation of the Backend API calls
//

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private prescriptionsBackendTestData:Prescription[] = [
    new Prescription(1, 'Example prescription #1', 'Example prescription number 1 description'),
    new Prescription(2, 'Example prescription #2', 'Example prescription number 2 description'),
    new Prescription(3, 'Example prescription #3', 'Example prescription number 3 description'),
    new Prescription(4, 'Example prescription #4', 'Example prescription number 4 description'),
    new Prescription(5, 'Example prescription #5', 'Example prescription number 5 description'),
    new Prescription(6, 'Example prescription #6', 'Example prescription number 6 description'),
    new Prescription(7, 'Example prescription #7', 'Example prescription number 7 description'),
    new Prescription(8, 'Example prescription #8', 'Example prescription number 8 description'),
  ]

  constructor() {
    console.log("ApiService: CTOR")
    this.setTimer()
  }

  private setTimer() {
    const p = this.prescriptionsBackendTestData[0]
    if (!!p){
      p.counter = (p.counter||0)+1
    }
    if ((p?.counter||0) < 200){
      setTimeout(() => this.setTimer(), 3000)
    }
  }

  async getPrescriptions(): Promise<Prescription[]> {
    // Return a deep copy of our data
    return this.prescriptionsBackendTestData.map(p => Prescription.createFrom(p))
  }
}
