import { inject, Injectable } from "@angular/core";
import { EncryptionService } from "./encryption.service";
import { UserPreferencesService } from "../user-preferences/user-preference.service";
import { WebComponentFamily } from "src/app/models/wc-family.model";


export interface OfflineStoreDriver {
  init(): Promise<void>
  getItem(family:WebComponentFamily, key:string): Promise<any>
  setItem(family:WebComponentFamily, key:string, value:any): Promise<void>
  removeItem(family:WebComponentFamily, key:string): Promise<void>
  removeAllItems(family:WebComponentFamily): Promise<void>
}


@Injectable({
  providedIn: 'root'
})
export class OfflineStoreService {
  private readonly encryptionService = inject(EncryptionService)
  private readonly userPrefsService = inject(UserPreferencesService)
  private driver: OfflineStoreDriver|null = null

  private prefixKey(key:string): string {
    return `host_mobile:${key}`;
  }

  private async checkToWipeDatabase() {
    // iOS does not wipe out keychain data belonging to an app when being uninstalled
    // Additionally, iOS apps do not have a chance to take some actions during uninstall
    // Android keystore does however get deleted when an app is uninstalled.
    // The issue with this is that if a user uninstall the app, sell the phone to someone else
    // and that person reinstalls the same app -> they would have access to the offline data!
    // So, for iOS, we need to work with the user defaults to figure out whether the data should
    // be cleared or not: if a given boolean is not present in the UserDefaults this means either
    // a first-time install or a reinstall under another user. In both cases, data must be cleared.
    // See https://mas.owasp.org/MASTG/0x06d-Testing-Data-Storage/#keychain-data-persistence
    const hasRunBefore = await this.userPrefsService.getHasRunBefore();
    if (!hasRunBefore) {
      console.log("New install or reinstall in another user context. Wiping out offline data!")

      // Remove all offline data and generate a new encryption key
      for(const family of Object.values(WebComponentFamily)){
        await this.driver?.removeAllItems(family)
      }
      await this.encryptionService.reset()
      await this.userPrefsService.setHasRunBefore(true)
    }
  }


  async init(driver: OfflineStoreDriver): Promise<void> {
    this.driver = driver
    await this.encryptionService.init()
    await this.checkToWipeDatabase()
  }


  async get(family:WebComponentFamily, key:string): Promise<any> {
    const storeValue = await this.driver?.getItem(family, this.prefixKey(key))
    if (!storeValue){
      console.log("[OfflineService] get(%s): no value!", key)
      return null
    }

    if (!storeValue.encryption) {
      console.log("[OfflineService] get(%s): return unencrypted value", key)
      return storeValue.value
    }
    
    try {
      console.log("[OfflineService] get(%s): decrypt value", key)
      const decryptedValue =  this.encryptionService.decryptData(storeValue.value)
      return JSON.parse(decryptedValue)
    }
    catch(e) {
      console.log("[OfflineService] get(%s) ERROR:", key, e)
      return null;
    }
  }


  async set(family:WebComponentFamily, key:string, value:any, encryption:boolean = false): Promise<void> {
    const storeValue = {
      value,
      encryption
    }

    if (storeValue.encryption) {
      console.log("[OfflineService] set(%s): encrypt value", key)
      storeValue.value = this.encryptionService.encryptData(JSON.stringify(value))
    }

    console.log("[OfflineService] set(%s): store %s value", key, encryption?'encrypted':'unencrypted')
    this.driver?.setItem(family, this.prefixKey(key), storeValue)
  }


  async remove(family:WebComponentFamily, key:string): Promise<void> {
    console.log("[OfflineService] remove(%s)", key)
    this.driver?.removeItem(family, this.prefixKey(key))
  }
}
