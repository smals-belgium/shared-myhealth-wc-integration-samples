import { inject, Injectable } from '@angular/core';
import { ComponentServices } from '@smals-belgium/myhealth-wc-integration'
import { BaseFamilyDataFetchHelper } from '../base-family-data-fetch.helper';
import { Prescription } from '../models/prescription';
import { delay } from '@smals-belgium/myhealth-wc-integration-angular';
import { ApiService } from './api.service';


class FetchPrescriptionsHelper extends BaseFamilyDataFetchHelper<Prescription[]> {
  private readonly apiService:ApiService

  constructor(logId:string, apiService:ApiService, componentServices:ComponentServices) {
    super(logId, 'prescriptions', componentServices)
    this.apiService = apiService
  }

  protected override async getDataFromBackend(): Promise<Prescription[]|null> {
    console.log("[%s] Fetching prescriptions from backend...", this.logId)

    // Get a proper access token
    const accessToken = await this.getAccessToken()
    console.log("[%s] Fetching prescriptions from backend with token: ", this.logId, accessToken)

    // no access token -> no fetch!
    if (accessToken == null){
      return null
    }

    const prescriptions = await delay<Prescription[]>(1000, async () => {
      return await this.apiService.getPrescriptions()
    })

    console.log("[%s] Fetched prescriptions from backend: ", this.logId, prescriptions)
    return prescriptions
  }
}


@Injectable({
  providedIn: 'root'
})
export class PrescriptionsService {
  private readonly apiService = inject(ApiService)

  async getPrescriptions(logId:string, componentServices:ComponentServices, force:boolean=false): Promise<Prescription[]> {
    const helper = new FetchPrescriptionsHelper(logId, this.apiService, componentServices)
    return (await helper.getData(force)) || []
  }

  // async appendPrescription(logId:string, getAuthToken:GetAuthToken, cache:ComponentCache, offlineStore?:OfflineStore): Promise<void> {
  //   console.log("[%s] Append prescriptions: BEGIN", logId)
  //   const helper = new FetchPrescriptionsHelper(logId, this.apiService, getAuthToken, cache, offlineStore)
  //   const prescriptions = await helper.getData()

  //   const newId = prescriptions[prescriptions.length-1].id + 1
  //   prescriptions.push(new Prescription(newId, `Prescription item ${newId}`, `Prescription item ${newId} description`))

  //   await helper.storeDataOffline(prescriptions)

  //   console.log("[%s] Append prescriptions: END", logId)
  // }
}
