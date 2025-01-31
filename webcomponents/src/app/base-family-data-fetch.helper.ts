import { BaseDataFetchHelper } from "@smals-belgium/myhealth-wc-integration-angular"
import { ComponentServices } from "@smals-belgium/myhealth-wc-integration"

export abstract class BaseFamilyDataFetchHelper<T> extends BaseDataFetchHelper<T> {
  constructor(logId:string, baseKey:string, services:ComponentServices) {
    super(logId, services, baseKey, `family-${baseKey}`, 5*60*1000)
  }

  protected async getAccessToken(): Promise<string|null> {
    return await this.services.getAccessToken('sample-audience')
  }
}
